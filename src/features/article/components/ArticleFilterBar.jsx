import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Dropdown } from '../../../shared/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { getArticleFilterOptionsApi } from '../api/articleApi';
import { searchJournalsApi, getJournalByIdApi } from '../../journal/api/journalApi';
import { getTopicsApi, getTopicByIdApi } from '../../topic/api/topic.api';

export default function ArticleFilterBar({
  filters,
  updateFilters,
  clearFilters,
  asCard = true
}) {
  const { t } = useTranslation();

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

  // Filter Configs
  const filterConfigs = [
    {
      id: 'year',
      label: t("article.nam", "Publication Year"),
      options: yearOptions,
      selectedLabel: filters.selectedYear !== 'all' ? filters.selectedYear : '',
      onSelect: handleSelectChange('year'),
      onClear: () => handleSelectChange('year')('all'),
      searchable: true,
      onSearchChange: (keyword) => setMenuSearch((prev) => ({ ...prev, year: keyword })),
      emptyLabel: t("article.khongCoLuaChonPhuHop", "No years available")
    },
    {
      id: 'journal',
      label: t("typeJournal", "Journal"),
      options: journalOptions,
      selectedLabel: filters.selectedJournal !== 'all' ? (selectedJournalName || filters.selectedJournal) : '',
      onSelect: handleSelectChange('journal'),
      onClear: () => handleSelectChange('journal')('all'),
      searchable: true,
      searching: searchingJournals,
      onSearchChange: (keyword) => setMenuSearch((prev) => ({ ...prev, journal: keyword })),
      emptyLabel: t("article.khongTimThayTapChi", "No journals found")
    },
    {
      id: 'topic',
      label: t("article.chuDe", "Topic / Field"),
      options: topicOptions,
      selectedLabel: filters.selectedTopic !== 'all' ? (selectedTopicName || filters.selectedTopic) : '',
      onSelect: handleSelectChange('topic'),
      onClear: () => handleSelectChange('topic')('all'),
      searchable: true,
      searching: searchingTopics,
      onSearchChange: (keyword) => setMenuSearch((prev) => ({ ...prev, topic: keyword })),
      emptyLabel: t("article.khongTimThayChuDe", "No topics found")
    }
  ];

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

  const getFilteredOptions = (config) => {
    if (config.id === 'year') {
      const keyword = (menuSearch.year || '').trim().toLowerCase();
      if (!keyword) return config.options;
      return config.options.filter((o) => o.label.toLowerCase().includes(keyword));
    }
    return config.options;
  };

  const renderDropdown = (config) => {
    const filteredOptions = getFilteredOptions(config);
    const activeValue = config.id === 'year'
      ? filters.selectedYear
      : config.id === 'journal'
        ? filters.selectedJournal
        : filters.selectedTopic;

    const buttonDisplayLabel = config.selectedLabel || config.label;

    return (
      <Dropdown key={config.id} className="article-filter-dropdown" autoClose="outside">
        <Dropdown.Toggle
          as="button"
          id={`article-filter-${config.id}`}
          className={`h-9 px-3 text-xs rounded-control border bg-surface text-foreground font-medium transition-colors !inline-flex !flex-row !items-center !gap-1.5 shadow-2xs whitespace-nowrap after:!hidden cursor-pointer ${
            config.selectedLabel ? 'border-primary text-primary bg-primary-subtle font-semibold' : 'border-border'
          }`}
          disabled={loadingFilters}
        >
          <span className="truncate max-w-[160px]">{buttonDisplayLabel}</span>
          <Icon icon="lucide:chevron-down" width="14" className="shrink-0 text-muted-foreground" />
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow-popover border border-border bg-surface p-2.5 rounded-card min-w-[260px] max-w-[340px]">
          <div className="pb-2 mb-2 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span>{config.label}</span>
            {config.selectedLabel && (
              <button
                type="button"
                onClick={() => {
                  config.onClear();
                  setMenuSearch((prev) => ({ ...prev, [config.id]: '' }));
                }}
                className="text-xs text-primary hover:underline font-medium border-0 bg-transparent p-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {config.searchable && (
            <div className="relative mb-2">
              {config.searching ? (
                <Icon icon="lucide:loader-2" className="absolute left-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" width="13" />
              ) : (
                <Icon icon="lucide:search" width="13" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
              <input
                type="search"
                className="w-full h-8 pl-7 pr-2 text-xs rounded-control border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                value={menuSearch[config.id] || ''}
                onChange={(e) => {
                  if (config.onSearchChange) {
                    config.onSearchChange(e.target.value);
                  }
                }}
                placeholder={t("article.searchValues", "Filter options...")}
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = String(activeValue || '') === String(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.label}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left transition-colors cursor-pointer border-0 ${
                      isSelected
                        ? 'bg-primary-subtle text-primary font-bold'
                        : 'text-foreground hover:bg-surface-muted bg-transparent'
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
                    <span className="truncate flex-1">{option.label}</span>
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

  const isMoreFiltersActive = filters.selectedAccess && filters.selectedAccess !== 'all';

  const content = (
    <div className="p-4 bg-surface space-y-3.5">
      {/* 1. Main Search Bar Row */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5">
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
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("article.timBaiBaoDoiTuKhoa", "Search papers by title, abstract, DOI, topic, or keywords...")}
            className="w-full h-11 pl-10 pr-9 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 transition-colors shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
              aria-label="Clear search"
            >
              <Icon icon="lucide:x" width="15" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 px-5 rounded-control shadow-xs flex items-center gap-2 shrink-0"
        >
          <Icon icon="lucide:search" width="15" />
          <span>Search</span>
        </Button>
      </form>

      {/* 2. Dropdown Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
          <Icon icon="lucide:filter" width="13" /> Filters:
        </span>

        {/* Dynamic dropdowns: Year, Journal, Topic */}
        {filterConfigs.map(renderDropdown)}

        {/* Access Type Dropdown */}
        <Dropdown className="article-filter-dropdown" autoClose="outside">
          <Dropdown.Toggle
            as="button"
            id="article-access-filters"
            className={`h-9 px-3 text-xs rounded-control border bg-surface text-foreground font-medium transition-colors !inline-flex !flex-row !items-center !gap-1.5 shadow-2xs whitespace-nowrap after:!hidden cursor-pointer ${
              isMoreFiltersActive ? 'border-primary text-primary bg-primary-subtle font-semibold' : 'border-border'
            }`}
          >
            <Icon icon="lucide:unlock" width="13" className="shrink-0" />
            <span>
              {isMoreFiltersActive
                ? ACCESS_OPTIONS.find((o) => o.value === filters.selectedAccess)?.label || "Access"
                : "Access Type"}
            </span>
            <Icon icon="lucide:chevron-down" width="14" className="shrink-0 text-muted-foreground" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow-popover border border-border bg-surface p-2.5 rounded-card min-w-[220px]">
            <div className="pb-2 mb-2 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{t("article.trangThaiTruyCap", "Access Type")}</span>
              {isMoreFiltersActive && (
                <button
                  type="button"
                  onClick={() => handleSelectChange('access')('all')}
                  className="text-xs text-primary hover:underline font-medium border-0 bg-transparent p-0 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {ACCESS_OPTIONS.map((opt) => {
                const isSelected = (filters.selectedAccess || 'all') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left transition-colors cursor-pointer border-0 ${
                      isSelected
                        ? 'bg-primary-subtle text-primary font-bold'
                        : 'text-foreground hover:bg-surface-muted bg-transparent'
                    }`}
                    onClick={() => handleSelectChange('access')(opt.value)}
                  >
                    <span className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}>
                      {isSelected && <Icon icon="lucide:check" width="11" />}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* Sort By Dropdown */}
        <Dropdown className="article-filter-dropdown" autoClose="outside">
          <Dropdown.Toggle
            variant="light"
            id="article-sort-filters"
            className={`h-9 px-3 text-xs rounded-control border bg-surface text-foreground font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap ${
              currentSortValue !== 'created_at-desc' ? 'border-primary text-primary bg-primary-subtle font-semibold' : 'border-border'
            }`}
          >
            <Icon icon="lucide:arrow-up-down" width="13" className="shrink-0" />
            <span>
              {currentSortValue !== 'created_at-desc'
                ? SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label
                : t("article.sapXep", "Sort By")}
            </span>
            <Icon icon="lucide:chevron-down" width="14" className="shrink-0 text-muted-foreground" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow-popover border border-border bg-surface p-2.5 rounded-card min-w-[220px]">
            <div className="pb-2 mb-2 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{t("article.sapXepBaiBao", "Sort Articles")}</span>
              {currentSortValue !== 'created_at-desc' && (
                <button
                  type="button"
                  onClick={() => handleSortChange('created_at-desc')}
                  className="text-xs text-primary hover:underline font-medium border-0 bg-transparent p-0 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {SORT_OPTIONS.map((option) => {
                const isSelected = option.value === currentSortValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-control text-xs text-left transition-colors cursor-pointer border-0 ${
                      isSelected
                        ? 'bg-primary-subtle text-primary font-bold'
                        : 'text-foreground hover:bg-surface-muted bg-transparent'
                    }`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    <span className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                    }`}>
                      {isSelected && <Icon icon="lucide:check" width="11" />}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* Reset All Inline Action */}
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
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
                <Icon icon="lucide:x" width="12" />
              </button>
            </Badge>
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
