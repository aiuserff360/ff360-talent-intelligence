// Home, Dashboard, Reports and Settings screens.
import { useMemo, useState } from 'react';
import { Icon } from '../components/icons.jsx';
import { Panel, Kpi, Tabs, Field, Chip } from '../components/ui.jsx';
import { GroupedColumns, HBars, Heatmap } from '../components/viz.jsx';
import { FUNCTIONS, ROLES, FAMILIES, LEVELS } from '../data/roles.js';
import { LOCATIONS, INDUSTRIES, COMP_TYPES, DEFAULT_SETTINGS } from '../data/market.js';
import { SOURCES, METHODOLOGY } from '../data/sources.js';
import { benchmark, byExperience, byFamily, fmt, unitLabel, findLocation, findIndustry, summary } from '../model/comp.js';
import { buildJd, jdToMarkdown, download } from '../model/jd.js';

const median = (arr) => { const a = [...arr].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length ? (a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2) : 0; };

export function Home({ go, settings }) {
  const enabled = FUNCTIONS.filter((f) => f.enabled).length;
  return (
    <div className="page">
      <div className="hero">
        <div>
          <span className="eyebrow">Future Factor 360 · Talent Market Intelligence</span>
          <h2>Know what the market pays <em>before you make the offer.</em></h2>
          <p>A role library with market-referenced compensation, hiring ranges and ready-to-use job descriptions for building capability centers in India. Select a function, location and industry and every number updates.</p>
          <div className="inline" style={{ marginTop: 18 }}><button type="button" className="btn primary" onClick={() => go('library')}><Icon name="library" />Open the Role Library</button><button type="button" className="btn" style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.25)', color: '#fff' }} onClick={() => go('dashboard')}><Icon name="chart" />View Dashboard</button></div>
        </div>
        <div className="stats">
          <div className="stat"><b>{ROLES.length}</b><span>Regulatory Affairs roles with JDs</span></div>
          <div className="stat"><b>{LOCATIONS.length}</b><span>Indian cities benchmarked</span></div>
          <div className="stat"><b>{INDUSTRIES.length}</b><span>Industries with pay indices</span></div>
          <div className="stat"><b>{Object.keys(SOURCES).length}</b><span>Public sources · {settings.dataAsOf}</span></div>
        </div>
      </div>
      <div className="steps">
        <div className="step"><b>1</b><h4>Choose the market</h4><p>Function, location, industry, compensation type and experience level drive every figure.</p></div>
        <div className="step"><b>2</b><h4>Explore the role library</h4><p>Market low, reference and high per role with demand signals and role families.</p></div>
        <div className="step"><b>3</b><h4>Open the role profile</h4><p>Purpose, responsibilities, skills, regulatory knowledge, comparables and a recommended hiring range.</p></div>
        <div className="step"><b>4</b><h4>Generate the JD</h4><p>View, edit and export a market-aligned job description for recruiters and hiring managers.</p></div>
      </div>
      <div className="page-title"><h2>Functions</h2><p>{enabled} of {FUNCTIONS.length} functions enabled in this release. Regulatory Affairs is live; the others follow the same model and are being populated.</p></div>
      <div className="cards">
        {FUNCTIONS.map((f) => (
          <div key={f.key} className={`card ${f.enabled ? '' : 'off'}`}>
            <Icon name={f.icon} /><h3>{f.name}</h3>
            <p>{f.enabled ? `${ROLES.length} roles across ${FAMILIES.length} families, benchmarked in ${LOCATIONS.length} cities and ${INDUSTRIES.length} industries.` : 'Role library, benchmarks and JDs coming soon.'}</p>
            {f.enabled ? <button type="button" className="btn primary sm" onClick={() => go('library')}>Open</button> : <span className="chip soft">Coming soon</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard({ filters, settings, go, setSelectedId }) {
  const t = filters.compType; const f = (v) => fmt(v, t, { short: true });
  const short = (v) => (t === 'ctc-monthly' ? `₹${(v / 1000).toFixed(0)}K` : t === 'ctc-usd' ? `$${(v / 1000).toFixed(0)}K` : v.toFixed(v >= 10 ? 0 : 1));
  const all = summary(ROLES, filters, settings);
  const byCity = LOCATIONS.map((l) => ({ label: l.name, value: median(ROLES.map((r) => benchmark(r, { ...filters, location: l.key }, settings).ref)) })).sort((a, b) => b.value - a.value);
  const byInd = INDUSTRIES.map((i) => ({ label: i.name, value: median(ROLES.map((r) => benchmark(r, { ...filters, industry: i.key }, settings).ref)) })).sort((a, b) => b.value - a.value);
  const trend = byExperience(filters, settings);
  const fam = byFamily(filters, settings);
  const hot = [...ROLES].sort((a, b) => b.demand - a.demand || benchmark(b, filters, settings).ref - benchmark(a, filters, settings).ref).slice(0, 6);
  const famRows = FAMILIES.map((fm) => ({ key: fm, name: fm }));
  const cityCols = LOCATIONS.map((l) => ({ key: l.key, name: l.name }));
  const cell = (r, c) => median(ROLES.filter((x) => x.family === r.key).map((x) => benchmark(x, { ...filters, location: c.key }, settings).ref));
  const loc = findLocation(filters.location); const ind = findIndustry(filters.industry);
  return (
    <div className="page">
      <div className="page-title"><h2>Dashboard</h2><p>Regulatory Affairs market view for {ind.name} · {loc.name} shown in {unitLabel(t)}. Change the filters above to re-cut every chart.</p></div>
      <div className="kpis">
        <Kpi icon="people" label="Roles benchmarked" value={ROLES.length} sub={`${FAMILIES.length} role families · ${Object.values(LEVELS).length} levels`} />
        <Kpi icon="chart" label="Median market reference" value={f(all.median)} sub={`${loc.name} · ${ind.name}`} />
        <Kpi icon="trend" label="Entry to head multiple" value={`${(benchmark(ROLES[ROLES.length - 1], filters, settings).ref / benchmark(ROLES[0], filters, settings).ref).toFixed(1)}×`} sub="RA Head reference ÷ RA Associate reference" />
        <Kpi icon="target" label="High-demand roles" value={ROLES.filter((r) => r.demand >= 4).length} sub="Demand 4 or 5 of 5" />
      </div>
      <div className="grid-2">
        <Panel title="Median reference by city" subtitle={`All RA roles · ${ind.name}`}><HBars data={byCity} format={f} /></Panel>
        <Panel title="Median reference by industry" subtitle={`All RA roles · ${loc.name}`}><HBars data={byInd} format={f} color="#eb6834" /></Panel>
      </div>
      <div className="grid-2">
        <Panel title="Compensation by experience level" subtitle="Median low / reference / high per band"><GroupedColumns data={trend.filter((b) => b.count).map((b) => ({ label: b.band, values: [b.low, b.ref, b.high] }))} series={[{ name: 'Market Low', color: '#86b6ef' }, { name: 'Market Reference', color: '#2a78d6' }, { name: 'Market High', color: '#104281' }]} format={short} yLabel={unitLabel(t)} height={260} /></Panel>
        <Panel title="Roles in demand" subtitle="Highest market demand first" tight>
          <div className="table-wrap"><table><thead><tr><th>Role</th><th>Family</th><th className="num">Reference</th><th>Demand</th></tr></thead><tbody>
            {hot.map((r) => <tr key={r.id} className="row" onClick={() => { setSelectedId(r.id); go('library'); }}><td><span className="name">{r.title}</span></td><td>{r.family}</td><td className="num">{f(benchmark(r, filters, settings).ref)}</td><td><Chip tone={r.demand >= 5 ? 'good' : r.demand === 4 ? '' : 'soft'}>{['', 'Low', 'Moderate', 'Steady', 'High', 'Very high'][r.demand]}</Chip></td></tr>)}
          </tbody></table></div>
        </Panel>
      </div>
      <Panel title="Median reference by role family and city" subtitle={`${ind.name} · ${unitLabel(t)}`}><Heatmap rows={famRows} cols={cityCols} value={cell} format={f} /></Panel>
      <Panel title="Role families" tight>
        <div className="table-wrap"><table><thead><tr><th>Family</th><th className="num">Roles</th><th className="num">Median reference</th><th>Levels</th></tr></thead><tbody>
          {fam.map((x) => <tr key={x.family}><td><span className="name">{x.family}</span></td><td className="num">{x.count}</td><td className="num">{f(x.ref)}</td><td>{[...new Set(ROLES.filter((r) => r.family === x.family).map((r) => r.level))].sort().join(', ')}</td></tr>)}
        </tbody></table></div>
      </Panel>
    </div>
  );
}

export function Reports({ filters, settings, jdEdits, toast }) {
  const [type, setType] = useState('benchmark');
  const t = filters.compType; const f = (v) => fmt(v, t, { short: true });
  const loc = findLocation(filters.location); const ind = findIndustry(filters.industry);
  const csv = (rows, name) => { const q = (s) => `"${String(s).replace(/"/g, '""')}"`; download(name, rows.map((r) => r.map(q).join(',')).join('\n'), 'text/csv'); toast('CSV downloaded'); };
  const benchRows = ROLES.map((r) => { const b = benchmark(r, filters, settings); return [r.title, r.family, r.level, `${r.expMin}–${r.expMax}`, b.low, b.ref, b.high, b.hireLow, b.hireHigh, r.demand]; });
  const cityRows = ROLES.map((r) => [r.title, ...LOCATIONS.map((l) => benchmark(r, { ...filters, location: l.key }, settings).ref)]);
  const indRows = ROLES.map((r) => [r.title, ...INDUSTRIES.map((i) => benchmark(r, { ...filters, industry: i.key }, settings).ref)]);
  const jdPack = () => { const md = ROLES.map((r) => jdToMarkdown(buildJd(r, benchmark(r, filters, settings), filters, settings, jdEdits[r.id] || {}))).join('\n\n---\n\n'); download(`regulatory-affairs-jd-pack-${loc.key}-${ind.key}.md`, md, 'text/markdown'); toast('JD pack downloaded (Markdown)'); };
  return (
    <div className="page">
      <div className="page-title"><h2>Reports</h2><p>Export-ready benchmark sheets for {loc.name} · {ind.name} in {unitLabel(t)}. Every report uses the current filters.</p></div>
      <Tabs tabs={[['benchmark', 'Role benchmark sheet'], ['city', 'City comparison'], ['industry', 'Industry comparison'], ['jd', 'JD pack'], ['method', 'Methodology & sources']]} value={type} onChange={setType} />
      {type === 'benchmark' && (
        <Panel title="Role benchmark sheet" subtitle="Market low / reference / high and the recommended hiring range for every role" tight actions={<><button type="button" className="btn" onClick={() => csv([['Role', 'Family', 'Level', 'Experience', `Low (${unitLabel(t)})`, 'Reference', 'High', 'Hiring low', 'Hiring high', 'Demand (1-5)'], ...benchRows.map((r) => r.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)))], `ra-benchmark-${loc.key}-${ind.key}.csv`)}><Icon name="download" />CSV</button><button type="button" className="btn" onClick={() => window.print()}><Icon name="print" />Print</button></>}>
          <div className="table-wrap"><table><thead><tr><th>Role</th><th>Family</th><th>Level</th><th className="num">Exp</th><th className="num">Low</th><th className="num">Reference</th><th className="num">High</th><th className="num">Hiring range</th><th>Demand</th></tr></thead><tbody>
            {ROLES.map((r) => { const b = benchmark(r, filters, settings); return <tr key={r.id}><td><span className="name">{r.title}</span></td><td>{r.family}</td><td>{r.level}</td><td className="num">{r.expMin}–{r.expMax}</td><td className="num">{f(b.low)}</td><td className="num ref">{f(b.ref)}</td><td className="num">{f(b.high)}</td><td className="num">{f(b.hireLow)} – {f(b.hireHigh)}</td><td>{'●'.repeat(r.demand)}{'○'.repeat(5 - r.demand)}</td></tr>; })}
          </tbody></table></div>
        </Panel>
      )}
      {type === 'city' && (
        <Panel title="Market reference by city" subtitle={`${ind.name} · ${unitLabel(t)}`} tight actions={<button type="button" className="btn" onClick={() => csv([['Role', ...LOCATIONS.map((l) => l.name)], ...cityRows.map((r) => r.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)))], `ra-by-city-${ind.key}.csv`)}><Icon name="download" />CSV</button>}>
          <div className="table-wrap"><table><thead><tr><th>Role</th>{LOCATIONS.map((l) => <th key={l.key} className="num">{l.name}<br /><span style={{ textTransform: 'none', fontWeight: 500 }}>index {l.index.toFixed(2)}</span></th>)}</tr></thead><tbody>
            {cityRows.map((row) => <tr key={row[0]}><td><span className="name">{row[0]}</span></td>{row.slice(1).map((v, i) => <td key={i} className="num">{f(v)}</td>)}</tr>)}
          </tbody></table></div>
        </Panel>
      )}
      {type === 'industry' && (
        <Panel title="Market reference by industry" subtitle={`${loc.name} · ${unitLabel(t)}`} tight actions={<button type="button" className="btn" onClick={() => csv([['Role', ...INDUSTRIES.map((i) => i.name)], ...indRows.map((r) => r.map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)))], `ra-by-industry-${loc.key}.csv`)}><Icon name="download" />CSV</button>}>
          <div className="table-wrap"><table><thead><tr><th>Role</th>{INDUSTRIES.map((i) => <th key={i.key} className="num">{i.name}<br /><span style={{ textTransform: 'none', fontWeight: 500 }}>index {i.index.toFixed(2)}</span></th>)}</tr></thead><tbody>
            {indRows.map((row) => <tr key={row[0]}><td><span className="name">{row[0]}</span></td>{row.slice(1).map((v, i) => <td key={i} className="num">{f(v)}</td>)}</tr>)}
          </tbody></table></div>
        </Panel>
      )}
      {type === 'jd' && (
        <Panel title="Job description pack" subtitle={`All ${ROLES.length} Regulatory Affairs JDs with compensation guidance for ${loc.name} · ${ind.name}`} actions={<button type="button" className="btn primary" onClick={jdPack}><Icon name="download" />Download JD pack</button>}>
          <div className="table-wrap"><table><thead><tr><th>Role</th><th>Level</th><th>Family</th><th className="num">Hiring range</th><th>Edited</th></tr></thead><tbody>
            {ROLES.map((r) => { const b = benchmark(r, filters, settings); return <tr key={r.id}><td><span className="name">{r.title}</span></td><td>{r.level} · {LEVELS[r.level]}</td><td>{r.family}</td><td className="num">{f(b.hireLow)} – {f(b.hireHigh)}</td><td>{jdEdits[r.id] ? <Chip tone="warn">Customised</Chip> : <Chip tone="soft">Template</Chip>}</td></tr>; })}
          </tbody></table></div>
        </Panel>
      )}
      {type === 'method' && (
        <div className="grid-2">
          <Panel title="Methodology"><ul className="sources-list">{METHODOLOGY.map((m) => <li key={m}>{m}</li>)}</ul></Panel>
          <Panel title="Sources consulted" subtitle={`Public data reviewed in ${settings.dataAsOf}`}><ul className="sources-list">{Object.values(SOURCES).map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> <span className="muted">· {s.type}</span></li>)}</ul></Panel>
        </div>
      )}
    </div>
  );
}

export function Settings({ settings, setSettings, filters, setFilter, jdEdits, setJdEdits, toast }) {
  const set = (k, parse = Number) => (e) => setSettings({ ...settings, [k]: parse(e.target.value) });
  return (
    <div className="page">
      <div className="page-title"><h2>Settings</h2><p>Display defaults, conversion factors and hiring-range rules used across the library, dashboard and reports.</p></div>
      <div className="settings-grid">
        <Panel title="Display defaults">
          <Field label="Default compensation type"><select value={filters.compType} onChange={(e) => setFilter('compType', e.target.value)}>{COMP_TYPES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</select></Field>
          <Field label="Default location" ><select value={filters.location} onChange={(e) => setFilter('location', e.target.value)}>{LOCATIONS.map((l) => <option key={l.key} value={l.key}>{l.name}</option>)}</select></Field>
          <Field label="Default industry"><select value={filters.industry} onChange={(e) => setFilter('industry', e.target.value)}>{INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{i.name}</option>)}</select></Field>
        </Panel>
        <Panel title="Conversion factors">
          <Field label="INR per USD" hint="ECB reference rate, 24 September 2026"><input type="number" step="0.01" value={settings.fxInrPerUsd} onChange={set('fxInrPerUsd')} /></Field>
          <Field label="Variable pay share of CTC (%)" hint="Removed when showing annual fixed pay"><input type="number" step="1" value={settings.variablePayPct} onChange={set('variablePayPct')} /></Field>
          <Field label="Data as of"><input value={settings.dataAsOf} onChange={set('dataAsOf', String)} /></Field>
        </Panel>
        <Panel title="Hiring range rule">
          <Field label="Hiring range low (% of market reference)"><input type="number" step="1" value={settings.hiringLowPct} onChange={set('hiringLowPct')} /></Field>
          <Field label="Hiring range high (% of market reference)"><input type="number" step="1" value={settings.hiringHighPct} onChange={set('hiringHighPct')} /></Field>
          <div className="inline" style={{ marginTop: 10 }}><button type="button" className="btn" onClick={() => { setSettings({ ...DEFAULT_SETTINGS }); toast('Settings reset'); }}><Icon name="reset" />Reset to defaults</button><button type="button" className="btn" onClick={() => { setJdEdits({}); toast('All JD edits cleared'); }}><Icon name="trash" />Clear JD edits ({Object.keys(jdEdits).length})</button></div>
        </Panel>
      </div>
      <div className="grid-2">
        <Panel title="Location indices" subtitle="Relative to Bengaluru = 1.00" tight><div className="table-wrap"><table><thead><tr><th>City</th><th className="num">Index</th><th>Tier</th><th>Cluster</th><th>Basis</th></tr></thead><tbody>{LOCATIONS.map((l) => <tr key={l.key}><td><span className="name">{l.name}</span></td><td className="num">{l.index.toFixed(2)}</td><td>Tier {l.tier}</td><td className="muted" style={{ fontSize: 12 }}>{l.cluster}</td><td className="muted" style={{ fontSize: 12 }}>{l.note}</td></tr>)}</tbody></table></div></Panel>
        <Panel title="Industry indices" subtitle="Relative to Medical devices = 1.00" tight><div className="table-wrap"><table><thead><tr><th>Industry</th><th className="num">Index</th><th>Basis</th></tr></thead><tbody>{INDUSTRIES.map((i) => <tr key={i.key}><td><span className="name">{i.name}</span></td><td className="num">{i.index.toFixed(2)}</td><td className="muted" style={{ fontSize: 12 }}>{i.note}</td></tr>)}</tbody></table></div></Panel>
      </div>
      <Panel title="Functions"><div className="chips">{FUNCTIONS.map((fn) => <Chip key={fn.key} tone={fn.enabled ? 'good' : 'soft'}>{fn.name}{fn.enabled ? ' · enabled' : ' · coming soon'}</Chip>)}</div></Panel>
    </div>
  );
}
