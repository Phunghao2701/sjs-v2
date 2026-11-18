import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiFolder, FiGlobe, FiMenu, FiSearch, FiUsers, FiX, FiLogOut } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
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
  const activePath = location.pathname.replace(/\/$/, '').split('/').at(-1);
  const activeItem = items.find(({ path }) => path === activePath);
  const pageTitle = activeItem ? t(`navigation.${activeItem.path}`, activeItem.label) : t('navigation.projects', 'Projects');

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
              `group flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control border-l-3 px-2.5 py-1.5 text-left text-xs transition-colors ${
                isActive
                  ? 'border-primary bg-primary-subtle font-semibold !text-primary'
                  : 'border-transparent font-medium !text-muted-foreground hover:bg-surface-muted hover:!text-foreground'
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
        <header className="app-topbar sticky top-0 z-[var(--ds-z-sticky)] flex max-md:hidden min-h-14 items-center border-b border-border bg-surface/95 px-4 md:px-6 backdrop-blur">
          <div className="w-full max-w-[1360px] mx-auto flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">{t('navigation.workspace', 'Workspace')}</span>
              <span aria-hidden="true" className="text-subtle-foreground">/</span>
              <span className="truncate font-semibold text-foreground">{pageTitle}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => navigate(`${base}/search`)} className="flex h-9 min-w-[210px] items-center gap-2 rounded-control border border-border bg-background px-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle-hover" aria-label={t('navigation.search', 'Search')}>
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
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className="app-main flex-1 min-w-0"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
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

