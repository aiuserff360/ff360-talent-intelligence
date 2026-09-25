import { useCallback, useEffect, useState } from 'react';
import { Header, Filters, NAV } from './components/Shell.jsx';
import { Toast, useLocal } from './components/ui.jsx';
import { RoleLibrary } from './screens/RoleLibrary.jsx';
import { Home, Dashboard, Reports, Settings } from './screens/Pages.jsx';
import { DEFAULT_SETTINGS } from './data/market.js';
import { rolesFor } from './data/roles.js';
import { findFunction } from './data/functions.js';
import { findSub } from './data/industries.js';
import { CURRENCIES } from './data/currencies.js';
const findCurrency = (c) => CURRENCIES.find((x) => x.code === c);

const DEFAULT_FILTERS = { fn: 'ra', location: 'bengaluru', industry: 'medical-devices', compType: 'ctc-annual', currency: 'INR', experience: 'all' };
const pageFromHash = () => { const k = window.location.hash.replace(/^#\/?/, '').split('/')[0]; return NAV.some(([n]) => n === k) ? k : 'library'; };

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [filters, setFilters] = useLocal('ff360-tmi-filters', DEFAULT_FILTERS);
  const [settings, setSettings] = useLocal('ff360-tmi-settings', DEFAULT_SETTINGS);
  const [jdEdits, setJdEdits] = useLocal('ff360-tmi-jd-edits', {});
  const [selectedId, setSelectedId] = useLocal('ff360-tmi-selected', 'ra-specialist');
  const [toastText, setToastText] = useState('');

  useEffect(() => { const on = () => setPage(pageFromHash()); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  useEffect(() => { if (!toastText) return undefined; const id = setTimeout(() => setToastText(''), 2200); return () => clearTimeout(id); }, [toastText]);
  const go = useCallback((k) => { setPage(k); if (window.location.hash !== `#/${k}`) window.history.pushState(null, '', `#/${k}`); window.scrollTo({ top: 0 }); }, []);
  // Switching function also moves the selected role into that function so the profile drawer never shows a foreign role.
  const setFilter = useCallback((k, v) => {
    setFilters((f) => ({ ...DEFAULT_FILTERS, ...f, [k]: v }));
    if (k === 'fn') setSelectedId((id) => (rolesFor(v).some((r) => r.id === id) ? id : rolesFor(v)[1]?.id || rolesFor(v)[0].id));
  }, [setFilters, setSelectedId]);
  const toast = useCallback((t) => setToastText(t), []);
  // Normalise stored filters: unknown function / sub-industry keys fall back to defaults.
  const fx = { ...DEFAULT_FILTERS, ...filters }; fx.fn = findFunction(fx.fn).key; fx.industry = findSub(fx.industry).key;
  if (fx.compType === 'ctc-usd') { fx.compType = 'ctc-annual'; fx.currency = 'USD'; }   // pre-currency releases stored USD as a comp type
  if (!findCurrency(fx.currency)) fx.currency = 'INR';
  const st = { ...DEFAULT_SETTINGS, ...settings, fxPerUsd: { ...DEFAULT_SETTINGS.fxPerUsd, ...(settings.fxPerUsd || {}) } };
  const common = { filters: fx, setFilter, settings: st, setSettings, jdEdits, setJdEdits, selectedId, setSelectedId, toast, go };

  return (
    <>
      <Header page={page} go={go} />
      {(page === 'library' || page === 'dashboard' || page === 'reports') && <Filters filters={fx} setFilter={setFilter} />}
      {page === 'home' && <Home {...common} />}
      {page === 'dashboard' && <Dashboard {...common} />}
      {page === 'library' && <RoleLibrary {...common} />}
      {page === 'reports' && <Reports {...common} />}
      {page === 'settings' && <Settings {...common} />}
      <Toast text={toastText} />
    </>
  );
}
