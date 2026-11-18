import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

/**
 * Clean searchable dropdown component for filter selectors within the filter panel
 */
function SearchableFilterSelect({
  label,
  icon,
  value,
  selectedLabel,
  options = [],
  placeholder = 'All',
  searchable = true,
  disabled = false,
  emptyLabel = 'No options',
  onSelect,
  onClear,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!keyword.trim()) return options;
    const term = keyword.toLowerCase();
    return options.filter((o) => (o.label || '').toLowerCase().includes(term));
  }, [options, keyword]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        {icon && <Icon icon={icon} width={13} className="text-muted-foreground/80" />}
        <span>{label}</span>
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              setKeyword('');
            }
          }}
          className={`w-full h-9 px-3 text-xs rounded-control border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-surface-muted/50 border-border text-muted-foreground'
              : selectedLabel
                ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 hover:border-foreground/30'
          }`}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
            {selectedLabel && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear?.();
                }}
                className="hover:text-foreground p-0.5 rounded cursor-pointer"
                title="Clear"
              >
                <Icon icon="lucide:x" width={12} />
              </span>
            )}
            <Icon
              icon="lucide:chevron-down"
              width={13}
              className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 top-full mt-1 w-full min-w-[240px] max-w-[360px] bg-surface border border-border rounded-lg shadow-popover z-50 p-2 animate-in fade-in-0 duration-100">
            {searchable && (
              <div className="relative mb-2">
                <Icon
                  icon="lucide:search"
                  width={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t("article.searchValues", "Filter options...")}
                  autoFocus
                  className="w-full h-8 pl-7 pr-2 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClear?.();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left cursor-pointer border-0 transition-colors ${
                  !selectedLabel
                    ? 'bg-primary-subtle text-primary font-bold'
                    : 'text-foreground hover:bg-surface-muted bg-transparent'
                }`}
              >
                <span
                  className={`size-3.5 rounded border flex items-center justify-center shrink-0 ${
                    !selectedLabel ? 'border-primary bg-primary text-white' : 'border-border'
                  }`}
                >
                  {!selectedLabel && <Icon icon="lucide:check" width={10} />}
                </span>
                <span className="truncate font-medium">{placeholder}</span>
              </button>

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(value || '') === String(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.title || opt.label}
                      onClick={() => {
                        if (isSelected) {
                          onClear?.();
                        } else {
                          onSelect?.(opt.value);
                        }
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left cursor-pointer border-0 transition-colors ${
                        isSelected
                          ? 'bg-primary-subtle text-primary font-bold'
                          : 'text-foreground hover:bg-surface-muted bg-transparent'
                      }`}
                    >
                      <span
                        className={`size-3.5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                        }`}
                      >
                        {isSelected && <Icon icon="lucide:check" width={10} />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  {emptyLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilterPanel({
  searchInput = '',
  setSearchInput,
  onSearchSubmit,
  subjectAreas = [],
  subjectCategories = [],
  selectedAreas = [],
  selectedCategories = [],
  selectedAccess = [],
  selectedQuartiles = [],
  selectedYear = '',
  selectedZone = '',
  zones = [],
  onAreaSelect,
  onCategorySelect,
  onAccessSelect,
  onQuartileSelect,
  onYearSelect,
  onZoneSelect,
  isOaDiamond = false,
  onOaDiamondToggle,
  onClearAll,
  loading = false,
  asCard = true
}) {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const hasSelectedArea = selectedAreas.length > 0;
  const accessValue = selectedAccess[0] || 'all';
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

  // Close filter dropdown when clicking outside or pressing Escape
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

  const cleanLabel = (value = '') => {
    const parts = String(value).split(';').map(part => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : value;
  };

  const getAreaLabel = (areaId) => {
    const area = subjectAreas.find(item => String(item.subject_area_id) === String(areaId));
    return area ? cleanLabel(area.display_name) : '';
  };

  const getCategoryLabel = (cat) => {
    return cleanLabel(cat.display_name);
  };

  const visibleCategories = useMemo(() => {
    if (!hasSelectedArea) return [];
    return subjectCategories.filter(cat => !cat.subject_area_id || selectedAreas.includes(String(cat.subject_area_id)));
  }, [hasSelectedArea, selectedAreas, subjectCategories]);

  const zoneOptions = zones.map(zone => ({
    value: String(zone.zone_id),
    label: zone.name,
    title: zone.name
  }));

  const filterOptions = {
    area: subjectAreas.map(area => ({
      value: String(area.subject_area_id),
      label: cleanLabel(area.display_name),
      title: area.display_name
    })),
    category: visibleCategories.map(cat => ({
      value: String(cat.subject_category_id),
      label: getCategoryLabel(cat),
      title: cat.display_name
    })),
    zone: zoneOptions,
    year: yearOptions.map(year => ({
      value: String(year),
      label: String(year)
    }))
  };

  const selectedLabels = {
    area: selectedAreas[0] ? getAreaLabel(selectedAreas[0]) : '',
    category: selectedCategories[0] ? filterOptions.category.find(option => option.value === String(selectedCategories[0]))?.label || '' : '',
    zone: selectedZone ? zoneOptions.find(option => option.value === String(selectedZone))?.label || '' : '',
    quartile: selectedQuartiles[0] || '',
    year: selectedYear || ''
  };

  // Calculate active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedAreas.length > 0 && selectedAreas[0] !== 'all') count++;
    if (selectedCategories.length > 0 && selectedCategories[0] !== 'all') count++;
    if (selectedZone && selectedZone !== 'all') count++;
    if (selectedQuartiles.length > 0) count += selectedQuartiles.length;
    if (selectedYear && selectedYear !== 'all') count++;
    if (accessValue === 'open_access') count++;
    if (isOaDiamond) count++;
    return count;
  }, [selectedAreas, selectedCategories, selectedZone, selectedQuartiles, selectedYear, accessValue, isOaDiamond]);

  // Active filter chips list for quick deletion
  const activeChips = [];
  if (selectedLabels.area) {
    activeChips.push({
      id: 'area',
      label: t("catalog.subjectArea", "Subject area"),
      value: selectedLabels.area,
      onClear: () => onAreaSelect('all')
    });
  }
  if (selectedLabels.category) {
    activeChips.push({
      id: 'category',
      label: t("catalog.subjectCategory", "Category"),
      value: selectedLabels.category,
      onClear: () => onCategorySelect('all')
    });
  }
  if (selectedLabels.zone) {
    activeChips.push({
      id: 'zone',
      label: t("catalog.zone", "Zone / Country"),
      value: selectedLabels.zone,
      onClear: () => onZoneSelect('all')
    });
  }
  if (selectedQuartiles.length > 0) {
    selectedQuartiles.forEach(q => {
      activeChips.push({
        id: `quartile-${q}`,
        label: 'Quartile',
        value: q,
        onClear: () => onQuartileSelect(q)
      });
    });
  }
  if (selectedLabels.year) {
    activeChips.push({
      id: 'year',
      label: t("catalog.year", "Year"),
      value: selectedLabels.year,
      onClear: () => onYearSelect('all')
    });
  }
  if (accessValue === 'open_access') {
    activeChips.push({
      id: 'access',
      label: 'Access',
      value: 'Open Access',
      onClear: () => onAccessSelect('all')
    });
  }
  if (isOaDiamond) {
    activeChips.push({
      id: 'oa-diamond',
      label: 'Access',
      value: 'OA Diamond',
      onClear: () => onOaDiamondToggle?.(false)
    });
  }

  const content = (
    <div className="p-3 sm:p-3.5 bg-surface space-y-2.5">
      {/* 1. Single Filter Button + Search Input + Search Submit Button */}
      <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Icon
            icon="lucide:search"
            width={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput?.(e.target.value)}
            placeholder={t("catalog.searchInTable", "Search journals by title, ISSN, publisher, or subject area...")}
            className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
              aria-label="Clear search"
            >
              <Icon icon="lucide:x" width={13} />
            </button>
          )}
        </div>

        {/* 2. Single Filter Button with Dropdown Panel */}
        <div className="relative" ref={filterDropdownRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`h-9 px-3.5 text-xs rounded-control border transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs font-medium whitespace-nowrap ${
              activeFilterCount > 0 || isFilterOpen
                ? 'border-primary text-primary bg-primary-subtle font-semibold ring-1 ring-primary/20'
                : 'border-border bg-surface text-foreground hover:bg-surface-muted hover:border-foreground/30'
            }`}
            aria-expanded={isFilterOpen}
            aria-label="Filter options"
          >
            <Icon
              icon="lucide:sliders-horizontal"
              width={14}
              className={activeFilterCount > 0 ? "text-primary" : "text-muted-foreground"}
            />
            <span>{t("filter", "Filter")}</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-primary text-white">
                {activeFilterCount}
              </span>
            )}
            <Icon
              icon="lucide:chevron-down"
              width={13}
              className={`transition-transform duration-200 text-muted-foreground ${isFilterOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Panel: Bảng các filter */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[580px] md:w-[680px] max-w-[95vw] bg-surface border border-border rounded-xl shadow-popover z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
              {/* Filter Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                    <Icon icon="lucide:sliders-horizontal" width={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>{t("catalog.filterTitle", "Filters")}</span>
                      {activeFilterCount > 0 && (
                        <span className="text-[10px] font-semibold text-primary bg-primary-subtle px-1.5 py-0.5 rounded-full">
                          {activeFilterCount} {t("catalog.active", "active")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground m-0">
                      {t("catalog.filterSubtitle", "Refine journal catalog by subject area, region, quartile, and access.")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={onClearAll}
                      className="text-xs text-danger hover:underline font-semibold flex items-center gap-1 border-0 bg-transparent p-1 cursor-pointer"
                    >
                      <Icon icon="lucide:rotate-ccw" width={12} />
                      <span>{t("resetAll", "Reset")}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-muted flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors"
                    aria-label="Close filters"
                  >
                    <Icon icon="lucide:x" width={16} />
                  </button>
                </div>
              </div>

              {/* Filter Panel Body: Bảng các filter theo Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
                {/* 1. Subject Area */}
                <SearchableFilterSelect
                  label={t("catalog.subjectArea", "Subject area")}
                  icon="lucide:book-open"
                  value={selectedAreas[0]}
                  selectedLabel={selectedLabels.area}
                  options={filterOptions.area}
                  placeholder={t("catalog.allSubjectAreas", "All Subject Areas")}
                  disabled={loading}
                  onSelect={onAreaSelect}
                  onClear={() => onAreaSelect('all')}
                  emptyLabel={t("catalog.noAreas", "No areas found")}
                />

                {/* 2. Subject Category */}
                <SearchableFilterSelect
                  label={t("catalog.subjectCategory", "Subject category")}
                  icon="lucide:layers"
                  value={selectedCategories[0]}
                  selectedLabel={selectedLabels.category}
                  options={filterOptions.category}
                  placeholder={hasSelectedArea ? t("catalog.allCategories", "All Categories") : t("catalog.chonSubjectAreaTruoc", "Select Subject Area first")}
                  disabled={loading || !hasSelectedArea}
                  onSelect={onCategorySelect}
                  onClear={() => onCategorySelect('all')}
                  emptyLabel={hasSelectedArea ? t("catalog.khongCoCategoryPhuHop", "No categories found") : t("catalog.chonSubjectAreaTruoc", "Select Subject Area first")}
                />

                {/* 3. Zone / Country */}
                <SearchableFilterSelect
                  label={t("catalog.zoneCountry", "Zone / Country")}
                  icon="lucide:globe"
                  value={selectedZone}
                  selectedLabel={selectedLabels.zone}
                  options={filterOptions.zone}
                  placeholder={t("catalog.allZones", "All Zones / Countries")}
                  disabled={loading}
                  onSelect={onZoneSelect}
                  onClear={() => onZoneSelect('all')}
                  emptyLabel={t("catalog.noZones", "No countries found")}
                />

                {/* 4. Publication Year */}
                <SearchableFilterSelect
                  label={t("catalog.rankingYear", "Ranking Year")}
                  icon="lucide:calendar"
                  value={selectedYear}
                  selectedLabel={selectedLabels.year}
                  options={filterOptions.year}
                  placeholder={t("catalog.allYears", "All Years")}
                  disabled={loading}
                  onSelect={onYearSelect}
                  onClear={() => onYearSelect('all')}
                  emptyLabel={t("catalog.noYears", "No years available")}
                />

                {/* 5. Quartile Selection Buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon icon="lucide:award" width={13} className="text-muted-foreground/80" />
                    <span>{t("catalog.quartileRanking", "Quartile Ranking (SJR)")}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                      const isSelected = selectedQuartiles.includes(q);
                      const quartileStyles = {
                        Q1: isSelected ? 'bg-emerald-600 text-white font-bold border-emerald-700 shadow-xs' : 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20',
                        Q2: isSelected ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs' : 'border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
                        Q3: isSelected ? 'bg-amber-600 text-white font-bold border-amber-700 shadow-xs' : 'border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20',
                        Q4: isSelected ? 'bg-rose-600 text-white font-bold border-rose-700 shadow-xs' : 'border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20',
                      };
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => onQuartileSelect(q)}
                          className={`h-9 rounded-control border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${quartileStyles[q]}`}
                          aria-pressed={isSelected}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Access Type Checkboxes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon icon="lucide:unlock" width={13} className="text-muted-foreground/80" />
                    <span>{t("catalog.accessType", "Access Type")}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 p-2 rounded-control border text-xs font-medium cursor-pointer transition-colors ${
                      accessValue === 'open_access'
                        ? 'border-primary bg-primary-subtle/50 text-primary font-semibold'
                        : 'border-border bg-surface text-foreground hover:bg-surface-muted/50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={accessValue === 'open_access'}
                        onChange={() => onAccessSelect(accessValue === 'open_access' ? 'all' : 'open_access')}
                        className="size-3.5 rounded border-border text-primary accent-primary cursor-pointer"
                      />
                      <span>Open Access</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded-control border text-xs font-medium cursor-pointer transition-colors ${
                      isOaDiamond
                        ? 'border-primary bg-primary-subtle/50 text-primary font-semibold'
                        : 'border-border bg-surface text-foreground hover:bg-surface-muted/50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isOaDiamond}
                        onChange={() => onOaDiamondToggle && onOaDiamondToggle(!isOaDiamond)}
                        className="size-3.5 rounded border-border text-primary accent-primary cursor-pointer"
                      />
                      <span>OA Diamond</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Filter Panel Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/30">
                <span className="text-[11px] text-muted-foreground">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} ${t("catalog.filtersApplied", "filters selected")}`
                    : t("catalog.noFilterApplied", "No filters applied")}
                </span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onClearAll}
                      className="h-8 text-xs font-medium"
                    >
                      {t("resetAll", "Reset")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsFilterOpen(false);
                      onSearchSubmit?.();
                    }}
                    className="h-8 px-4 text-xs font-semibold"
                  >
                    {t("catalog.applyFilters", "Apply")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Submit Button */}
        <Button
          type="submit"
          size="sm"
          className="h-9 px-4 gap-1.5 shrink-0 text-xs font-semibold"
        >
          <Icon icon="lucide:search" width={14} />
          <span>{t("searchBtn", "Search")}</span>
        </Button>
      </form>

      {/* 3. Active Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">{t("catalog.activeFilters", "Active filters")}:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-subtle text-primary border border-primary/20"
            >
              <span>{chip.label}:</span>
              <strong className="font-semibold">{chip.value}</strong>
              <button
                type="button"
                onClick={chip.onClear}
                className="hover:bg-primary/20 rounded-full p-0.5 border-0 bg-transparent text-primary cursor-pointer ml-0.5 inline-flex items-center"
                title={`Remove ${chip.label}`}
                aria-label={`Remove ${chip.label}`}
              >
                <Icon icon="lucide:x" width={12} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-danger hover:underline ml-auto flex items-center gap-1 border-0 bg-transparent p-1 cursor-pointer"
          >
            <Icon icon="lucide:rotate-ccw" width={12} />
            <span>{t("resetAllFilters", "Reset all filters")}</span>
          </button>
        </div>
      )}
    </div>
  );

  if (!asCard) {
    return content;
  }

  return (
    <Card className="border-border bg-surface shadow-xs">
      {content}
    </Card>
  );
}
