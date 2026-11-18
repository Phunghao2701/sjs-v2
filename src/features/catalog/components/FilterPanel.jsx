import { useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Dropdown } from '../../../shared/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

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
  const [menuSearch, setMenuSearch] = useState({});
  const hasSelectedArea = selectedAreas.length > 0;
  const accessValue = selectedAccess[0] || 'all';
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

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
    quartile: ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
      value: q,
      label: q
    })),
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

  const filterConfigs = [
    {
      id: 'area',
      label: 'Subject area',
      selectedLabel: selectedLabels.area,
      options: filterOptions.area,
      disabled: loading,
      searchable: true,
      onSelect: onAreaSelect,
      onClear: () => onAreaSelect('all')
    },
    {
      id: 'category',
      label: 'Subject category',
      selectedLabel: selectedLabels.category,
      options: filterOptions.category,
      disabled: loading || !hasSelectedArea,
      searchable: true,
      emptyLabel: hasSelectedArea ? t("catalog.khongCoCategoryPhuHop", "No categories found") : t("catalog.chonSubjectAreaTruoc", "Select Subject Area first"),
      onSelect: onCategorySelect,
      onClear: () => onCategorySelect('all')
    },
    {
      id: 'zone',
      label: 'Zone / Country',
      selectedLabel: selectedLabels.zone,
      options: filterOptions.zone,
      disabled: loading,
      searchable: true,
      onSelect: onZoneSelect,
      onClear: () => onZoneSelect('all')
    },
    {
      id: 'quartile',
      label: 'Quartile',
      selectedLabel: selectedLabels.quartile,
      options: filterOptions.quartile,
      disabled: loading,
      onSelect: onQuartileSelect,
      onClear: () => onQuartileSelect('all')
    },
    {
      id: 'year',
      label: 'Year',
      selectedLabel: selectedLabels.year,
      options: filterOptions.year,
      disabled: loading,
      onSelect: onYearSelect,
      onClear: () => onYearSelect('all')
    }
  ];

  const activeChips = filterConfigs.filter(config => config.selectedLabel).map(config => ({
    id: config.id,
    label: config.label,
    value: config.selectedLabel,
    onClear: config.onClear
  }));

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

  const getFilteredOptions = (config) => {
    const keyword = (menuSearch[config.id] || '').trim().toLowerCase();
    if (!keyword) return config.options;
    return config.options.filter(option => option.label.toLowerCase().includes(keyword));
  };

  const renderDropdown = (config) => {
    const filteredOptions = getFilteredOptions(config);
    const activeValue = config.id === 'area' ? selectedAreas[0]
      : config.id === 'category' ? selectedCategories[0]
      : config.id === 'zone' ? selectedZone
      : config.id === 'quartile' ? selectedQuartiles[0]
      : selectedYear;

    return (
      <Dropdown key={config.id} className="catalog-filter-dropdown" autoClose="outside">
        <Dropdown.Toggle
          as="button"
          id={`catalog-filter-${config.id}`}
          className={`h-9 px-3 text-xs rounded-control border transition-colors !inline-flex !flex-row !items-center !gap-1.5 shadow-2xs whitespace-nowrap after:!hidden cursor-pointer ${
            config.selectedLabel
              ? 'border-primary text-primary bg-primary-subtle font-semibold'
              : 'border-border bg-surface text-foreground font-medium'
          }`}
          disabled={config.disabled}
        >
          <span className="truncate max-w-[150px]">{config.selectedLabel || config.label}</span>
          <Icon icon="lucide:chevron-down" width="14" className="shrink-0 text-muted-foreground" />
        </Dropdown.Toggle>

        <Dropdown.Menu className="catalog-filter-menu shadow-popover border border-border bg-surface p-2 rounded-card">
          <div className="catalog-filter-menu-header pb-2 mb-2 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span>{config.label}</span>
            {config.selectedLabel && (
              <button
                type="button"
                onClick={config.onClear}
                className="text-xs text-primary hover:underline font-medium border-0 bg-transparent p-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {config.searchable && (
            <div className="relative mb-2">
              <Icon icon="lucide:search" width="13" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                className="w-full h-8 pl-7 pr-2 text-xs rounded-control border border-border bg-surface-muted/30 text-foreground focus:outline-none focus:border-primary"
                value={menuSearch[config.id] || ''}
                onChange={event => setMenuSearch(prev => ({
                  ...prev,
                  [config.id]: event.target.value
                }))}
                placeholder={t("article.searchValues", "Filter list...")}
              />
            </div>
          )}

          <div className="catalog-filter-options max-h-56 overflow-y-auto space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = String(activeValue || '') === String(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.title || option.label}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-subtle text-primary font-bold'
                        : 'text-foreground hover:bg-surface-muted'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        config.onClear();
                        return;
                      }
                      config.onSelect(option.value);
                    }}
                  >
                    <span className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}>
                      {isSelected && <Icon icon="lucide:check" width="11" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                {config.emptyLabel || t("article.khongCoLuaChonPhuHop", "No options available")}
              </div>
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const content = (
    <div className="p-4 bg-surface space-y-3.5">
      {/* 1. Main Search Bar Row */}
      <form onSubmit={onSearchSubmit} className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Icon
            icon="lucide:search"
            width="17"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput?.(e.target.value)}
            placeholder={t("catalog.searchInTable", "Search journals by title, ISSN, publisher, or subject area...")}
            className="w-full h-11 pl-10 pr-9 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 transition-colors shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
              aria-label="Clear search"
            >
              <Icon icon="lucide:x" width="15" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="default"
          className="h-11 px-5 gap-2 shrink-0"
        >
          <Icon icon="lucide:search" width={16} />
          <span>Search</span>
        </Button>
      </form>

      {/* 2. Dropdown Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
          <Icon icon="lucide:filter" width="13" /> Filters:
        </span>

        {filterConfigs.map(renderDropdown)}

        {/* More Filters Dropdown (Open Access switches) */}
        <Dropdown className="catalog-filter-dropdown" autoClose="outside">
          <Dropdown.Toggle
            as="button"
            id="catalog-more-filters"
            className={`h-9 px-3 text-xs rounded-control border transition-colors !inline-flex !flex-row !items-center !gap-1.5 shadow-2xs whitespace-nowrap after:!hidden cursor-pointer ${
              accessValue === 'open_access' || isOaDiamond
                ? 'border-primary text-primary bg-primary-subtle font-semibold'
                : 'border-border bg-surface text-foreground font-medium'
            }`}
          >
            <Icon icon="lucide:sliders-horizontal" width="14" className="shrink-0" />
            <span>Access Type</span>
            <Icon icon="lucide:chevron-down" width="14" className="shrink-0 text-muted-foreground" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="catalog-filter-menu shadow-popover border border-border bg-surface p-3 rounded-card min-w-[260px]">
            <div className="text-xs font-semibold text-foreground pb-2 mb-2 border-b border-border">
              Access Options
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between gap-3 text-xs font-medium text-foreground cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded-control">
                <span>Only Open Access</span>
                <input
                  type="checkbox"
                  checked={accessValue === 'open_access'}
                  onChange={() => onAccessSelect(accessValue === 'open_access' ? 'all' : 'open_access')}
                  className="size-4 rounded border-border text-primary accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-xs font-medium text-foreground cursor-pointer hover:bg-surface-muted/50 p-1.5 rounded-control">
                <span>Only OA Diamond</span>
                <input
                  type="checkbox"
                  checked={isOaDiamond}
                  onChange={() => onOaDiamondToggle && onOaDiamondToggle(!isOaDiamond)}
                  className="size-4 rounded border-border text-primary accent-primary cursor-pointer"
                />
              </label>
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* Clear All Inline Action */}
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-danger hover:underline ml-auto flex items-center gap-1 border-0 bg-transparent p-1 cursor-pointer"
          >
            <Icon icon="lucide:rotate-ccw" width="12" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {/* 3. Active Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-medium text-muted-foreground">Active filters:</span>
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
                className="hover:bg-primary/20 rounded-full p-0.5 border-0 bg-transparent text-primary cursor-pointer ml-0.5"
                title={`Remove ${chip.label}`}
                aria-label={`Remove ${chip.label}`}
              >
                <Icon icon="lucide:x" width="12" />
              </button>
            </span>
          ))}
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
