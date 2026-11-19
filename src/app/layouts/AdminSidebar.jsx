import { Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Logo from '../../shared/components/Logo';
import useAuth from '../../features/auth/hooks/useAuth';

/**
 * AdminSidebar Component
 * Mirrors the exact structure, dimensions, styling, and design tokens of DashboardShell's sidebar.
 */
export default function AdminSidebar({ showLogo = true, onNavigate }) {
  const { lang = 'en' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const base = `/${lang}`;

  const menuItems = [
    { label: 'Dashboard', path: 'admin/dashboard', icon: 'lucide:layout-dashboard' },
    { label: 'Journals', path: 'admin/journals', icon: 'lucide:book-open' },
    { label: 'Articles', path: 'admin/articles', icon: 'lucide:file-text' },
    { label: 'Volumes', path: 'admin/journals/repository', icon: 'lucide:layers' },
    { label: 'Data Sources', path: 'admin/data-sources', icon: 'lucide:database' },
    { label: 'Account', path: 'admin/users', icon: 'lucide:users' },
  ];

  const isItemActive = (itemPath) => {
    const fullPath = `${base}/${itemPath}`;
    if (itemPath === 'admin/journals') {
      return (
        location.pathname === fullPath ||
        (location.pathname.startsWith(fullPath) && !location.pathname.startsWith(`${base}/admin/journals/repository`))
      );
    }
    if (itemPath === 'admin/dashboard') {
      return location.pathname === fullPath || location.pathname === `${base}/admin`;
    }
    return location.pathname.startsWith(fullPath);
  };

  return (
    <aside className="app-sidebar flex min-h-full flex-col border-r border-border bg-surface" aria-label="Admin primary navigation">
      {showLogo && (
        <div className="h-14 min-h-14 flex items-center border-b border-border px-4 box-border">
          <Link
            to={`${base}/admin/dashboard`}
            className="flex items-center no-underline text-inherit"
            onClick={() => onNavigate?.()}
          >
            <Logo size={26} fontSize="0.95rem" />
          </Link>
        </div>
      )}

      <div className="flex flex-1 flex-col p-3">
        <nav className="flex flex-col gap-0.5" aria-label="Admin Navigation Links">
          {menuItems.map((item) => {
            const active = isItemActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={`${base}/${item.path}`}
                onClick={() => onNavigate?.()}
                className={`group flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? 'bg-primary-subtle font-semibold !text-primary'
                    : 'font-medium !text-muted-foreground hover:bg-surface-muted hover:!text-foreground'
                }`}
              >
                <Icon icon={item.icon} width={16} className="shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom utility links: Switch to User Portal + Sign out */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-2">
          {/* Switch to User Portal */}
          <button
            type="button"
            className="flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer"
            onClick={() => {
              onNavigate?.();
              navigate(`${base}/dashboard`);
            }}
            title="Switch to User Workspace"
          >
            <Icon icon="lucide:arrow-left" width={16} className="shrink-0" aria-hidden="true" />
            <span>User Portal</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            className="flex h-9 min-h-[36px] w-full items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-1.5 text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger cursor-pointer"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
          >
            <Icon icon="lucide:log-out" width={16} className="shrink-0" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
