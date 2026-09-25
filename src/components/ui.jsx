import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.jsx';

export function Panel({ title, subtitle, actions, children, className = '', tight = false, style }) {
  return (
    <section className={`panel ${tight ? 'tight' : ''} ${className}`} style={style}>
      {(title || actions) && (
        <div className="panel-head">
          <div>{title && <h3>{title}</h3>}{subtitle && <p>{subtitle}</p>}</div>
          {actions && <div className="panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ icon, label, value, sub }) {
  return (
    <div className="kpi">
      <div className="kpi-icon"><Icon name={icon} /></div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function Select({ label, value, onChange, options, disabled }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Tabs({ tabs, value, onChange, small }) {
  return (
    <div className={`tabs ${small ? 'small' : ''}`}>
      {tabs.map(([k, l]) => <button type="button" key={k} className={k === value ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}

export function Chip({ children, tone = '' }) { return <span className={`chip ${tone}`}>{children}</span>; }

export function DemandBars({ level }) {
  return <span className="demand" title={`Market demand ${level} of 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= level ? 'on' : ''} style={{ height: 6 + i * 2 }} />)}</span>;
}

export function Modal({ open, title, onClose, children, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head"><h3>{title}</h3><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ text }) { return text ? <div className="toast">{text}</div> : null; }

export function useLocal(key, initial) {
  const [v, setV] = useState(() => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}

export function Field({ label, hint, children }) {
  return <label className="field">{label}{children}{hint && <small>{hint}</small>}</label>;
}

export function useSize() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(ref.current); setW(ref.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}
