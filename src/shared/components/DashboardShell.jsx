import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NavLink, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiFolder, FiGlobe, FiMenu, FiSearch, FiUsers, FiX, FiLogOut } from 'react-icons/fi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createContext } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { Button } from '../ui/button';
import useAuth from '../../features/auth/hooks/useAuth';

const items = [
  { label: 'Overview', path: 'dashboard', icon: FiBarChart2 },
  { label: 'Projects', path: 'projects', icon: FiFolder },
  { label: 'Search', path: 'search', icon: FiSearch },
  { label: 'Articles', path: 'articles', icon: FiFileText },
  { label: 'Authors', path: 'authors', icon: FiUsers },
  { label: 'Geography', path: 'geography', icon: FiGlobe },
];

function getHeaderBreadcrumbs(pathname, lang, t) {
  const cleanPath = pathname.replace(new RegExp(`^/${lang}`), '').replace(/\/$/, '') || '';
  const segments = cleanPath.split('/').filter(Boolean);

  const breadcrumbs = [
    { label: t('navigation.workspace', 'Workspace'), to: `/${lang}/dashboard` }
  ];

  if (segments.length === 0 || segments[0] === 'dashboard') {
    breadcrumbs.push({ label: t('navigation.overview', 'Overview') });
    return breadcrumbs;
  }

  const section = segments[0];

  switch (section) {
    case 'projects':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects') });
      } else if (segments[1] === 'create') {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.taoProject', 'Create Project') });
      } else if (segments[2] === 'edit') {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.chinhSua', 'Edit') });
      } else {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.chiTiet', 'Details') });
      }
      break;

    case 'project':
      breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
      breadcrumbs.push({ label: t('project.phanTich', 'Analytics') });
      break;

    case 'search':
    case 'catalog':
      breadcrumbs.push({ label: t('navigation.search', 'Search') });
      break;

    case 'articles':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles') });
      } else if (segments[2] === 'visual') {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles'), to: `/${lang}/articles` });
        breadcrumbs.push({ label: t('article.trucQuan', 'Visual Details') });
      } else {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles'), to: `/${lang}/articles` });
        breadcrumbs.push({ label: t('article.chiTiet', 'Details') });
      }
      break;

    case 'authors':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors') });
      } else if (segments[1] === 'leaderboard') {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors'), to: `/${lang}/authors` });
        breadcrumbs.push({ label: t('author.bangXepHang', 'Leaderboard') });
      } else {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors'), to: `/${lang}/authors` });
        breadcrumbs.push({ label: t('author.chiTiet', 'Profile') });
      }
      break;

    case 'geography':
      breadcrumbs.push({ label: t('navigation.geography', 'Geography') });
      break;

    case 'keywords':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.keywords', 'Keywords') });
      } else {
        breadcrumbs.push({ label: t('navigation.keywords', 'Keywords'), to: `/${lang}/keywords` });
        breadcrumbs.push({ label: t('keywords.baiBaoTheoTuKhoa', 'Keyword Articles') });
      }
      break;

    case 'profile':
      breadcrumbs.push({ label: t('navigation.account', 'Profile') });
      break;

    case 'journals':
      breadcrumbs.push({ label: t('navigation.search', 'Search'), to: `/${lang}/search` });
      breadcrumbs.push({ label: t('journal.chiTiet', 'Details') });
      break;

    case 'topics':
      breadcrumbs.push({ label: t('topic.chuDe', 'Topics') });
      break;

    case 'wallet':
      breadcrumbs.push({ label: t('navigation.wallet', 'Wallet') });
      break;

    default:
      breadcrumbs.push({ label: section.charAt(0).toUpperCase() + section.slice(1) });
      break;
  }

  return breadcrumbs;
}

export const DashboardShellContext = createContext(false);

export default function DashboardShell({ children }) {
  const { lang = 'en' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerCloseRef = useRef(null);
  const sidebarRef = useRef(null);
  const base = `/${lang}`;

  const headerBreadcrumbs = useMemo(
    () => getHeaderBreadcrumbs(location.pathname, lang, t),
    [location.pathname, lang, t]
  );

  // Group project sub-routes so navigating between analytics tabs does not remount the parent layout
  const projectSubRouteMatch = location.pathname.match(/^(\/[^/]+\/project\/[^/]+)/);
  const shellKey = projectSubRouteMatch ? projectSubRouteMatch[1] : location.pathname;

  // Ensure window and sidebar always scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousFocus = document.activeElement;
    drawerCloseRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const panel = document.querySelector('[data-mobile-nav-panel]');
        const focusable = panel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [mobileOpen]);

  const sidebar = (
    <aside className="app-sidebar flex min-h-full flex-col border-r border-border bg-surface p-3" aria-label="Primary navigation">
      <div className="h-12 flex items-center border-b border-border px-2 mb-2">
        <Logo size={26} fontSize="0.95rem" />
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={`${base}/${path}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-xs transition-colors ${
                isActive
                  ? 'bg-primary-subtle font-semibold !text-primary'
                  : 'font-medium !text-muted-foreground hover:bg-surface-muted hover:!text-foreground'
              }`
            }
          >
            <Icon aria-hidden="true" className="shrink-0 text-base" />
            <span>{t(`navigation.${path}`, label)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-2">
        <button
          type="button"
          className="flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer"
          onClick={() => navigate(`${base}/profile`)}
        >
          <FiUsers aria-hidden="true" className="text-base" /> <span>{t('navigation.account', 'Account')}</span>
        </button>
        <button
          type="button"
          className="flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger cursor-pointer"
          onClick={() => logout()}
        >
          <FiLogOut aria-hidden="true" className="text-base" /> <span>{t('navigation.signOut', 'Sign out')}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-[var(--ds-z-sticky)] flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Logo size={30} fontSize="1.05rem" />
        <Button variant="ghost" size="icon" aria-label={t('navigation.open', 'Open navigation')} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><FiMenu /></Button>
      </header>

      {/* Desktop Sticky Sidebar (Flex item, zero margin needed for main) */}
      <div className="hidden md:block w-[230px] shrink-0">
        <div ref={sidebarRef} className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">{sidebar}</div>
      </div>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="app-topbar sticky top-0 z-[var(--ds-z-sticky)] flex max-md:hidden min-h-14 items-center border-b border-border bg-surface/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
          <div className="w-full flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs sm:text-sm">
              {headerBreadcrumbs.map((crumb, idx) => {
                const isLast = idx === headerBreadcrumbs.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-1.5 min-w-0">
                    {idx > 0 && <span aria-hidden="true" className="text-subtle-foreground/60 select-none">/</span>}
                    {crumb.to && !isLast ? (
                      <Link
                        to={crumb.to}
                        className="text-muted-foreground hover:text-foreground transition-colors truncate no-underline font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`truncate ${isLast ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {crumb.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => navigate(`${base}/search`)} className="flex h-9 min-w-[210px] items-center gap-2 rounded-control border border-border bg-background px-3 text-left text-xs text-muted-foreground transition-colors" aria-label={t('navigation.search', 'Search')}>
                <FiSearch aria-hidden="true" />
                <span>{t('navigation.searchManuscripts', 'Search manuscripts, authors, or IDs…')}</span>
              </button>
              <button type="button" onClick={() => navigate(`${base}/profile`)} className="flex h-9 items-center gap-2 rounded-control border-0 bg-transparent px-2 text-xs text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground" aria-label={t('navigation.account', 'Account')}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">R</span>
                <span className="hidden lg:inline">{t('navigation.account', 'Account')}</span>
              </button>
            </div>
          </div>
        </header>

        <DashboardShellContext.Provider value>
          <motion.main
            key={shellKey}
            className="app-main flex-1 min-w-0"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </DashboardShellContext.Provider>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[var(--ds-z-overlay)] bg-foreground/35 md:hidden" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} onClick={() => setMobileOpen(false)}>
            <motion.div data-mobile-nav-panel role="dialog" aria-modal="true" aria-label={t('navigation.menu', 'Main navigation')} className="h-full w-[min(82vw,280px)] bg-surface shadow-popover" initial={reduceMotion ? false : { x: -280 }} animate={{ x: 0 }} exit={reduceMotion ? undefined : { x: -280 }} transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border p-4"><Logo size={30} fontSize="1.05rem" /><Button ref={drawerCloseRef} variant="ghost" size="icon" aria-label={t('navigation.close', 'Close navigation')} onClick={() => setMobileOpen(false)}><FiX /></Button></div>
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

