import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';

export default function JournalSearchBar({
  searchInput,
  setSearchInput,
  quartile,
  setQuartile,
  isOpenAccess,
  setIsOpenAccess,
  onSubmit,
  onClear
}) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="journal-search-panel">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
        {/* Search Input Box */}
        <div className="sm:col-span-2 md:col-span-6">
          <div className="relative flex items-center">
            <Icon icon="lucide:search" width="18" className="absolute left-3 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("journal.timJournal", "Tìm kiếm tạp chí...")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-24 h-10"
            />
            <div className="absolute right-1 flex items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchInput('')}
                >
                  <Icon icon="lucide:x" width="16" />
                </button>
              )}
              <Button type="submit" size="sm" className="h-8 px-3">
                {t("search", "Tìm")}
              </Button>
            </div>
          </div>
        </div>

        {/* Quartile Dropdown */}
        <div className="sm:col-span-1 md:col-span-2">
          <select
            value={quartile}
            onChange={(e) => setQuartile(e.target.value)}
            className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
          >
            <option value="all">{t("journal.tatCaQuartile", "Tất cả Quartile")}</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>

        {/* Access Dropdown */}
        <div className="sm:col-span-1 md:col-span-2">
          <select
            value={isOpenAccess}
            onChange={(e) => setIsOpenAccess(e.target.value)}
            className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
          >
            <option value="all">{t("journal.tatCaTruyCap", "Tất cả truy cập")}</option>
            <option value="oa">Open Access (OA)</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        {/* Clear Button */}
        <div className="sm:col-span-2 md:col-span-2 flex justify-center sm:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="gap-1.5 h-10">
            <Icon icon="lucide:refresh-cw" width="14" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
