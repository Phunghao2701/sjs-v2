import { useState, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { SYSTEM_ROLES, ACCOUNT_STATUSES } from '../../../../shared/constants/systemConstants';

/**
 * UserFilterBar Component
 * Renders modern search and single filter dropdown for the user directory.
 */
export default function UserFilterBar({
  search = '',
  onSearchChange,
  selectedRole = 'all',
  onRoleChange,
  selectedStatus = 'all',
  onStatusChange,
  totalCount = 0,
  asCard = false
}) {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFilterOpen]);

  const activeCount = (selectedRole !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    onRoleChange?.('all');
    onStatusChange?.('all');
  };

  const selectedRoleLabel = SYSTEM_ROLES.find(r => r.value === selectedRole)?.label || selectedRole;

  const content = (
    <div className="p-3 sm:p-3.5 bg-surface">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Left: Search input + Filter button */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Icon
              icon="lucide:search"
              width={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={t("admin.searchByNameemail", "Search by name or email...")}
              className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
                aria-label="Clear search"
              >
                <Icon icon="lucide:x" width={13} />
              </button>
            )}
          </div>

          {/* Single Filter Button with Floating Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`h-9 px-3 text-xs rounded-control border transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs font-medium whitespace-nowrap ${
                activeCount > 0 || isFilterOpen
                  ? 'border-primary text-primary bg-primary-subtle font-semibold ring-1 ring-primary/20'
                  : 'border-border bg-surface text-foreground hover:bg-surface-muted hover:border-foreground/30'
              }`}
              aria-expanded={isFilterOpen}
              aria-label="Filter options"
            >
              <Icon
                icon="lucide:sliders-horizontal"
                width={14}
                className={activeCount > 0 ? "text-primary" : "text-muted-foreground"}
              />
              <span>{t("filter", "Filter")}</span>
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-primary text-white">
                  {activeCount}
                </span>
              )}
              <Icon
                icon="lucide:chevron-down"
                width={12}
                className={`transition-transform duration-200 text-muted-foreground ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Floating Dropdown Panel */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px] sm:bg-transparent"
                  onClick={() => setIsFilterOpen(false)}
                  aria-hidden="true"
                />

                <div
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px] bg-surface border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
                  style={{ zIndex: 60 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                        <Icon icon="lucide:sliders-horizontal" width={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">User Filters</h4>
                        <p className="text-[11px] text-muted-foreground">Filter accounts by role and status</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted inline-flex items-center justify-center border-0 bg-transparent cursor-pointer"
                      aria-label="Close filters"
                    >
                      <Icon icon="lucide:x" width={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Role Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Icon icon="lucide:shield" width={13} />
                        <span>System Role</span>
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => onRoleChange?.(e.target.value)}
                        className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                      >
                        <option value="all">All Roles</option>
                        {SYSTEM_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Icon icon="lucide:check-circle" width={13} />
                        <span>Account Status</span>
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange?.(e.target.value)}
                        className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                      >
                        <option value="all">All Statuses</option>
                        {ACCOUNT_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-muted/30">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      disabled={activeCount === 0}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed border-0 bg-transparent cursor-pointer inline-flex items-center gap-1"
                    >
                      <Icon icon="lucide:rotate-ccw" width={12} />
                      <span>{t("article.xoaBoLoc", "Clear all")}</span>
                    </button>
                    <Button
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="h-8 px-4 text-xs font-semibold"
                    >
                      {t("apply", "Done")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Total Count summary */}
        {totalCount > 0 && (
          <div className="text-xs text-muted-foreground font-medium shrink-0 hidden sm:block">
            <span>{totalCount.toLocaleString('vi-VN')} {totalCount === 1 ? 'user' : 'users'}</span>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">Active filters:</span>
          {selectedRole !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal">
              <span>Role: {selectedRoleLabel}</span>
              <button
                type="button"
                onClick={() => onRoleChange?.('all')}
                className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer"
                aria-label="Remove role filter"
              >
                <Icon icon="lucide:x" width={11} />
              </button>
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal">
              <span>Status: {selectedStatus}</span>
              <button
                type="button"
                onClick={() => onStatusChange?.('all')}
                className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer"
                aria-label="Remove status filter"
              >
                <Icon icon="lucide:x" width={11} />
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] text-primary hover:underline font-semibold ml-1 border-0 bg-transparent cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  if (asCard) {
    return <div className="rounded-card border border-border bg-surface shadow-card mb-4">{content}</div>;
  }

  return content;
}
