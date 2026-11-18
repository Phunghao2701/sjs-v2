import { useTranslation } from "react-i18next";
import Icon from '../../../../shared/components/Icon';
import { HeaderFilterCard } from '../../../../shared/components/Card';
import { SYSTEM_ROLES, ACCOUNT_STATUSES } from '../../../../shared/constants/systemConstants';

/**
 * UserFilterBar Component
 * Renders filter controls for searching and filtering the user directory.
 */
export default function UserFilterBar({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  totalCount
}) {
  const { t } = useTranslation();

  return (
    <HeaderFilterCard title="All Contributors" count={totalCount} singularLabel="User" pluralLabel="Users">
      {/* Search Field */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-surface min-w-[220px]">
        <Icon icon="lucide:search" width="16" className="text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder={t("admin.searchByNameemail")}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="border-0 bg-transparent text-foreground text-sm w-full focus:outline-none focus:ring-0"
        />
      </div>

      {/* Filter by Role Dropdown */}
      <select
        value={selectedRole}
        onChange={e => onRoleChange(e.target.value)}
        className="h-9 px-2.5 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
      >
        <option value="all">All Roles</option>
        {SYSTEM_ROLES.map(r => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Filter by Status */}
      <select
        value={selectedStatus}
        onChange={e => onStatusChange(e.target.value)}
        className="h-9 px-2.5 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
      >
        <option value="all">All Statuses</option>
        {ACCOUNT_STATUSES.map(status => (
          <option key={status.value} value={status.value}>
            {status.value}
          </option>
        ))}
      </select>

      {/* Clear Filters indicator */}
      {(search || selectedRole !== 'all' || selectedStatus !== 'all') && (
        <button
          type="button"
          onClick={() => {
            onSearchChange('');
            onRoleChange('all');
            onStatusChange('all');
          }}
          className="p-0 text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm border-0 bg-transparent cursor-pointer transition-colors"
        >
          <Icon icon="lucide:x-circle" width="16" />
          <span>Reset</span>
        </button>
      )}
    </HeaderFilterCard>
  );
}
