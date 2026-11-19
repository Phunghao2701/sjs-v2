import { useMemo } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../../shared/ui/button';

function getAdminBreadcrumbs(pathname, lang, t) {
  const cleanPath = pathname.replace(new RegExp(`^/${lang}`), '').replace(/\/$/, '') || '';
  const segments = cleanPath.split('/').filter(Boolean);

  const breadcrumbs = [
    { label: 'Admin', to: `/${lang}/admin/dashboard` }
  ];

  if (segments.length <= 1 || segments[1] === 'dashboard') {
    breadcrumbs.push({ label: 'Dashboard' });
    return breadcrumbs;
  }

  const section = segments[1];

  switch (section) {
    case 'journals':
      if (segments.length === 2) {
        breadcrumbs.push({ label: 'Journals' });
      } else if (segments[2] === 'repository') {
        breadcrumbs.push({ label: 'Journals', to: `/${lang}/admin/journals` });
        breadcrumbs.push({ label: 'Volumes Repository' });
      } else if (segments[2] === 'archive') {
        breadcrumbs.push({ label: 'Journals', to: `/${lang}/admin/journals` });
        breadcrumbs.push({ label: 'Volume Archive' });
      } else if (segments[3] === 'edit') {
        breadcrumbs.push({ label: 'Journals', to: `/${lang}/admin/journals` });
        breadcrumbs.push({ label: 'Edit Journal' });
      } else {
        breadcrumbs.push({ label: 'Journals', to: `/${lang}/admin/journals` });
        breadcrumbs.push({ label: 'Details' });
      }
      break;

    case 'articles':
      if (segments.length === 2) {
        breadcrumbs.push({ label: 'Articles' });
      } else if (segments[2] === 'create') {
        breadcrumbs.push({ label: 'Articles', to: `/${lang}/admin/articles` });
        breadcrumbs.push({ label: 'Submit Article' });
      } else {
        breadcrumbs.push({ label: 'Articles', to: `/${lang}/admin/articles` });
        breadcrumbs.push({ label: 'Update Article' });
      }
      break;

    case 'data-sources':
      breadcrumbs.push({ label: 'Data Sources' });
      break;

    case 'users':
      if (segments.length === 2) {
        breadcrumbs.push({ label: 'User Accounts' });
      } else if (segments[2] === 'create') {
        breadcrumbs.push({ label: 'User Accounts', to: `/${lang}/admin/users` });
        breadcrumbs.push({ label: 'New Account' });
      } else if (segments[3] === 'edit') {
        breadcrumbs.push({ label: 'User Accounts', to: `/${lang}/admin/users` });
        breadcrumbs.push({ label: 'Edit Account' });
      } else {
        breadcrumbs.push({ label: 'User Accounts' });
      }
      break;

    default:
      breadcrumbs.push({ label: section.charAt(0).toUpperCase() + section.slice(1) });
      break;
  }

  return breadcrumbs;
}

/**
 * AdminHeader Component
 * Synchronized with DashboardShell's topbar (56px height, breadcrumbs, search, user avatar pill).
 */
export default function AdminHeader({ onOpenMobile }) {
  const { lang = 'en' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const base = `/${lang}`;

  const user = useAuthStore((state) => state.user);
  const email = useUserStore((state) => state.email) || 'admin@researchpulse.org';
  const name = email.split('@')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || formattedName
    : formattedName;

  let displayRole = 'Admin';
  if (user?.role) {
    if (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'administrator') {
      displayRole = 'Administrator';
    } else if (user.role.toLowerCase() === 'editor') {
      displayRole = 'Editor';
    } else {
      displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  }

  const breadcrumbs = useMemo(
    () => getAdminBreadcrumbs(location.pathname, lang, t),
    [location.pathname, lang, t]
  );

  return (
    <header className="app-topbar sticky top-0 z-[var(--ds-z-sticky)] flex h-14 min-h-14 items-center border-b border-border bg-surface/95 px-4 sm:px-6 lg:px-8 backdrop-blur box-border">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Breadcrumb Navigation */}
        <div className="flex items-center gap-3 min-w-0">
          {onOpenMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden size-8 -ml-1 text-muted-foreground hover:text-foreground"
              aria-label="Open navigation"
              onClick={onOpenMobile}
            >
              <Icon icon="lucide:menu" width={18} />
            </Button>
          )}

          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs sm:text-sm">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
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
        </div>

        {/* Right: Search + Notifications + Admin Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search */}
          <div className="hidden sm:flex items-center gap-2 h-9 min-w-[220px] rounded-control border border-border bg-background px-3 text-xs text-muted-foreground transition-colors shadow-2xs">
            <Icon icon="lucide:search" width={14} className="shrink-0 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("common.searchManuscriptsAuthorsOrIds", "Search manuscripts, authors, or IDs…")}
              className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="size-9 rounded-control flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors border-0 bg-transparent cursor-pointer"
            aria-label="Notifications"
          >
            <Icon icon="lucide:bell" width={16} />
          </button>

          {/* Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-border/60">
            <div className="grid size-7 place-items-center rounded-full bg-primary-subtle text-xs font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight">{displayName}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{displayRole}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
