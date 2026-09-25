// Compensation model: reference benchmark × location × (sub-industry ÷ function reference sub-industry), then the chosen compensation type.
import { ROLES, LEVELS, rolesFor } from '../data/roles.js';
import { findFunction } from '../data/functions.js';
import { findSub, groupOfSub, INDUSTRY_GROUPS } from '../data/industries.js';
import { LOCATIONS, COMP_TYPES, EXPERIENCE_LEVELS } from '../data/market.js';

export const findLocation = (key) => LOCATIONS.find((l) => l.key === key) || LOCATIONS[0];
export const findIndustry = (key) => findSub(key);          // sub-industry (carries group / groupName)
export const findGroupOf = (key) => groupOfSub(key);         // industry group of a sub-industry
export const findCompType = (key) => COMP_TYPES.find((c) => c.key === key) || COMP_TYPES[0];
export { INDUSTRY_GROUPS };

// Convert an annual-CTC lakh figure to the chosen display type. Returns a plain number in that type's unit.
export function toType(lakh, typeKey, settings) {
  const v = Number(lakh) || 0;
  switch (typeKey) {
    case 'ctc-monthly': return (v * 100000) / 12;                    // ₹ per month
    case 'fixed-annual': return v * (1 - (Number(settings.variablePayPct) || 0) / 100); // ₹ lakh fixed
    case 'ctc-usd': return (v * 100000) / (Number(settings.fxInrPerUsd) || 96);          // USD per year
    default: return v;                                                // ₹ lakh
  }
}

export function fmt(value, typeKey, opts = {}) {
  const v = Number(value) || 0;
  const short = opts.short;
  if (typeKey === 'ctc-monthly') return `₹${Math.round(v).toLocaleString('en-IN')}`;
  if (typeKey === 'ctc-usd') return `$${Math.round(v).toLocaleString('en-US')}`;
  return `₹${v.toFixed(1)}${short ? 'L' : ' L'}`;
}

export function unitLabel(typeKey) { return findCompType(typeKey).unit; }

// Benchmark for a role under the chosen location / sub-industry / compensation type.
// Each function's stored benchmarks are calibrated to its reference sub-industry (functions.js → refSub);
// the sub-industry factor is the selected index divided by that reference index.
export function benchmark(role, filters, settings) {
  const loc = findLocation(filters.location);
  const sub = findSub(filters.industry);
  const group = groupOfSub(filters.industry);
  const fn = findFunction(role.fn);
  const refSub = findSub(fn.refSub);
  const fnIndex = sub.index / refSub.index;
  const k = loc.index * fnIndex;
  const lakh = { low: role.comp.low * k, ref: role.comp.ref * k, high: role.comp.high * k };
  const hire = { low: lakh.ref * (Number(settings.hiringLowPct) || 90) / 100, high: lakh.ref * (Number(settings.hiringHighPct) || 120) / 100 };
  const t = filters.compType;
  return {
    lakh, hireLakh: hire,
    low: toType(lakh.low, t, settings), ref: toType(lakh.ref, t, settings), high: toType(lakh.high, t, settings),
    hireLow: toType(hire.low, t, settings), hireHigh: toType(hire.high, t, settings),
    index: k, fnIndex, location: loc, industry: sub, group, refSub, fn,
  };
}

export function filterRoles(filters) {
  const lvl = EXPERIENCE_LEVELS.find((e) => e.key === filters.experience) || EXPERIENCE_LEVELS[0];
  return rolesFor(filters.fn).filter((r) => r.expMax >= lvl.min && r.expMin < lvl.max)
    .filter((r) => !filters.family || filters.family === 'all' || r.family === filters.family)
    .filter((r) => !filters.search || `${r.title} ${r.family}`.toLowerCase().includes(filters.search.toLowerCase()));
}

const median = (arr) => { const a = [...arr].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length ? (a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2) : 0; };
export { median };

export function summary(roles, filters, settings) {
  const bms = roles.map((r) => benchmark(r, filters, settings));
  return {
    count: roles.length,
    median: median(bms.map((b) => b.ref)),
    min: bms.length ? Math.min(...bms.map((b) => b.low)) : 0,
    max: bms.length ? Math.max(...bms.map((b) => b.high)) : 0,
  };
}

// Experience-band aggregation for the trend chart: low / ref / high medians per band, within the selected function.
export function byExperience(filters, settings) {
  const bands = EXPERIENCE_LEVELS.filter((e) => e.key !== 'all');
  const pool = rolesFor(filters.fn);
  return bands.map((b) => {
    const rs = pool.filter((r) => r.expMin >= b.min && r.expMin < b.max);
    const bms = rs.map((r) => benchmark(r, filters, settings));
    return { band: b.name, count: rs.length, low: median(bms.map((x) => x.low)), ref: median(bms.map((x) => x.ref)), high: median(bms.map((x) => x.high)) };
  });
}

export function byFamily(filters, settings) {
  const pool = rolesFor(filters.fn);
  const fams = [...new Set(pool.map((r) => r.family))];
  return fams.map((f) => {
    const bms = pool.filter((r) => r.family === f).map((r) => benchmark(r, filters, settings));
    return { family: f, count: bms.length, ref: median(bms.map((b) => b.ref)) };
  }).sort((a, b) => b.ref - a.ref);
}

// Median reference across a function's roles for every sub-industry in a group, and for every group (median of its sub-industries).
export function bySubIndustry(filters, settings, groupKey) {
  const g = INDUSTRY_GROUPS.find((x) => x.key === groupKey) || groupOfSub(filters.industry);
  const pool = rolesFor(filters.fn);
  return g.subs.map((s) => ({ key: s.key, label: s.name, index: s.index, value: median(pool.map((r) => benchmark(r, { ...filters, industry: s.key }, settings).ref)) }));
}
export function byGroup(filters, settings) {
  const pool = rolesFor(filters.fn);
  return INDUSTRY_GROUPS.map((g) => ({ key: g.key, label: g.name, value: median(g.subs.flatMap((s) => pool.map((r) => benchmark(r, { ...filters, industry: s.key }, settings).ref))) }));
}

export const levelName = (code) => LEVELS[code] || code;

// Roles that sit near a given role in the market: same function, same family or overlapping experience.
export function comparables(role, filters, settings) {
  const target = benchmark(role, filters, settings).ref;
  return ROLES.filter((r) => r.fn === role.fn && r.id !== role.id && (r.family === role.family || (r.expMin < role.expMax && r.expMax > role.expMin)))
    .map((r) => ({ role: r, bm: benchmark(r, filters, settings) }))
    .sort((a, b) => Math.abs(a.bm.ref - target) - Math.abs(b.bm.ref - target))
    .slice(0, 6);
}
