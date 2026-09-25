import { useState } from 'react';
import { Icon } from './icons.jsx';
import { Select } from './ui.jsx';
import { FUNCTIONS } from '../data/roles.js';
import { LOCATIONS, INDUSTRIES, COMP_TYPES, EXPERIENCE_LEVELS } from '../data/market.js';

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

export function Filters({ filters, setFilter }) {
  return (
    <div className="filters">
      <Select label="Function" value="ra" onChange={() => {}} options={FUNCTIONS.map((f) => ({ value: f.key, label: f.enabled ? f.name : `${f.name} (coming soon)`, disabled: !f.enabled }))} />
      <Select label="Location" value={filters.location} onChange={(v) => setFilter('location', v)} options={LOCATIONS.map((l) => ({ value: l.key, label: l.name }))} />
      <Select label="Industry" value={filters.industry} onChange={(v) => setFilter('industry', v)} options={INDUSTRIES.map((i) => ({ value: i.key, label: i.name }))} />
      <Select label="Compensation Type" value={filters.compType} onChange={(v) => setFilter('compType', v)} options={COMP_TYPES.map((c) => ({ value: c.key, label: c.name }))} />
      <Select label="Experience Level" value={filters.experience} onChange={(v) => setFilter('experience', v)} options={EXPERIENCE_LEVELS.map((e) => ({ value: e.key, label: e.name }))} />
    </div>
  );
}

export function FunctionRail() {
  return (
    <aside className="rail">
      {FUNCTIONS.map((f) => (
        <button type="button" key={f.key} className={f.enabled ? 'on' : ''} disabled={!f.enabled} title={f.enabled ? f.name : 'Coming soon'}>
          <Icon name={f.icon} /><span>{f.name}{!f.enabled && <small>Coming soon</small>}</span>
        </button>
      ))}
    </aside>
  );
}
