import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi } from '../../../journal/api/journalApi';
import PrimaryButton from '../../../../shared/components/Button/PrimaryButton';
import { HeaderFilterCard } from '../../../../shared/components/Card';
import { FilterSearch, FilterSelect } from '../../../../shared/components/Input';

/**
 * Component JournalFilterBar - Thanh công cụ lọc, tìm kiếm và chuyển đổi giao diện hiển thị.
 */
export default function JournalFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  subjectFilter = 'All',
  onSubjectChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal
}) {
  const { t } = useTranslation();
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <HeaderFilterCard className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-4">
          <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
            Search Journals
          </label>
          <FilterSearch value={search} onChange={e => onSearchChange(e.target.value)} placeholder={t("admin.searchByTitleIssn")} />
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
            Status
          </label>
          <FilterSelect
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' }
            ]}
          />
        </div>

        {/* Subject Area Filter */}
        <div className="lg:col-span-3">
          <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
            Subject Area
          </label>
          <FilterSelect
            value={subjectFilter}
            onChange={e => onSubjectChange(e.target.value)}
            disabled={loading}
            options={[
              { value: 'All', label: 'All Subject Areas' },
              ...subjectAreas.map(area => ({
                value: area.display_name || area.name,
                label: area.display_name || area.name
              }))
            ]}
          />
        </div>

        {/* View Mode & Add Button */}
        <div className="lg:col-span-3 flex justify-start lg:justify-end items-end gap-3">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-border bg-surface p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
            >
              <Icon icon="lucide:layout-list" width="16" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Card view"
            >
              <Icon icon="lucide:grid" width="16" />
            </button>
          </div>

          {/* Add Journal Button */}
          <PrimaryButton className="whitespace-nowrap h-10 px-4" onClick={onOpenAddModal}>
            <Icon icon="lucide:plus" width="16" className="mr-1.5" />
            <span>Create Journal</span>
          </PrimaryButton>
        </div>
      </div>
    </HeaderFilterCard>
  );
}
