import { useMemo, useState } from 'react';
import { Icon } from '../components/icons.jsx';
import { Panel, Kpi, Tabs, Chip, DemandBars, Modal, Field } from '../components/ui.jsx';
import { GroupedColumns, HBars, BellCurve, RangeStrip } from '../components/viz.jsx';
import { FunctionRail } from '../components/Shell.jsx';
import { ROLES, LEVELS, rolesFor } from '../data/roles.js';
import { findFunction } from '../data/functions.js';
import { SOURCES } from '../data/sources.js';
import { benchmark, filterRoles, summary, byExperience, byFamily, fmt, unitLabel, shortFmt, comparables, inAllCurrencies, findCurrency } from '../model/comp.js';
import { buildJd, jdToText, jdToMarkdown, download, slug } from '../model/jd.js';

const exp = (r) => `${r.expMin} – ${r.expMax >= 25 ? '' : r.expMax}${r.expMax >= 25 ? '15+' : ''}`.replace('15 – 15+', '15+');

export function RoleLibrary({ filters, setFilter, settings, selectedId, setSelectedId, jdEdits, setJdEdits, toast }) {
  const fnDef = findFunction(filters.fn);
  const pool = rolesFor(fnDef.key);
  const roles = useMemo(() => filterRoles(filters), [filters]);
  const selected = pool.find((r) => r.id === selectedId) || roles[0] || pool[0];
  const sm = summary(roles, filters, settings);
  const bmSel = benchmark(selected, filters, settings);
  const t = filters;
  const f = (v) => fmt(v, filters, { short: true });
  const trend = byExperience(filters, settings);
  const fam = byFamily(filters, settings);
  const short = shortFmt(filters);
  const fc = (v) => { const x = f(v); return x.length > 9 ? short(v) : x; };   // compact marker labels for long currency strings

  return (
    <div className="workspace">
      <FunctionRail fn={fnDef.key} onSelect={(k) => setFilter('fn', k)} />
      <div className="center">
        <div className="kpis">
          <Kpi icon="people" label="Roles in Library" value={sm.count} sub={fnDef.name} />
          <Kpi icon="chart" label="Median Compensation" value={f(sm.median)} sub={`All ${fnDef.name} roles · ${unitLabel(t)}`} />
          <Kpi icon="trend" label="Total Compensation Range" value={`${f(sm.min)} – ${f(sm.max)}`} sub="Market low – high" />
          <Kpi icon="target" label="Recommended Hiring Range" value={`${f(bmSel.hireLow)} – ${f(bmSel.hireHigh)}`} sub={`Selected role · ${selected.title}`} />
        </div>

        <Panel title={`${fnDef.name} – Role Library`} subtitle={`${bmSel.location.name} · ${bmSel.group.name} › ${bmSel.industry.name} · ${unitLabel(t)} · data as of ${settings.dataAsOf}`} tight>
          <div className="table-wrap">
            <table className={`library-table ${f(sm.max).length > 9 ? 'wide' : ''}`}>
              <thead>
                <tr><th rowSpan={2}>Role Title</th><th rowSpan={2}>Role Family</th><th rowSpan={2} className="num">Exp. (Years)</th><th colSpan={3} className="group">Compensation ({unitLabel(t)})</th><th rowSpan={2}>Demand</th></tr>
                <tr><th className="num">Market Low</th><th className="num">Market Reference</th><th className="num">Market High</th></tr>
              </thead>
              <tbody>
                {roles.map((r) => { const bm = benchmark(r, filters, settings); return (
                  <tr key={r.id} className={`row ${selected.id === r.id ? 'on' : ''}`} onClick={() => setSelectedId(r.id)}>
                    <td><span className="name">{r.title}</span></td>
                    <td>{r.family}</td>
                    <td className="num">{exp(r)}</td>
                    <td className="num">{f(bm.low)}</td>
                    <td className="num ref">{f(bm.ref)}</td>
                    <td className="num">{f(bm.high)}</td>
                    <td><DemandBars level={r.demand} /></td>
                  </tr>
                ); })}
                {!roles.length && <tr><td colSpan={7} className="empty">No roles match the selected experience level.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="charts">
          <Panel title="Compensation Trend by Experience Level" subtitle={`${fnDef.name} – all roles · median of market low / reference / high per band`}>
            <GroupedColumns data={trend.filter((b) => b.count).map((b) => ({ label: b.band.replace(' years', '').replace(' – ', '–'), values: [b.low, b.ref, b.high] }))} series={[{ name: 'Market Low', color: '#86b6ef' }, { name: 'Market Reference', color: '#2a78d6' }, { name: 'Market High', color: '#104281' }]} format={short} yLabel={unitLabel(t)} height={250} xLabel="Experience level (years)" />
          </Panel>
          <Panel title="Market Positioning" subtitle={selected.title}>
            <BellCurve low={bmSel.low} ref={bmSel.ref} high={bmSel.high} format={fc} height={170} />
            <RangeStrip low={bmSel.low} ref={bmSel.ref} high={bmSel.high} hireLow={bmSel.hireLow} hireHigh={bmSel.hireHigh} format={fc} />
          </Panel>
          <Panel title="Compensation by Role Family" subtitle="Median market reference across the family's roles" className="span">
            <HBars data={fam.map((x) => ({ label: x.family, value: x.ref }))} format={f} rowH={24} />
          </Panel>
        </div>
      </div>

      <RoleDrawer role={selected} bm={bmSel} fnDef={fnDef} filters={filters} settings={settings} jdEdits={jdEdits} setJdEdits={setJdEdits} toast={toast} onSelect={setSelectedId} />
    </div>
  );
}

function RoleDrawer({ role, bm, fnDef, filters, settings, jdEdits, setJdEdits, toast, onSelect }) {
  const [tab, setTab] = useState('details');
  const [modal, setModal] = useState(null); // 'view' | 'edit'
  const f = (v) => fmt(v, filters, { short: true });
  const cur = findCurrency(filters.currency);
  const edits = jdEdits[role.id] || {};
  const jd = buildJd(role, bm, filters, settings, edits);
  const comps = comparables(role, filters, settings);
  const monthly = (bm.lakh.ref * 100000) / 12; const fixed = bm.lakh.ref * (1 - settings.variablePayPct / 100);
  const others = inAllCurrencies(bm.lakh.ref, filters, settings).filter((x) => x.currency.code !== filters.currency);

  const exportJd = () => { download(`${slug(role.title)}-jd.md`, jdToMarkdown(jd), 'text/markdown'); download(`${slug(role.title)}-jd.txt`, jdToText(jd)); toast('JD exported as Markdown and text'); };
  const copyJd = async () => { try { await navigator.clipboard.writeText(jdToText(jd)); toast('JD copied to clipboard'); } catch { toast('Copy not available; use Export'); } };
  const regenerate = () => { setJdEdits((e) => { const n = { ...e }; delete n[role.id]; return n; }); setModal('view'); toast('JD regenerated from the role template and current market data'); };

  return (
    <aside className="drawer">
      <div className="drawer-head"><h2>Role Profile / Job Description</h2><span className="chip soft">{fnDef.name}</span></div>
      <div className="drawer-body">
        <div className="role-title"><h3>{role.title}</h3><Chip>{role.level}</Chip><span className="chip soft">{LEVELS[role.level]}</span></div>
        <div className="role-meta"><span>{role.family}</span><span>{exp(role)} Years</span><span>{bm.location.name}</span><span>{bm.group.name} › {bm.industry.name}</span></div>
        <div className="tiles">
          <div className="tile"><b>{f(bm.low)}</b><span>Market Low</span></div>
          <div className="tile ref"><b>{f(bm.ref)}</b><span>Market Reference</span></div>
          <div className="tile"><b>{f(bm.high)}</b><span>Market High</span></div>
        </div>
        <div className="hire-box"><small>Recommended Hiring Range (Future Factor)</small><b>{f(bm.hireLow)} – {f(bm.hireHigh)}</b><span>{settings.hiringLowPct}%–{settings.hiringHighPct}% of market reference, adjusted for {bm.location.name} and {bm.industry.name}</span></div>

        <Tabs small tabs={[['details', 'Role Details'], ['comp', 'Compensation Insights'], ['comparables', 'Market Comparables'], ['jd', 'JD Preview']]} value={tab} onChange={setTab} />

        {tab === 'details' && (
          <>
            <div className="section"><h4><Icon name="target" />Role Purpose</h4><p>{jd.summary}</p></div>
            <div className="section"><h4><Icon name="doc" />Key Responsibilities</h4><ul>{jd.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className="section"><h4><Icon name="gear" />Core Skills</h4><div className="chips">{jd.skills.map((x) => <span className="chip soft" key={x}>{x}</span>)}</div></div>
            <div className="section"><h4><Icon name="library" />{fnDef.knowledgeLabel}</h4><div className="chips">{jd.knowledge.map((x) => <span className="chip" key={x}>{x}</span>)}</div></div>
            <div className="section"><h4><Icon name="people" />Preferred Experience</h4><ul>{jd.preferred.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className="section"><h4><Icon name="quality" />Education</h4><p>{jd.education}</p></div>
          </>
        )}
        {tab === 'comp' && (
          <>
            <div className="section"><h4><Icon name="chart" />How this benchmark is built</h4><p>Reference market for {fnDef.name} is Bengaluru · {bm.refSub.name}: ₹{role.comp.low}L – ₹{role.comp.ref}L – ₹{role.comp.high}L. Adjusted by location index {bm.location.index.toFixed(2)} ({bm.location.name}) and sub-industry factor {bm.fnIndex.toFixed(2)} ({bm.industry.name} index {bm.industry.index.toFixed(2)} ÷ {bm.refSub.name} index {bm.refSub.index.toFixed(2)}) = combined {bm.index.toFixed(2)}.</p></div>
            <div className="insight-grid">
              <div className="tile"><span>Annual CTC (reference)</span><b>₹{bm.lakh.ref.toFixed(1)} L</b></div>
              <div className="tile"><span>Monthly CTC</span><b>₹{Math.round(monthly).toLocaleString('en-IN')}</b></div>
              <div className="tile"><span>Annual fixed pay (excl. {settings.variablePayPct}% variable)</span><b>₹{fixed.toFixed(1)} L</b></div>
              <div className="tile"><span>Shown in {cur.code} at {cur.code === 'INR' ? 'reference' : `₹${(settings.fxPerUsd.INR / settings.fxPerUsd[cur.code]).toFixed(2)} per ${cur.code}`}</span><b>{f(bm.ref)}</b></div>
              <div className="tile"><span>Spread (high ÷ low)</span><b>{(bm.high / bm.low).toFixed(2)}×</b></div>
              <div className="tile"><span>Market demand</span><b><DemandBars level={role.demand} /> {['', 'Low', 'Moderate', 'Steady', 'High', 'Very high'][role.demand]}</b></div>
            </div>
            <div className="section" style={{ marginTop: 12 }}><h4><Icon name="globe" />Same reference in other currencies</h4><p className="muted" style={{ fontSize: 12 }}>One rupee figure converted through the ECB rate table (24 September 2026), so every currency view is equivalent.</p>
              <div className="cur-grid">{others.map((x) => <div className="tile" key={x.currency.code}><span>{x.currency.code} · {x.currency.name}</span><b>{x.label}</b></div>)}</div>
            </div>
            <div className="section" style={{ marginTop: 12 }}><h4><Icon name="wallet" />Offer guidance</h4><ul>
              <li>Offer at or below the market reference ({f(bm.ref)}) for candidates meeting the core skills.</li>
              <li>Use the upper hiring range ({f(bm.hireHigh)}) for candidates who bring the scarce experience listed under preferred experience, or who come from a higher-paying sub-industry.</li>
              <li>Above the market high ({f(bm.high)}) only with a documented business case and leadership approval.</li>
            </ul></div>
            <div className="section"><h4><Icon name="library" />Sources for this role</h4><ul>{role.anchors.map((a) => <li key={a}><a href={SOURCES[a].url} target="_blank" rel="noreferrer">{SOURCES[a].name}</a></li>)}</ul></div>
          </>
        )}
        {tab === 'comparables' && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Comparable role</th><th className="num">Reference</th><th className="num">vs selected</th><th /></tr></thead>
              <tbody>
                {comps.map(({ role: r, bm: b }) => { const d = ((b.ref - bm.ref) / bm.ref) * 100; return <tr key={r.id} className="row" onClick={() => onSelect(r.id)}><td><span className="name">{r.title}</span><br /><span className="muted" style={{ fontSize: 11.5 }}>{r.family} · {exp(r)} yrs</span></td><td className="num">{f(b.ref)}</td><td className="num" style={{ color: d > 0 ? 'var(--blue-deep)' : d < 0 ? 'var(--good)' : 'inherit', fontWeight: 700 }}>{d > 0 ? '+' : ''}{d.toFixed(0)}%</td><td><Icon name="arrowRight" size={14} /></td></tr>; })}
              </tbody>
            </table>
            <div className="section" style={{ marginTop: 12 }}><h4><Icon name="globe" />Market titles used for this role</h4><div className="chips">{role.comparables.map((x) => <span className="chip soft" key={x}>{x}</span>)}</div></div>
          </div>
        )}
        {tab === 'jd' && <div className="jd-preview">{jdToText(jd)}</div>}

        <div className="drawer-actions">
          <button type="button" className="btn primary" onClick={() => setModal('view')}><Icon name="doc" />View Full JD</button>
          <button type="button" className="btn" onClick={regenerate}><Icon name="reset" />Generate JD</button>
          <button type="button" className="btn" onClick={() => setModal('edit')}><Icon name="edit" />Edit JD</button>
          <button type="button" className="btn" onClick={exportJd}><Icon name="download" />Export JD</button>
        </div>
      </div>

      <Modal open={modal === 'view'} title={`${role.title} – Job Description`} onClose={() => setModal(null)} wide>
        <div className="jd-doc">
          <h2>{jd.title}</h2><div className="meta">{jd.meta}</div>
          <h4>About the opportunity</h4><p>{jd.about}</p>
          <h4>Role purpose</h4><p>{jd.summary}</p>
          <h4>Key responsibilities</h4><ul>{jd.responsibilities.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Core skills</h4><ul>{jd.skills.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>{jd.knowledgeLabel}</h4><ul>{jd.knowledge.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Preferred experience</h4><ul>{jd.preferred.map((x) => <li key={x}>{x}</li>)}</ul>
          <h4>Education</h4><p>{jd.education}</p>
          <h4>Compensation guidance (internal)</h4><p>{jd.compensation}</p>
          <div className="inline" style={{ marginTop: 16 }}><button type="button" className="btn primary" onClick={copyJd}><Icon name="copy" />Copy</button><button type="button" className="btn" onClick={exportJd}><Icon name="download" />Export</button><button type="button" className="btn" onClick={() => window.print()}><Icon name="print" />Print</button><button type="button" className="btn ghost" onClick={() => { setModal('edit'); }}><Icon name="edit" />Edit</button></div>
        </div>
      </Modal>

      <Modal open={modal === 'edit'} title={`Edit JD – ${role.title}`} onClose={() => setModal(null)} wide>
        <JdEditor jd={jd} onSave={(next) => { setJdEdits((e) => ({ ...e, [role.id]: next })); setModal('view'); toast('JD saved for this role'); }} onReset={() => { setJdEdits((e) => { const n = { ...e }; delete n[role.id]; return n; }); setModal(null); toast('JD reset to template'); }} />
      </Modal>
    </aside>
  );
}

function JdEditor({ jd, onSave, onReset }) {
  const [d, setD] = useState({ title: jd.title, summary: jd.summary, responsibilities: jd.responsibilities.join('\n'), skills: jd.skills.join(', '), knowledge: jd.knowledge.join(', '), preferred: jd.preferred.join('\n'), education: jd.education, about: jd.about });
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  return (
    <div className="jd-edit">
      <Field label="Title"><input value={d.title} onChange={set('title')} /></Field>
      <Field label="About the opportunity"><textarea value={d.about} onChange={set('about')} /></Field>
      <Field label="Role purpose"><textarea value={d.summary} onChange={set('summary')} /></Field>
      <Field label="Key responsibilities" hint="One per line"><textarea value={d.responsibilities} onChange={set('responsibilities')} style={{ minHeight: 140 }} /></Field>
      <Field label="Core skills" hint="Comma separated"><input value={d.skills} onChange={set('skills')} /></Field>
      <Field label={jd.knowledgeLabel} hint="Comma separated"><input value={d.knowledge} onChange={set('knowledge')} /></Field>
      <Field label="Preferred experience" hint="One per line"><textarea value={d.preferred} onChange={set('preferred')} /></Field>
      <Field label="Education"><input value={d.education} onChange={set('education')} /></Field>
      <div className="inline"><button type="button" className="btn primary" onClick={() => onSave({ title: d.title, about: d.about, summary: d.summary, responsibilities: lines(d.responsibilities), skills: list(d.skills), knowledge: list(d.knowledge), preferred: lines(d.preferred), education: d.education })}><Icon name="check" />Save JD</button><button type="button" className="btn" onClick={onReset}><Icon name="reset" />Reset to template</button></div>
    </div>
  );
}
