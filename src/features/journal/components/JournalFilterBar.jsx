import { useTranslation } from "react-i18next";
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Icon } from '@iconify/react';

/**
 * Component JournalFilterBar - Thanh công cụ lọc, tìm kiếm và chuyển đổi giao diện hiển thị.
 */
export default function JournalFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
      {/* Ô tìm kiếm */}
      <div className="relative flex-1 max-w-md">
        <Input
          type="text"
          placeholder={t("journal.timKiemTheoTenTapChiHoacIssn", "Tìm kiếm theo tên tạp chí hoặc ISSN...")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="w-full sm:w-48">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
        >
          <option value="All">{t("journal.tatCaTrangThai", "Tất cả trạng thái")}</option>
          <option value="Active">{t("journal.dangHoatDongActive", "Đang hoạt động (Active)")}</option>
          <option value="Draft">{t("journal.banNhapDraft", "Bản nháp (Draft)")}</option>
        </select>
      </div>

      {/* View mode toggle & Add action */}
      <div className="flex items-center justify-between sm:justify-end gap-2">
        <div className="inline-flex rounded-lg border border-border p-1 bg-surface-muted/50">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <Icon icon="lucide:table" width="14" />
            <span>{t("journal.bang", "Bảng")}</span>
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('card')}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <Icon icon="lucide:layout-grid" width="14" />
            <span>{t("journal.the", "Thẻ")}</span>
          </Button>
        </div>

        <Button onClick={onOpenAddModal} size="sm" className="gap-1.5 h-10 px-4">
          <Icon icon="lucide:plus-circle" width="16" />
          <span>{t("journal.themTapChi", "Thêm tạp chí")}</span>
        </Button>
      </div>
    </div>
  );
}
