import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@iconify/react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Logo from '../../shared/components/Logo';
import { Button } from '../../shared/ui/button';
import '../../features/admin/admin.css';

/**
 * AdminLayout Component
 * Fully synchronized with DashboardShell's responsive layout structure and design tokens.
 */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-[var(--ds-z-sticky)] flex min-h-14 h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Logo size={26} fontSize="0.95rem" />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Icon icon="lucide:menu" width={20} />
        </Button>
      </header>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block w-[230px] shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
          <AdminSidebar />
        </div>
      </div>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onOpenMobile={() => setMobileOpen(true)} />

        <motion.main
          key={location.pathname}
          className="app-main flex-1 min-w-0 p-4 sm:p-6 lg:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
        >
          {children || <Outlet />}
        </motion.main>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[var(--ds-z-overlay)] bg-foreground/35 md:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className="h-full w-[min(82vw,280px)] bg-surface shadow-popover flex flex-col"
              initial={reduceMotion ? false : { x: -280 }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: -280 }}
              transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-14 min-h-14 items-center justify-between border-b border-border px-4 box-border">
                <Logo size={26} fontSize="0.95rem" />
                <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                  <Icon icon="lucide:x" width={20} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AdminSidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
