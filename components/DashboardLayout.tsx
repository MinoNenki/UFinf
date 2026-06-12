'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles, LayoutDashboard, Clapperboard, Radar, Users, Brain,
  Inbox, Palette, DollarSign, Settings, Zap, TrendingUp, ShieldCheck, Rocket, UserCircle2, LogOut, LogIn
} from 'lucide-react';
import { navigate } from '@/lib/navigate';
import { byLanguage, useI18n } from '@/lib/i18n';
import DashboardHome from './DashboardHomeLocalized';
import ContentFactory from './ContentFactoryLocalized';
import TrendRadar from './TrendRadarLocalized';
import Competition from './CompetitionLocalized';
import Coach from './Coach';
import InboxPage from './InboxPageLocalized';
import Studio from './Studio';
import Revenue from './Revenue';
import SettingsPage from './SettingsPage';
import AdminPanel from './AdminPanel';
import OneClickPublish from './OneClickPublish';
import ContentBrainV2 from './ContentBrainV2';
import AdminLogin from './AdminLogin';
import LanguageSwitcher from './LanguageSwitcher';
import AccountPanel from './AccountPanel';
import DashboardGuard from './DashboardGuard';

const NAV_ITEMS = [
  { path: '/dashboard', key: 'dashboard', icon: LayoutDashboard, section: 'main' },
  { path: '/dashboard/factory', key: 'factory', icon: Clapperboard, section: 'main' },
  { path: '/dashboard/publish', key: 'publish', icon: Rocket, section: 'main' },
  { path: '/dashboard/trends', key: 'trends', icon: Radar, section: 'main' },
  { path: '/dashboard/competition', key: 'competition', icon: Users, section: 'main' },
  { path: '/dashboard/coach', key: 'coach', icon: Brain, section: 'main' },
  { path: '/dashboard/inbox', key: 'inbox', icon: Inbox, section: 'tools', badge: 3 },
  { path: '/dashboard/studio', key: 'studio', icon: Palette, section: 'tools' },
  { path: '/dashboard/brain', key: 'brain', icon: TrendingUp, section: 'tools' },
  { path: '/dashboard/revenue', key: 'revenue', icon: DollarSign, section: 'tools' },
  { path: '/dashboard/account', key: 'account', icon: UserCircle2, section: 'account' },
  { path: '/dashboard/admin', key: 'admin', icon: ShieldCheck, section: 'account', adminOnly: true },
  { path: '/dashboard/settings', key: 'settings', icon: Settings, section: 'account', adminOnly: true },
];

const COPY = {
  pl: {
    labels: {
      dashboard: 'Dashboard', factory: 'Content Factory', publish: 'One Click Publish', trends: 'Trend Radar', competition: 'AI Konkurencja',
      coach: 'Growth Coach', inbox: 'Smart Inbox', studio: 'AI Studio', brain: 'Content Brain v2', revenue: 'Revenue AI',
      account: 'Moje konto', admin: 'Panel admina', settings: 'Ustawienia',
    },
    sections: { main: 'Glowne', tools: 'Narzedzia', account: 'Konto' },
    plan: 'Plan Pro',
    generations: '37 generacji dzis',
    upgrade: 'Upgrade',
    newContent: '+ Nowa tresc',
    landing: '← Landing',
    loadingSession: 'Ladowanie sesji...',
    protectedView: 'Ten widok jest chroniony. Wymagane logowanie administratora.',
    login: 'Logowanie',
    register: 'Zarejestruj sie',
    logout: 'Wylogowanie',
    myAccount: 'Moje konto',
    adminRolePrefix: 'Admin',
  },
  en: {
    labels: {
      dashboard: 'Dashboard', factory: 'Content Factory', publish: 'One Click Publish', trends: 'Trend Radar', competition: 'AI Competition',
      coach: 'Growth Coach', inbox: 'Smart Inbox', studio: 'AI Studio', brain: 'Content Brain v2', revenue: 'Revenue AI',
      account: 'My account', admin: 'Admin panel', settings: 'Settings',
    },
    sections: { main: 'Main', tools: 'Tools', account: 'Account' },
    plan: 'Pro Plan',
    generations: '37 generations today',
    upgrade: 'Upgrade',
    newContent: '+ New content',
    landing: '← Landing',
    loadingSession: 'Loading session...',
    protectedView: 'This view is protected. Administrator login is required.',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    myAccount: 'My account',
    adminRolePrefix: 'Admin',
  },
  es: {
    labels: {
      dashboard: 'Dashboard', factory: 'Fabrica de contenido', publish: 'Publicacion en un clic', trends: 'Radar de tendencias', competition: 'Competencia AI',
      coach: 'Growth Coach', inbox: 'Bandeja inteligente', studio: 'AI Studio', brain: 'Content Brain v2', revenue: 'Revenue AI',
      account: 'Mi cuenta', admin: 'Panel admin', settings: 'Ajustes',
    },
    sections: { main: 'Principal', tools: 'Herramientas', account: 'Cuenta' },
    plan: 'Plan Pro',
    generations: '37 generaciones hoy',
    upgrade: 'Upgrade',
    newContent: '+ Nuevo contenido',
    landing: '← Landing',
    loadingSession: 'Cargando sesion...',
    protectedView: 'Esta vista esta protegida. Se requiere inicio de sesion de administrador.',
    login: 'Iniciar sesion',
    register: 'Registrarme',
    logout: 'Cerrar sesion',
    myAccount: 'Mi cuenta',
    adminRolePrefix: 'Admin',
  },
};

function renderPage(path: string, isAdmin: boolean, adminRole: string | undefined, onAdminAuthSuccess: () => void, onAdminLogout: () => Promise<void>) {
  if (path === '/dashboard') return <DashboardHome />;
  if (path === '/dashboard/factory') return <ContentFactory />;
  if (path === '/dashboard/publish') return <OneClickPublish />;
  if (path === '/dashboard/trends') return <TrendRadar />;
  if (path === '/dashboard/competition') return <Competition />;
  if (path === '/dashboard/coach') return <Coach />;
  if (path === '/dashboard/inbox') return <InboxPage />;
  if (path === '/dashboard/studio') return <Studio />;
  if (path === '/dashboard/brain') return <ContentBrainV2 />;
  if (path === '/dashboard/revenue') return <Revenue />;
  if (path === '/dashboard/account') return <AccountPanel isAdmin={isAdmin} role={adminRole} onLogin={() => navigate('/dashboard/admin')} onLogout={onAdminLogout} />;
  if (path === '/dashboard/admin') return isAdmin ? <AdminPanel adminRole={adminRole} /> : <AdminLogin onSuccess={onAdminAuthSuccess} />;
  if (path === '/dashboard/settings') return isAdmin ? <SettingsPage /> : <AdminLogin onSuccess={onAdminAuthSuccess} />;
  return <DashboardHome />;
}

export default function DashboardLayout() {
  const { language } = useI18n();
  const copy = byLanguage(language, COPY);
  const [path, setPath] = useState('/dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [adminRole, setAdminRole] = useState<string>();

  async function refreshAdminSession() {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAdmin(Boolean(data.isAdmin));
      setAdminRole(data.role);
    } catch {
      setIsAdmin(false);
      setAdminRole(undefined);
    } finally {
      setAdminLoaded(true);
    }
  }

  async function logoutAdmin() {
    await fetch('/api/admin/logout', { method: 'POST' });
    await refreshAdminSession();
    handleNav('/dashboard/account');
  }

  useEffect(() => {
    setPath(window.location.pathname);
    refreshAdminSession();
    const onPop = () => setPath(window.location.pathname);
    const onCustomNavigate = (event: Event) => {
      const nextPath = (event as CustomEvent<string>).detail;
      if (typeof nextPath === 'string') handleNav(nextPath);
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('usinf:navigate', onCustomNavigate as EventListener);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('usinf:navigate', onCustomNavigate as EventListener);
    };
  }, []);

  const pageTitle = copy.labels[NAV_ITEMS.find((item) => item.path === path)?.key as keyof typeof copy.labels] || copy.labels.dashboard;

  function handleNav(navPath: string) {
    navigate(navPath);
    setPath(navPath);
    setSidebarOpen(false);
  }

  const mainItems = NAV_ITEMS.filter(n => n.section === 'main');
  const toolItems = NAV_ITEMS.filter(n => n.section === 'tools');
  const accountItems = NAV_ITEMS.filter(n => n.section === 'account' && (!n.adminOnly || isAdmin));
  const spotlightKeys = new Set(['factory', 'publish', 'brain', 'account']);

  const lockedAdminPath = (path === '/dashboard/admin' || path === '/dashboard/settings') && !isAdmin;

  return (
    <div className="dash-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon"><Sparkles size={15} color="#030d1a" /></span>
          <span>UFInf</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{copy.sections.main}</div>
          {mainItems.map(({ path: np, key, icon: Icon, badge }) => (
            <button
              key={np}
              className={`nav-item${path === np ? ' active' : ''}${spotlightKeys.has(key) ? ' nav-item-spotlight' : ''}`}
              onClick={() => handleNav(np)}
            >
              <Icon size={17} />
              <span>{copy.labels[key as keyof typeof copy.labels]}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}

          <div className="nav-section-label">{copy.sections.tools}</div>
          {toolItems.map(({ path: np, key, icon: Icon, badge }) => (
            <button
              key={np}
              className={`nav-item${path === np ? ' active' : ''}${spotlightKeys.has(key) ? ' nav-item-spotlight' : ''}`}
              onClick={() => handleNav(np)}
            >
              <Icon size={17} />
              <span>{copy.labels[key as keyof typeof copy.labels]}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}

          <div className="nav-section-label">{copy.sections.account}</div>
          {accountItems.map(({ path: np, key, icon: Icon }) => (
            <button
              key={np}
              className={`nav-item${path === np ? ' active' : ''}${spotlightKeys.has(key) ? ' nav-item-spotlight' : ''}`}
              onClick={() => handleNav(np)}
            >
              <Icon size={17} />
              <span>{copy.labels[key as keyof typeof copy.labels]}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-badge">
            <div>
              <div className="plan-name">{copy.plan}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{copy.generations}</div>
            </div>
            <button
              style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => handleNav('/dashboard/settings')}
            >
              {copy.upgrade}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>
            <span className="topbar-title">{pageTitle}</span>
          </div>
          <div className="topbar-actions">
            <LanguageSwitcher compact />
            <span className="badge badge-cyan" style={{ fontSize: 11 }}>
              <Zap size={11} style={{ marginRight: 3 }} /> {isAdmin && adminRole ? `${copy.adminRolePrefix}: ${adminRole}` : copy.plan}
            </span>
            <button
              className="btn btn-primary btn-sm btn-pulse-attention"
              onClick={() => handleNav('/dashboard/factory')}
            >
              {copy.newContent}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => handleNav('/dashboard/account')}>
              <UserCircle2 size={13} /> {copy.myAccount}
            </button>
            {!isAdmin ? (
              <button className="btn btn-ghost btn-sm" onClick={() => handleNav('/dashboard/account')}>
                {copy.register}
              </button>
            ) : null}
            {!isAdmin ? (
              <button className="btn btn-ghost btn-sm" onClick={() => handleNav('/dashboard/admin')}>
                <LogIn size={13} /> {copy.login}
              </button>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={logoutAdmin}>
                <LogOut size={13} /> {copy.logout}
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/')}
              style={{ fontSize: 12 }}
            >
              {copy.landing}
            </button>
          </div>
        </header>

        <main className="dash-content animate-in">
          {adminLoaded ? (
            path === '/dashboard/account' ? (
              renderPage(path, isAdmin, adminRole, refreshAdminSession, logoutAdmin)
            ) : (
              <DashboardGuard onAuthSuccess={refreshAdminSession}>
                {renderPage(path, isAdmin, adminRole, refreshAdminSession, logoutAdmin)}
              </DashboardGuard>
            )
          ) : (
            <div className="card">{copy.loadingSession}</div>
          )}
          {lockedAdminPath && (
            <div className="alert alert-warning" style={{ marginTop: 12 }}>
              {copy.protectedView}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
