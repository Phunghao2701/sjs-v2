import { Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Logo from '../../shared/components/Logo';
import useAuth from '../../features/auth/hooks/useAuth';

/**
 * AdminSidebar Component
 * Mirrors the exact structure, dimensions, styling, and design tokens of DashboardShell's sidebar.
 */
export default function AdminSidebar({
  showLogo = true,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
}) {
  const { lang = 'en' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const base = `/${lang}`;
  const isCollapsed = collapsed && !isMobile;

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
        <div className={`h-14 min-h-14 flex items-center border-b border-border box-border ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="group relative size-9 rounded-control flex items-center justify-center hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <div className="group-hover:hidden">
                <Logo size={26} fontSize="0.95rem" showText={false} />
              </div>
              <div className="hidden group-hover:flex text-muted-foreground group-hover:text-foreground">
                <Icon icon="lucide:panel-left-open" width={18} />
              </div>
            </button>
          ) : (
            <>
              <Link
                to={`${base}/admin/dashboard`}
                className="flex items-center no-underline text-inherit overflow-hidden"
                onClick={() => onNavigate?.()}
              >
                <Logo size={26} fontSize="0.95rem" showText={true} />
              </Link>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="size-7 rounded-control flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <Icon icon="lucide:panel-left-close" width={17} />
              </button>
            </>
          )}
        </div>
      )}

      <div className={`flex flex-1 flex-col ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <nav className="flex flex-col gap-0.5" aria-label="Admin Navigation Links">
          {menuItems.map((item) => {
            const active = isItemActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={`${base}/${item.path}`}
                onClick={() => onNavigate?.()}
                title={isCollapsed ? item.label : undefined}
                className={`group flex h-9 min-h-[36px] w-full items-center rounded-control transition-colors ${
                  isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
                } text-left text-xs ${
                  active
                    ? 'bg-primary-subtle font-semibold !text-primary'
                    : 'font-medium !text-muted-foreground hover:bg-surface-muted hover:!text-foreground'
                }`}
              >
                <Icon icon={item.icon} width={16} className="shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom utility links: Switch to User Portal + Sign out */}
        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-2">
          {/* Switch to User Portal */}
          <button
            type="button"
            className={`flex h-9 min-h-[36px] w-full items-center rounded-control border-0 bg-transparent text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
            }`}
            onClick={() => {
              onNavigate?.();
              navigate(`${base}/dashboard`);
            }}
            title={isCollapsed ? 'User Portal' : 'Switch to User Workspace'}
          >
            <Icon icon="lucide:arrow-left" width={16} className="shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="truncate">User Portal</span>}
          </button>

          {/* Sign Out */}
          <button
            type="button"
            className={`flex h-9 min-h-[36px] w-full items-center rounded-control border-0 bg-transparent text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
            }`}
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <Icon icon="lucide:log-out" width={16} className="shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="truncate">Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
