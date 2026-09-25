// Compensation model: reference benchmark × location × industry, then the chosen compensation type.
import { ROLES, LEVELS } from '../data/roles.js';
import { LOCATIONS, INDUSTRIES, COMP_TYPES, EXPERIENCE_LEVELS } from '../data/market.js';

export const findLocation = (key) => LOCATIONS.find((l) => l.key === key) || LOCATIONS[0];
export const findIndustry = (key) => INDUSTRIES.find((i) => i.key === key) || INDUSTRIES[0];
export const findCompType = (key) => COMP_TYPES.find((c) => c.key === key) || COMP_TYPES[0];

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

// Benchmark for a role under the chosen location / industry / compensation type.
export function benchmark(role, filters, settings) {
  const loc = findLocation(filters.location);
  const ind = findIndustry(filters.industry);
  const k = loc.index * ind.index;
  const lakh = { low: role.comp.low * k, ref: role.comp.ref * k, high: role.comp.high * k };
  const hire = { low: lakh.ref * (Number(settings.hiringLowPct) || 90) / 100, high: lakh.ref * (Number(settings.hiringHighPct) || 120) / 100 };
  const t = filters.compType;
  return {
    lakh, hireLakh: hire,
    low: toType(lakh.low, t, settings), ref: toType(lakh.ref, t, settings), high: toType(lakh.high, t, settings),
    hireLow: toType(hire.low, t, settings), hireHigh: toType(hire.high, t, settings),
    index: k, location: loc, industry: ind,
  };
}

export function filterRoles(filters) {
  const lvl = EXPERIENCE_LEVELS.find((e) => e.key === filters.experience) || EXPERIENCE_LEVELS[0];
  return ROLES.filter((r) => r.expMax >= lvl.min && r.expMin < lvl.max)
    .filter((r) => !filters.family || filters.family === 'all' || r.family === filters.family)
    .filter((r) => !filters.search || `${r.title} ${r.family}`.toLowerCase().includes(filters.search.toLowerCase()));
}

const median = (arr) => { const a = [...arr].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length ? (a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2) : 0; };

export function summary(roles, filters, settings) {
  const bms = roles.map((r) => benchmark(r, filters, settings));
  return {
    count: roles.length,
    median: median(bms.map((b) => b.ref)),
    min: bms.length ? Math.min(...bms.map((b) => b.low)) : 0,
    max: bms.length ? Math.max(...bms.map((b) => b.high)) : 0,
  };
}

// Experience-band aggregation for the trend chart: low / ref / high medians per band.
export function byExperience(filters, settings) {
  const bands = EXPERIENCE_LEVELS.filter((e) => e.key !== 'all');
  return bands.map((b) => {
    const rs = ROLES.filter((r) => r.expMin >= b.min && r.expMin < b.max);
    const bms = rs.map((r) => benchmark(r, filters, settings));
    return { band: b.name, count: rs.length, low: median(bms.map((x) => x.low)), ref: median(bms.map((x) => x.ref)), high: median(bms.map((x) => x.high)) };
  });
}

export function byFamily(filters, settings) {
  const fams = [...new Set(ROLES.map((r) => r.family))];
  return fams.map((f) => {
    const bms = ROLES.filter((r) => r.family === f).map((r) => benchmark(r, filters, settings));
    return { family: f, count: bms.length, ref: median(bms.map((b) => b.ref)) };
  }).sort((a, b) => b.ref - a.ref);
}

export const levelName = (code) => LEVELS[code] || code;

// Roles that sit near a given role in the market: same family or overlapping experience.
export function comparables(role, filters, settings) {
  return ROLES.filter((r) => r.id !== role.id && (r.family === role.family || (r.expMin < role.expMax && r.expMax > role.expMin)))
    .map((r) => ({ role: r, bm: benchmark(r, filters, settings) }))
    .sort((a, b) => Math.abs(a.bm.ref - benchmark(role, filters, settings).ref) - Math.abs(b.bm.ref - benchmark(role, filters, settings).ref))
    .slice(0, 6);
}
