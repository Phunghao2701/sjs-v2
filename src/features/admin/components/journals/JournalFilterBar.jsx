import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi } from '../../../journal/api/journalApi';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';

/**
 * Component JournalFilterBar - Thanh công cụ lọc, tìm kiếm và chuyển đổi giao diện hiển thị đồng bộ hệ thống.
 */
export default function JournalFilterBar({
  search = '',
  onSearchChange,
  statusFilter = 'All',
  onStatusChange,
  subjectFilter = 'All',
  onSubjectChange,
  viewMode = 'table',
  onViewModeChange,
  onOpenAddModal,
  asCard = false
}) {
  const { t } = useTranslation();
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const fetchSubjectAreas = async () => {
      setLoading(true);
      try {
        const response = await getSubjectAreasApi({
          page: 1,
          limit: 100
        });
        if (ignore) return;
        const items = response.data?.data?.items || response.data?.data || [];
        setSubjectAreas(items);
      } catch (err) {
        console.error('Failed to fetch subject areas for filter:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchSubjectAreas();
    return () => {
      ignore = true;
    };
  }, []);

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

  // Count active filters
  const activeCount = (statusFilter !== 'All' ? 1 : 0) + (subjectFilter !== 'All' ? 1 : 0);

  const handleClearFilters = () => {
    onStatusChange?.('All');
    onSubjectChange?.('All');
  };

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
              placeholder={t("admin.searchByTitleIssn", "Search by title, ISSN...")}
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
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[380px] bg-surface border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
                  style={{ zIndex: 60 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                        <Icon icon="lucide:sliders-horizontal" width={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Journal Filters</h4>
                        <p className="text-[11px] text-muted-foreground">Filter journals by status and subject</p>
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
                  <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Icon icon="lucide:check-circle" width={13} />
                        <span>Status</span>
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange?.(e.target.value)}
                        className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    {/* Subject Area Filter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Icon icon="lucide:layers" width={13} />
                        <span>Subject Area</span>
                      </label>
                      <select
                        value={subjectFilter}
                        onChange={(e) => onSubjectChange?.(e.target.value)}
                        disabled={loading}
                        className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer truncate shadow-2xs"
                      >
                        <option value="All">All Subject Areas</option>
                        {subjectAreas.map((area) => {
                          const val = area.display_name || area.name;
                          return (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          );
                        })}
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

        {/* Right: View Mode Toggle & Create Journal Button */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-control border border-border bg-surface p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange?.('table')}
              className={`p-1.5 rounded transition-colors border-0 cursor-pointer ${
                viewMode === 'table' ? 'bg-primary text-white shadow-2xs' : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <Icon icon="lucide:layout-list" width={14} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.('card')}
              className={`p-1.5 rounded transition-colors border-0 cursor-pointer ${
                viewMode === 'card' ? 'bg-primary text-white shadow-2xs' : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
              title="Card view"
              aria-label="Card view"
            >
              <Icon icon="lucide:grid" width={14} />
            </button>
          </div>

          {/* Create Journal Button */}
          {onOpenAddModal && (
            <Button
              size="sm"
              onClick={onOpenAddModal}
              className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <Icon icon="lucide:plus" width={14} />
              <span>Create Journal</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">Active filters:</span>
          {statusFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal">
              <span>Status: {statusFilter}</span>
              <button
                type="button"
                onClick={() => onStatusChange?.('All')}
                className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer"
                aria-label="Remove status filter"
              >
                <Icon icon="lucide:x" width={11} />
              </button>
            </Badge>
          )}
          {subjectFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal max-w-[200px] truncate">
              <span className="truncate">Subject: {subjectFilter}</span>
              <button
                type="button"
                onClick={() => onSubjectChange?.('All')}
                className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer shrink-0"
                aria-label="Remove subject filter"
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
