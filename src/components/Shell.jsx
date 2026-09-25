import { useState } from 'react';
import { Icon } from './icons.jsx';
import { Select } from './ui.jsx';
import { FUNCTIONS } from '../data/functions.js';
import { INDUSTRY_GROUPS, groupOfSub } from '../data/industries.js';
import { LOCATIONS, COMP_TYPES, EXPERIENCE_LEVELS } from '../data/market.js';
import { CURRENCIES } from '../data/currencies.js';

export const NAV = [['home', 'Home', 'home'], ['dashboard', 'Dashboard', 'chart'], ['library', 'Role Library', 'library'], ['reports', 'Reports', 'doc'], ['settings', 'Settings', 'gear']];

export function Header({ page, go }) {
  const [missing, setMissing] = useState(false);
  return (
    <header className="header">
      <div className="brand">{missing ? <span className="fallback">FUTURE FACTOR</span> : <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Future Factor" onError={() => setMissing(true)} />}</div>
      <div className="title">
        <h1>Compensation Modeller</h1>
        <p>Role-based market compensation modelling · Future Factor 360 Talent Market Intelligence</p>
      </div>
      <nav className="nav">
        {NAV.map(([k, l, icon]) => <button type="button" key={k} className={page === k ? 'on' : ''} onClick={() => go(k)}><Icon name={icon} /><span>{l}</span></button>)}
      </nav>
    </header>
  );
}

// Industry is two-level: pick the industry group, then a sub-industry inside it. Only the sub-industry key is stored
// (filters.industry); the group is derived from it, and changing the group jumps to that group's first sub-industry.
export function Filters({ filters, setFilter }) {
  const group = groupOfSub(filters.industry);
  return (
    <div className="filters">
      <Select label="Function" value={filters.fn} onChange={(v) => setFilter('fn', v)} options={FUNCTIONS.map((f) => ({ value: f.key, label: f.name }))} />
      <Select label="Location" value={filters.location} onChange={(v) => setFilter('location', v)} options={LOCATIONS.map((l) => ({ value: l.key, label: l.name }))} />
      <Select label="Industry" value={group.key} onChange={(v) => setFilter('industry', INDUSTRY_GROUPS.find((g) => g.key === v).subs[0].key)} options={INDUSTRY_GROUPS.map((g) => ({ value: g.key, label: g.name }))} />
      <Select label="Sub-industry" value={filters.industry} onChange={(v) => setFilter('industry', v)} options={group.subs.map((s) => ({ value: s.key, label: s.name }))} />
      <Select label="Compensation Type" value={filters.compType} onChange={(v) => setFilter('compType', v)} options={COMP_TYPES.map((c) => ({ value: c.key, label: c.name }))} />
      <Select label="Currency" value={filters.currency} onChange={(v) => setFilter('currency', v)} options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }))} />
      <Select label="Experience Level" value={filters.experience} onChange={(v) => setFilter('experience', v)} options={EXPERIENCE_LEVELS.map((e) => ({ value: e.key, label: e.name }))} />
    </div>
  );
}

export function FunctionRail({ fn, onSelect }) {
  return (
    <aside className="rail">
      {FUNCTIONS.map((f) => (
        <button type="button" key={f.key} className={fn === f.key ? 'on' : ''} title={f.description} onClick={() => onSelect(f.key)}>
          <Icon name={f.icon} /><span>{f.name}</span>
        </button>
      ))}
    </aside>
  );
}
