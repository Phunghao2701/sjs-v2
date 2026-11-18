import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { getArticleFilterOptionsApi } from '../api/articleApi';
import { searchJournalsApi, getJournalByIdApi } from '../../journal/api/journalApi';
import { getTopicsApi, getTopicByIdApi } from '../../topic/api/topic.api';

/**
 * Searchable select component used inside Article filter dropdown panel
 */
function ArticleSearchableSelect({
  label,
  icon,
  value,
  selectedLabel,
  options = [],
  placeholder = 'All',
  searchable = true,
  searching = false,
  searchValue = '',
  onSearchChange,
  emptyLabel = 'No options',
  onSelect,
  onClear,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
    if (onSearchChange) return options; // Server-side filtering
    if (!searchValue.trim()) return options;
    const term = searchValue.toLowerCase();
    return options.filter((o) => (o.label || '').toLowerCase().includes(term));
  }, [options, searchValue, onSearchChange]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        {icon && <Icon icon={icon} width={13} className="text-muted-foreground/80" />}
        <span>{label}</span>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full h-9 px-3 text-xs rounded-control border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
            selectedLabel
              ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
              : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 hover:border-foreground/30'
          }`}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
            {selectedLabel && (
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

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full min-w-[240px] max-w-[360px] bg-surface border border-border rounded-lg shadow-popover z-50 p-2 animate-in fade-in-0 duration-100">
            {searchable && (
              <div className="relative mb-2">
                {searching ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                    width={13}
                  />
                ) : (
                  <Icon
                    icon="lucide:search"
                    width={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                )}
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
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
                      title={opt.label}
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
                      <span className="truncate flex-1">{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          ({opt.count})
                        </span>
                      )}
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

export default function ArticleFilterBar({
  filters,
  updateFilters,
  clearFilters,
  asCard = true
}) {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const SORT_OPTIONS = [
    { value: 'created_at-desc', label: t("article.moiNhat", "Newest first") },
    { value: 'created_at-asc', label: t("article.cuNhat", "Oldest first") },
    { value: 'title-asc', label: t("article.tieuDeAz", "Title (A-Z)") },
    { value: 'title-desc', label: t("article.tieuDeZa", "Title (Z-A)") },
    { value: 'publication_year-desc', label: t("article.namXuatBanGiam", "Publication Year (Desc)") },
    { value: 'publication_year-asc', label: t("article.namXuatBanTang", "Publication Year (Asc)") }
  ];

  const ACCESS_OPTIONS = [
    { value: 'all', label: t("article.tatCa", "All Articles") },
    { value: 'oa', label: t("article.chiHienThiOpenAccess", "Open Access Only") },
    { value: 'closed', label: t("article.chiHienThiKhongOpenAccess", "Subscription / Closed Only") }
  ];

  // Options states
  const [yearOptions, setYearOptions] = useState([]);
  const [baseJournalOptions, setBaseJournalOptions] = useState([]);
  const [journalOptions, setJournalOptions] = useState([]);
  const [baseTopicOptions, setBaseTopicOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  // Local search input state for smooth typing
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Keep search input in sync if parent filters change externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Loading & search states
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [searchingJournals, setSearchingJournals] = useState(false);
  const [searchingTopics, setSearchingTopics] = useState(false);
  const [menuSearch, setMenuSearch] = useState({ year: '', journal: '', topic: '' });

  // Selected item custom labels
  const [selectedJournalName, setSelectedJournalName] = useState('');
  const [selectedTopicName, setSelectedTopicName] = useState('');

  // Close filter dropdown on click outside or Escape
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

  // 1. Fetch metadata bộ lọc ban đầu
  useEffect(() => {
    let isMounted = true;

    const fetchInitialFilterMetadata = async () => {
      setLoadingFilters(true);
      try {
        const response = await getArticleFilterOptionsApi();
        if (isMounted && response?.data?.success && response?.data?.data) {
          const { years = [], journals = [], topics = [] } = response.data.data;

          const formattedYears = years.map((y) => ({
            value: String(y),
            label: String(y)
          }));
          setYearOptions(formattedYears);

          const formattedJournals = journals.map((j) => ({
            value: String(j.journal_id),
            label: j.display_name,
            count: j.article_count
          }));
          setBaseJournalOptions(formattedJournals);
          setJournalOptions(formattedJournals);

          const formattedTopics = topics.map((tp) => ({
            value: String(tp.topic_id),
            label: tp.display_name,
            count: tp.article_count
          }));
          setBaseTopicOptions(formattedTopics);
          setTopicOptions(formattedTopics);
        }
      } catch (error) {
        console.error('Failed to fetch article filter options from server:', error);
      } finally {
        if (isMounted) setLoadingFilters(false);
      }
    };

    fetchInitialFilterMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Resolve selected journal name
  useEffect(() => {
    const journalId = filters.selectedJournal;
    if (!journalId || journalId === 'all') {
      setSelectedJournalName('');
      return;
    }

    const found = journalOptions.find((o) => String(o.value) === String(journalId))
      || baseJournalOptions.find((o) => String(o.value) === String(journalId));

    if (found) {
      setSelectedJournalName(found.label);
    } else {
      let isCurrent = true;
      getJournalByIdApi(journalId)
        .then((res) => {
          if (!isCurrent) return;
          const journalData = res?.data?.data || res?.data;
          const name = journalData?.display_name || `Journal #${journalId}`;
          setSelectedJournalName(name);
          setJournalOptions((prev) => {
            if (prev.some((o) => String(o.value) === String(journalId))) return prev;
            return [{ value: String(journalId), label: name }, ...prev];
          });
        })
        .catch(() => {
          if (isCurrent) setSelectedJournalName(`Journal #${journalId}`);
        });

      return () => {
        isCurrent = false;
      };
    }
  }, [filters.selectedJournal, journalOptions, baseJournalOptions]);

  // 3. Resolve selected topic name
  useEffect(() => {
    const topicId = filters.selectedTopic;
    if (!topicId || topicId === 'all') {
      setSelectedTopicName('');
      return;
    }

    const found = topicOptions.find((o) => String(o.value) === String(topicId))
      || baseTopicOptions.find((o) => String(o.value) === String(topicId));

    if (found) {
      setSelectedTopicName(found.label);
    } else {
      let isCurrent = true;
      getTopicByIdApi(topicId)
        .then((res) => {
          if (!isCurrent) return;
          const topicData = res?.data?.data || res?.data;
          const name = topicData?.display_name || topicData?.name || `Topic #${topicId}`;
          setSelectedTopicName(name);
          setTopicOptions((prev) => {
            if (prev.some((o) => String(o.value) === String(topicId))) return prev;
            return [{ value: String(topicId), label: name }, ...prev];
          });
        })
        .catch(() => {
          if (isCurrent) setSelectedTopicName(`Topic #${topicId}`);
        });

      return () => {
        isCurrent = false;
      };
    }
  }, [filters.selectedTopic, topicOptions, baseTopicOptions]);

  // 4. Server-side debounced search cho Tạp chí
  useEffect(() => {
    const keyword = menuSearch.journal.trim();
    if (!keyword) {
      setJournalOptions(baseJournalOptions);
      setSearchingJournals(false);
      return;
    }

    setSearchingJournals(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchJournalsApi({ search: keyword, limit: 40 });
        const items = res?.data?.data?.items || res?.data?.items || [];
        const mapped = items.map((j) => ({
          value: String(j.journal_id),
          label: j.display_name
        }));
        setJournalOptions(mapped);
      } catch (err) {
        console.error('Error searching journals:', err);
      } finally {
        setSearchingJournals(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [menuSearch.journal, baseJournalOptions]);

  // 5. Server-side debounced search cho Topic
  useEffect(() => {
    const keyword = menuSearch.topic.trim();
    if (!keyword) {
      setTopicOptions(baseTopicOptions);
      setSearchingTopics(false);
      return;
    }

    setSearchingTopics(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getTopicsApi({ search: keyword, limit: 40 });
        const topicData = res?.data?.data || res?.data;
        const items = topicData?.topics || topicData?.items || (Array.isArray(topicData) ? topicData : []);
        const mapped = items.map((tp) => ({
          value: String(tp.topic_id || tp.id),
          label: tp.display_name || tp.name || `Topic #${tp.topic_id || tp.id}`
        })).filter((item) => item.value && item.label);
        setTopicOptions(mapped);
      } catch (err) {
        console.error('Error searching topics:', err);
      } finally {
        setSearchingTopics(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [menuSearch.topic, baseTopicOptions]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '' });
  };

  const handleSelectChange = (key) => (val) => {
    updateFilters({ [key]: val });
  };

  const handleSortChange = (val) => {
    const [sortBy, sortOrder] = val.split('-');
    updateFilters({ sortBy, sortOrder });
  };

  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedYear && filters.selectedYear !== 'all') count++;
    if (filters.selectedJournal && filters.selectedJournal !== 'all') count++;
    if (filters.selectedTopic && filters.selectedTopic !== 'all') count++;
    if (filters.selectedAccess && filters.selectedAccess !== 'all') count++;
    if (currentSortValue !== 'created_at-desc') count++;
    return count;
  }, [filters.selectedYear, filters.selectedJournal, filters.selectedTopic, filters.selectedAccess, currentSortValue]);

  // Active chips
  const activeChips = [];
  if (filters.selectedYear && filters.selectedYear !== 'all') {
    activeChips.push({
      id: 'year',
      label: t("article.nam", "Year"),
      value: filters.selectedYear,
      onClear: () => handleSelectChange('year')('all')
    });
  }

  if (filters.selectedJournal && filters.selectedJournal !== 'all') {
    activeChips.push({
      id: 'journal',
      label: t("typeJournal", "Journal"),
      value: selectedJournalName || filters.selectedJournal,
      onClear: () => handleSelectChange('journal')('all')
    });
  }

  if (filters.selectedTopic && filters.selectedTopic !== 'all') {
    activeChips.push({
      id: 'topic',
      label: t("article.chuDe", "Topic"),
      value: selectedTopicName || filters.selectedTopic,
      onClear: () => handleSelectChange('topic')('all')
    });
  }

  if (filters.selectedAccess === 'oa') {
    activeChips.push({
      id: 'access',
      label: 'Access',
      value: 'Open Access',
      onClear: () => handleSelectChange('access')('all')
    });
  } else if (filters.selectedAccess === 'closed') {
    activeChips.push({
      id: 'access',
      label: 'Access',
      value: t("article.chiHienThiKhongOpenAccess", "Subscription"),
      onClear: () => handleSelectChange('access')('all')
    });
  }

  if (currentSortValue !== 'created_at-desc') {
    activeChips.push({
      id: 'sort',
      label: 'Sort',
      value: SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label || currentSortValue,
      onClear: () => handleSortChange('created_at-desc')
    });
  }

  const content = (
    <div className="p-3 sm:p-3.5 bg-surface space-y-2.5">
      {/* 1. Single Filter Button + Search Input + Search Submit Button */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
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
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("article.timBaiBaoDoiTuKhoa", "Search papers by title, abstract, DOI, topic, or keywords...")}
            className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
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
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                    <Icon icon="lucide:sliders-horizontal" width={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <span>{t("article.filterTitle", "Article Filters")}</span>
                      {activeFilterCount > 0 && (
                        <span className="text-[10px] font-semibold text-primary bg-primary-subtle px-1.5 py-0.5 rounded-full">
                          {activeFilterCount} {t("article.active", "active")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground m-0">
                      {t("article.filterSubtitle", "Refine scientific articles by journal, field, year, and access mode.")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
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

              {/* Body: Bảng các filter theo Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
                {/* 1. Tạp chí (Journal) */}
                <ArticleSearchableSelect
                  label={t("typeJournal", "Journal")}
                  icon="lucide:book-open"
                  value={filters.selectedJournal}
                  selectedLabel={filters.selectedJournal !== 'all' ? (selectedJournalName || filters.selectedJournal) : ''}
                  options={journalOptions}
                  placeholder={t("article.allJournals", "All Journals")}
                  searchable={true}
                  searching={searchingJournals}
                  searchValue={menuSearch.journal}
                  onSearchChange={(kw) => setMenuSearch((prev) => ({ ...prev, journal: kw }))}
                  onSelect={handleSelectChange('journal')}
                  onClear={() => handleSelectChange('journal')('all')}
                  emptyLabel={t("article.khongTimThayTapChi", "No journals found")}
                />

                {/* 2. Chủ đề / Lĩnh vực (Topic) */}
                <ArticleSearchableSelect
                  label={t("article.chuDe", "Topic / Field")}
                  icon="lucide:layers"
                  value={filters.selectedTopic}
                  selectedLabel={filters.selectedTopic !== 'all' ? (selectedTopicName || filters.selectedTopic) : ''}
                  options={topicOptions}
                  placeholder={t("article.allTopics", "All Topics")}
                  searchable={true}
                  searching={searchingTopics}
                  searchValue={menuSearch.topic}
                  onSearchChange={(kw) => setMenuSearch((prev) => ({ ...prev, topic: kw }))}
                  onSelect={handleSelectChange('topic')}
                  onClear={() => handleSelectChange('topic')('all')}
                  emptyLabel={t("article.khongTimThayChuDe", "No topics found")}
                />

                {/* 3. Năm xuất bản (Publication Year) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon icon="lucide:calendar" width={13} className="text-muted-foreground/80" />
                    <span>{t("article.nam", "Publication Year")}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.selectedYear || 'all'}
                      onChange={(e) => handleSelectChange('year')(e.target.value)}
                      className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border bg-surface transition-colors cursor-pointer appearance-none ${
                        filters.selectedYear && filters.selectedYear !== 'all'
                          ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                          : 'border-border text-foreground hover:bg-surface-muted/40'
                      }`}
                    >
                      <option value="all">{t("article.allYears", "All Years")}</option>
                      {yearOptions.map((y) => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                    <Icon icon="lucide:chevron-down" width={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* 4. Trạng thái truy cập (Access Type) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon icon="lucide:unlock" width={13} className="text-muted-foreground/80" />
                    <span>{t("article.trangThaiTruyCap", "Access Type")}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.selectedAccess || 'all'}
                      onChange={(e) => handleSelectChange('access')(e.target.value)}
                      className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border bg-surface transition-colors cursor-pointer appearance-none ${
                        filters.selectedAccess && filters.selectedAccess !== 'all'
                          ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                          : 'border-border text-foreground hover:bg-surface-muted/40'
                      }`}
                    >
                      {ACCESS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <Icon icon="lucide:chevron-down" width={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* 5. Sắp xếp (Sort By) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Icon icon="lucide:arrow-up-down" width={13} className="text-muted-foreground/80" />
                    <span>{t("article.sapXep", "Sort By")}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={currentSortValue}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border bg-surface transition-colors cursor-pointer appearance-none ${
                        currentSortValue !== 'created_at-desc'
                          ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                          : 'border-border text-foreground hover:bg-surface-muted/40'
                      }`}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <Icon icon="lucide:chevron-down" width={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/30">
                <span className="text-[11px] text-muted-foreground">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} ${t("article.filtersApplied", "filters selected")}`
                    : t("article.noFilterApplied", "No filters applied")}
                </span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
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
                      updateFilters({ search: searchInput.trim() });
                    }}
                    className="h-8 px-4 text-xs font-semibold"
                  >
                    {t("article.applyFilters", "Apply")}
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
          <span className="text-[11px] font-medium text-muted-foreground">{t("article.activeFilters", "Active filters")}:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.id}
              variant="info"
              className="gap-1 px-2.5 py-0.5 text-xs font-medium"
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
            </Badge>
          ))}

          {/* Reset All Inline Action */}
          <button
            type="button"
            onClick={clearFilters}
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
