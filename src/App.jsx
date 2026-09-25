import { useCallback, useEffect, useState } from 'react';
import { Header, Filters, NAV } from './components/Shell.jsx';
import { Toast, useLocal } from './components/ui.jsx';
import { RoleLibrary } from './screens/RoleLibrary.jsx';
import { Home, Dashboard, Reports, Settings } from './screens/Pages.jsx';
import { DEFAULT_SETTINGS } from './data/market.js';

const DEFAULT_FILTERS = { location: 'bengaluru', industry: 'medical-devices', compType: 'ctc-annual', experience: 'all' };
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
  const setFilter = useCallback((k, v) => setFilters((f) => ({ ...DEFAULT_FILTERS, ...f, [k]: v })), [setFilters]);
  const toast = useCallback((t) => setToastText(t), []);
  const fx = { ...DEFAULT_FILTERS, ...filters }; const st = { ...DEFAULT_SETTINGS, ...settings };
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
