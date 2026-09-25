// Charts specific to the compensation modeller: grouped columns, horizontal bars, bell-curve positioning, range strip, heatmap.
import { useState } from 'react';
import { useSize } from './ui.jsx';

const SURFACE = '#fff';
function nice(max, ticks = 4) { if (!(max > 0)) return { max: 1, step: 0.25 }; const rough = max / ticks; const mag = 10 ** Math.floor(Math.log10(rough)); const n = rough / mag; const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag; return { max: Math.ceil(max / step) * step, step }; }
const top = (x, y, w, h, r = 3) => { if (h <= 0) return ''; const rr = Math.min(r, h, w / 2); return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`; };

function Tip({ tip }) { return tip ? <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>{tip.title && <div className="t">{tip.title}</div>}{tip.rows.map((r, i) => <div className="r" key={i}><span>{r.color && <i style={{ background: r.color }} />}{r.name}</span><b>{r.value}</b></div>)}</div> : null; }
export function Legend({ series }) { return series.length < 2 ? null : <div className="legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>; }

// Grouped columns: data [{label, values[]}], series [{name,color}]
export function GroupedColumns({ data, series, format, height = 240, yLabel, xLabel }) {
  const [ref, width] = useSize(); const [tip, setTip] = useState(null);
  const all = data.flatMap((d) => d.values); const { max, step } = nice(Math.max(...all, 0));
  const ticks = []; for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
  const tickLen = Math.max(...ticks.map((t) => String(format(t)).length), 1);
  const m = { top: 22, right: 10, bottom: xLabel ? 46 : 34, left: Math.max(44, tickLen * 6.5 + 14) };
  const plotH = height - m.top - m.bottom; const plotW = Math.max(width - m.left - m.right, 10);
  const band = plotW / data.length; const gw = band * 0.7; const bw = Math.min(18, gw / series.length);
  // Value labels only fit when every bar is wider than its label; otherwise label the reference (middle) series alone.
  const maxLen = Math.max(...all.map((v) => String(format(v)).length), 1); const labelsFit = bw >= maxLen * 6;
  const refSeries = Math.floor(series.length / 2);
  const xOf = (i) => m.left + band * (i + 0.5); const yOf = (v) => m.top + plotH - (v / max) * plotH;
  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={height}>
          {ticks.map((t) => <g key={t}><line className="grid-line" x1={m.left} x2={width - m.right} y1={yOf(t)} y2={yOf(t)} /><text className="axis-text" x={m.left - 6} y={yOf(t) + 3.5} textAnchor="end">{format(t)}</text></g>)}
          {yLabel && <text className="axis-text" transform={`translate(11,${m.top + plotH / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>}
          {data.map((d, i) => d.values.map((v, s) => { const x = xOf(i) - (series.length * bw) / 2 + s * bw; return <g key={s}><path d={top(x + 1, yOf(v), bw - 2, plotH - (yOf(v) - m.top))} fill={series[s].color} />{labelsFit && <text className="value-label" x={x + bw / 2} y={yOf(v) - 5} textAnchor="middle">{format(v)}</text>}</g>; }))}
          {!labelsFit && data.map((d, i) => <text key={`v${i}`} className="value-label" x={xOf(i)} y={yOf(Math.max(...d.values)) - 5} textAnchor="middle">{format(d.values[refSeries])}</text>)}
          {data.map((d, i) => <rect key={i} className="hit" x={xOf(i) - band / 2} y={m.top} width={band} height={plotH} onMouseEnter={() => setTip({ x: xOf(i), y: yOf(Math.max(...d.values)), title: d.label, rows: series.map((s, k) => ({ name: s.name, color: s.color, value: format(d.values[k]) })) })} onMouseLeave={() => setTip(null)} />)}
          {data.map((d, i) => <text key={`l${i}`} className="axis-text" x={xOf(i)} y={height - m.bottom + 16} textAnchor="middle" style={{ fill: '#44546a', fontWeight: 600 }}>{d.label}</text>)}
          {xLabel && <text className="axis-text" x={m.left + plotW / 2} y={height - 6} textAnchor="middle">{xLabel}</text>}
        </svg>
      )}
      <Tip tip={tip} /><Legend series={series} />
    </div>
  );
}

// Horizontal bars: data [{label, value}]
export function HBars({ data, format, color = '#2a78d6', rowH = 26 }) {
  const [ref, width] = useSize();
  const max = Math.max(...data.map((d) => d.value), 0) || 1; const labelW = Math.min(190, Math.max(120, width * 0.34)); const valW = 56;
  const plotW = Math.max(width - labelW - valW - 8, 10);
  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg width={width} height={data.length * rowH + 4}>
          {data.map((d, i) => { const y = i * rowH + 4; const w = (d.value / max) * plotW; return <g key={d.label}><text className="axis-text" x={labelW - 8} y={y + 12} textAnchor="end" style={{ fill: '#14243a' }}>{d.label}</text><rect x={labelW} y={y} width={w} height={16} rx={3} fill={color} opacity={0.35 + 0.65 * (d.value / max)} /><text className="value-label" x={labelW + w + 6} y={y + 12}>{format(d.value)}</text></g>; })}
        </svg>
      )}
    </div>
  );
}

// Bell curve with low / ref / high markers and the selected point.
export function BellCurve({ low, ref, high, format, height = 200 }) {
  const [wrapRef, width] = useSize();
  const m = { left: 16, right: 16, top: 26, bottom: 36 };
  const plotW = Math.max(width - m.left - m.right, 10); const plotH = height - m.top - m.bottom;
  const span = Math.max(high - low, 1e-6); const mu = ref; const sigma = span / 3.3; const xMin = low - span * 0.35; const xMax = high + span * 0.35;
  const xOf = (v) => m.left + ((v - xMin) / (xMax - xMin)) * plotW;
  const pts = []; for (let i = 0; i <= 80; i += 1) { const v = xMin + ((xMax - xMin) * i) / 80; const y = Math.exp(-0.5 * ((v - mu) / sigma) ** 2); pts.push([xOf(v), m.top + plotH - y * plotH]); }
  const path = `M${pts.map((p) => p.join(',')).join(' L')}`; const area = `${path} L${xOf(xMax)},${m.top + plotH} L${xOf(xMin)},${m.top + plotH} Z`;
  const narrow = width < 380;
  const marker = (v, label, strong) => <g key={label}><line x1={xOf(v)} x2={xOf(v)} y1={m.top} y2={m.top + plotH} stroke={strong ? '#1f6fd1' : '#9db8d9'} strokeWidth={strong ? 2 : 1} strokeDasharray={strong ? '' : '3 3'} /><circle cx={xOf(v)} cy={m.top + plotH - Math.exp(-0.5 * ((v - mu) / sigma) ** 2) * plotH} r={strong ? 6 : 4} fill={strong ? '#1baf7a' : '#1f6fd1'} stroke={SURFACE} strokeWidth={2} /><text className="value-label" x={xOf(v)} y={height - m.bottom + 14} textAnchor="middle">{format(v)}</text><text className="axis-text" x={xOf(v)} y={height - m.bottom + 27} textAnchor="middle">{label}</text></g>;
  return (
    <div className="chart" ref={wrapRef}>
      {width > 0 && <svg width={width} height={height}><path d={area} fill="#2a78d6" opacity={0.12} /><path d={path} fill="none" stroke="#2a78d6" strokeWidth={2} />{marker(low, narrow ? 'Low' : 'Market Low')}{marker(ref, narrow ? 'Reference' : 'Market Reference', true)}{marker(high, narrow ? 'High' : 'Market High')}</svg>}
      <div className="legend"><span><i style={{ background: '#2a78d6' }} />Market range</span><span><i style={{ background: '#1baf7a' }} />Selected role</span></div>
    </div>
  );
}

// Range strip: where the recommended hiring range sits between market low and high.
export function RangeStrip({ low, ref, high, hireLow, hireHigh, format }) {
  const [wrapRef, width] = useSize();
  const m = { left: 30, right: 30 }; const plotW = Math.max(width - m.left - m.right, 10); const height = 70;
  const xOf = (v) => m.left + ((v - low) / Math.max(high - low, 1e-6)) * plotW;
  return (
    <div className="chart range-strip" ref={wrapRef}>
      {width > 0 && (
        <svg width={width} height={height}>
          <line x1={m.left} x2={width - m.right} y1={28} y2={28} stroke="#c9d2dd" strokeWidth={2} />
          <rect x={xOf(hireLow)} y={20} width={Math.max(xOf(hireHigh) - xOf(hireLow), 2)} height={16} rx={4} fill="#1baf7a" opacity={0.3} />
          {[[low, 'Market Low'], [ref, 'Market Ref'], [high, 'Market High']].map(([v, l]) => <g key={l}><circle cx={xOf(v)} cy={28} r={5} fill={l === 'Market Ref' ? '#0b1f3a' : '#2a78d6'} stroke={SURFACE} strokeWidth={2} /><text className="value-label" x={xOf(v)} y={12} textAnchor={l === 'Market Low' ? 'start' : l === 'Market High' ? 'end' : 'middle'}>{format(v)}</text></g>)}
          <text className="axis-text" x={xOf((hireLow + hireHigh) / 2)} y={52} textAnchor="middle" style={{ fill: '#146c4d', fontWeight: 700 }}>{format(hireLow)} – {format(hireHigh)}</text>
          <text className="axis-text" x={xOf((hireLow + hireHigh) / 2)} y={65} textAnchor="middle">Recommended Hiring Range</text>
        </svg>
      )}
    </div>
  );
}

// Heatmap: rows × cols with numeric cells, single-hue sequential.
export function Heatmap({ rows, cols, value, format }) {
  const vals = rows.flatMap((r) => cols.map((c) => value(r, c))); const min = Math.min(...vals); const max = Math.max(...vals) || 1;
  const shade = (v) => { const t = (v - min) / Math.max(max - min, 1e-6); const steps = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']; return steps[Math.min(steps.length - 1, Math.floor(t * steps.length))]; };
  return (
    <div className="table-wrap">
      <table className="heatmap">
        <thead><tr><th /> {cols.map((c) => <th key={c.key} className="num">{c.name}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.key}><td>{r.name}</td>{cols.map((c) => { const v = value(r, c); const t = (v - min) / Math.max(max - min, 1e-6); return <td key={c.key} className="num" style={{ background: shade(v), color: t > 0.55 ? '#fff' : '#0b1f3a' }}>{format(v)}</td>; })}</tr>)}</tbody>
      </table>
    </div>
  );
}
