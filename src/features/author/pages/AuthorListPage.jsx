import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../shared/components/Icon';
import useAuthors from '../hooks/useAuthors';
import AuthorTable from '../components/AuthorTable';
import AuthorCard from '../components/AuthorCard';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { MotionPage, MotionGrid, MotionItem, fadeUp } from '../../../shared/ui/motion';
import { Skeleton } from '../../../shared/ui/skeleton';
import { cn } from '../../../lib/utils';
import './AuthorListPage.css';

export default function AuthorListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    authors,
    totalAuthors,
    totalPages,
    subjectAreas,
    loadingAuthors,
    errorAuthors,
    fetchAuthors,
    fetchSubjectAreas,
  } = useAuthors();
  const [viewMode, setViewModeState] = useState(() => {
    return searchParams.get('view') || localStorage.getItem('author_view_mode') || 'table';
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('author_view_mode', mode);
    } catch {
      // ignore storage access errors
    }
    const nextParams = new URLSearchParams(searchParams);
    if (mode === 'table') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', mode);
    }
    setSearchParams(nextParams, { replace: true });
  };
  const searchVal = searchParams.get('search') || '';
  const pageVal = parseInt(searchParams.get('page') || '1', 10);
  const limitVal = parseInt(searchParams.get('limit') || '10', 10);
  const sortVal = searchParams.get('sort') || 'articles';
  const subjectAreaVal = searchParams.get('subject_area') || '';
  const periodVal = searchParams.get('period') || '';
  const institutionVal = searchParams.get('institution') || '';
  const countryVal = searchParams.get('country') || '';

  const [searchInput, setSearchInput] = useState(searchVal);
  const [institutionInput, setInstitutionInput] = useState(institutionVal);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    setSearchInput(searchVal);
  }, [searchVal]);

  useEffect(() => {
    setInstitutionInput(institutionVal);
  }, [institutionVal]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const params = {
      search: searchVal,
      page: pageVal,
      limit: limitVal,
      sort: sortVal,
      subject_area: subjectAreaVal,
      period: periodVal,
      institution: institutionVal,
      country: countryVal,
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '')
    );
    fetchAuthors(filteredParams);
  }, [searchVal, pageVal, limitVal, sortVal, subjectAreaVal, periodVal, institutionVal, countryVal, fetchAuthors]);

  useEffect(() => {
    if (!subjectAreas || subjectAreas.length === 0) {
      fetchSubjectAreas();
    }
  }, [subjectAreas, fetchSubjectAreas]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) nextParams.set('search', searchInput.trim());
    else nextParams.delete('search');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('subject_area');
    nextParams.delete('institution');
    nextParams.delete('period');
    nextParams.set('sort', 'articles');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setInstitutionInput('');
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (subjectAreaVal) {
      chips.push({
        id: 'subject_area',
        label: t("researchField", "Field"),
        value: subjectAreaVal,
        onClear: () => handleFilterChange('subject_area', ''),
      });
    }
    if (institutionVal) {
      chips.push({
        id: 'institution',
        label: t("author.institution", "Affiliation"),
        value: institutionVal,
        onClear: () => handleFilterChange('institution', ''),
      });
    }
    if (periodVal) {
      chips.push({
        id: 'period',
        label: t("period", "Period"),
        value: periodVal,
        onClear: () => handleFilterChange('period', ''),
      });
    }
    if (sortVal && sortVal !== 'articles') {
      const sortLabel = sortVal === 'citations' ? t("sortCitations", "Citations") : sortVal === 'impact' ? t("sortHIndex", "H-index") : sortVal;
      chips.push({
        id: 'sort',
        label: t("sort", "Sort"),
        value: sortLabel,
        onClear: () => handleFilterChange('sort', 'articles'),
      });
    }
    return chips;
  }, [subjectAreaVal, institutionVal, periodVal, sortVal, t]);

  const activeFilterCount = activeChips.length;

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };

  const totalPagesCount = Math.max(1, totalPages);
  const startIndex = (pageVal - 1) * limitVal + 1;

  const formatLocalNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
    return Number(value).toLocaleString('vi-VN');
  };

  const visibleAuthorsCount = authors.length;
  const featuredAuthorsCount = authors.filter(
    (author) => Number(author.h_index ?? author.hindex ?? 0) >= 30
  ).length;
  const totalWorksCount = authors.reduce(
    (sum, author) => sum + (Number(author.works_count ?? author.article_count ?? 0) || 0),
    0
  );
  const totalCitationCount = authors.reduce(
    (sum, author) => sum + (Number(author.cited_by_count ?? author.citation_count ?? 0) || 0),
    0
  );

  const statCards = [
    {
      label: t("article.tongTacGia", "Total Authors"),
      value: formatLocalNumber(totalAuthors),
      icon: 'lucide:users',
      iconBg: 'bg-primary-subtle',
      iconColor: 'text-primary',
      desc: subjectAreaVal
        ? `${t("author.tacGiaTrongLinhVuc", "Authors in")} ${subjectAreaVal}`
        : t("author.tongTacGiaTrongHeThong", "Indexed in repository"),
    },
    {
      label: t("author.tacGiaNoiBat", "Featured Authors"),
      value: formatLocalNumber(featuredAuthorsCount || visibleAuthorsCount),
      icon: 'lucide:award',
      iconBg: 'bg-warning-subtle',
      iconColor: 'text-warning',
      desc:
        visibleAuthorsCount > 0
          ? `${formatLocalNumber(visibleAuthorsCount)} ${t("author.hienThi", "displayed on this page")}`
          : t("author.hindexVuotTroi30", "H-index ≥ 30"),
    },
    {
      label: t("article.tongBaiBao", "Publications"),
      value: formatLocalNumber(totalWorksCount),
      icon: 'lucide:file-text',
      iconBg: 'bg-success-subtle',
      iconColor: 'text-success',
      desc: t("author.tongBaiBaoTrenTrangHienTai", "Recorded articles on page"),
    },
    {
      label: t("author.tongCitations", "Citations Count"),
      value: formatLocalNumber(totalCitationCount),
      icon: 'lucide:quote',
      iconBg: 'bg-primary-subtle',
      iconColor: 'text-primary',
      desc: t("author.tongCitationsTrenTrangHienTai", "Total academic citations"),
    },
  ];

  return (
    <PageContainer>
      <MotionPage className="space-y-4">
        <PageHeader
          title={t("author.danhSachNhaKhoaHocTacGia", "Authors & Researchers Directory")}
          description={t("author.traCuuThongTinChiSoHocThuatHin", "Explore author profiles, scientific contributions, h-index rankings, and publication impact.")}
        />

        <AuthorNavigationTabs
          activeTab="list"
          rightContent={
            <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-control shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors border-0 cursor-pointer",
                  viewMode === 'list' || viewMode === 'table'
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted"
                )}
                title={t("viewList", "List View")}
                aria-label="List View"
                aria-pressed={viewMode === 'list' || viewMode === 'table'}
              >
                <Icon icon="lucide:list" width={14} />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors border-0 cursor-pointer",
                  viewMode === 'grid' || viewMode === 'cards'
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted"
                )}
                title={t("viewGrid", "Grid View")}
                aria-label="Grid View"
                aria-pressed={viewMode === 'grid' || viewMode === 'cards'}
              >
                <Icon icon="lucide:layout-grid" width={14} />
                <span>Grid</span>
              </button>
            </div>
          }
        />

        {/* 4 Stat Cards */}
        <MotionGrid staggerDelay={0.04} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((stat, idx) => (
            <MotionItem key={idx}>
              <Card className="p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group h-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block">{stat.label}</span>
                <div className="mt-1">
                  <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate" title={stat.desc}>{stat.desc}</div>
                </div>
              </Card>
            </MotionItem>
          ))}
        </MotionGrid>

        {/* Unified Author Section: Search Header + Results Toolbar + Table/Grid Content + Pagination Footer in ONE Card */}
        <motion.div variants={fadeUp}>
          <Card className="rounded-card border border-border bg-surface shadow-card">
            {/* 1. Integrated Search & Filter Header (gộp filter vào popover như ở article) */}
            <div className="p-3 sm:p-3.5 bg-surface space-y-2.5">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[180px]">
                  <Icon
                    icon="lucide:search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    width={15}
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t("author.searchByName", "Search by name...")}
                    className="w-full h-9 pl-9 pr-8 text-xs bg-surface border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground shadow-2xs"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.delete('search');
                        nextParams.set('page', '1');
                        setSearchParams(nextParams);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
                      aria-label="Clear search"
                    >
                      <Icon icon="lucide:x" width={13} />
                    </button>
                  )}
                </div>

                {/* Filter Trigger Button & Popover Panel */}
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

                  {/* Popover Panel */}
                  {isFilterOpen && (
                    <>
                      {/* Click interceptor backdrop on mobile */}
                      <div
                        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px] sm:bg-transparent"
                        onClick={() => setIsFilterOpen(false)}
                        aria-hidden="true"
                      />

                      <div
                        className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[540px] md:w-[620px] max-w-[95vw] bg-surface border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
                        style={{ zIndex: 60 }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                              <Icon icon="lucide:sliders-horizontal" width={14} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>{t("author.filterTitle", "Author Filters")}</span>
                                {activeFilterCount > 0 && (
                                  <span className="text-[10px] font-semibold text-primary bg-primary-subtle px-1.5 py-0.5 rounded-full">
                                    {activeFilterCount} {t("active", "active")}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground m-0">
                                {t("author.filterSubtitle", "Refine authors by field, affiliation, time period, and ranking metric.")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {activeFilterCount > 0 && (
                              <button
                                type="button"
                                onClick={handleClearAllFilters}
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

                        {/* Body / Grid of Filters */}
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto">
                          {/* 1. Research Field */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Icon icon="lucide:layers" width={13} className="text-muted-foreground/80" />
                              <span>{t("admin.linhVuc", "Research Field")}</span>
                            </label>
                            <div className="relative">
                              <select
                                value={subjectAreaVal}
                                onChange={(e) => handleFilterChange('subject_area', e.target.value)}
                                className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer select-none appearance-none ${
                                  subjectAreaVal
                                    ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                                    : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 hover:border-foreground/30'
                                }`}
                              >
                                <option value="">{t("admin.tatCaLinhVuc", "All research fields")}</option>
                                {(subjectAreas || []).map((area) => {
                                  const val = area.display_name || area.name || '';
                                  return <option key={val} value={val}>{val}</option>;
                                })}
                              </select>
                              <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* 2. Affiliation / Institution */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Icon icon="lucide:building-2" width={13} className="text-muted-foreground/80" />
                              <span>{t("author.vienNghienCuu", "Affiliation / Institution")}</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={institutionInput}
                                onChange={(e) => setInstitutionInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleFilterChange('institution', institutionInput.trim());
                                  }
                                }}
                                onBlur={() => {
                                  if (institutionInput.trim() !== institutionVal) {
                                    handleFilterChange('institution', institutionInput.trim());
                                  }
                                }}
                                placeholder={t("author.nhapTenVien", "e.g. Harvard, Oxford, HUST, Bach Khoa...")}
                                className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
                                  institutionVal
                                    ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                                    : 'border-border bg-surface'
                                }`}
                              />
                              {institutionInput && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInstitutionInput('');
                                    handleFilterChange('institution', '');
                                  }}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
                                  title="Clear affiliation"
                                >
                                  <Icon icon="lucide:x" width={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 3. Publication Period */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Icon icon="lucide:calendar" width={13} className="text-muted-foreground/80" />
                              <span>{t("period", "Publication Period")}</span>
                            </label>
                            <div className="relative">
                              <select
                                value={periodVal}
                                onChange={(e) => handleFilterChange('period', e.target.value)}
                                className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer select-none appearance-none ${
                                  periodVal
                                    ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                                    : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 hover:border-foreground/30'
                                }`}
                              >
                                <option value="">{t("allTime", "All time")}</option>
                                <option value="2021-2026">2021 – 2026</option>
                                <option value="2016-2020">2016 – 2020</option>
                                <option value="2011-2015">2011 – 2015</option>
                                <option value="2000-2010">2000 – 2010</option>
                              </select>
                              <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* 4. Sort By */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Icon icon="lucide:arrow-up-down" width={13} className="text-muted-foreground/80" />
                              <span>{t("sort", "Sort by")}</span>
                            </label>
                            <div className="relative">
                              <select
                                value={sortVal}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer select-none appearance-none ${
                                  sortVal !== 'articles'
                                    ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20'
                                    : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 hover:border-foreground/30'
                                }`}
                              >
                                <option value="articles">{t("sortPublications", "Publications (Most published)")}</option>
                                <option value="citations">{t("sortCitations", "Citations (Most cited)")}</option>
                                <option value="impact">{t("sortHIndex", "H-index (Academic impact)")}</option>
                              </select>
                              <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/20">
                          <span className="text-[11px] text-muted-foreground">
                            {activeFilterCount > 0
                              ? `${activeFilterCount} ${t("filtersApplied", "filters applied")}`
                              : t("noActiveFilters", "No active filters")}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsFilterOpen(false)}
                            className="h-8 text-xs font-semibold px-4"
                          >
                            {t("done", "Apply Filters")}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search Button */}
                <Button type="submit" size="sm" className="h-9 px-4 gap-1.5 shrink-0 w-full sm:w-auto text-xs font-semibold">
                  <Icon icon="lucide:search" width={14} aria-hidden="true" />
                  <span>{t("searchBtn", "Search")}</span>
                </Button>
              </form>

              {/* Active Filter Chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-medium text-muted-foreground mr-1">
                    {t("activeFilters", "Active filters")}:
                  </span>
                  {activeChips.map((chip) => (
                    <Badge
                      key={chip.id}
                      variant="secondary"
                      className="h-6 pl-2 pr-1 text-[11px] gap-1 font-normal bg-surface-muted border border-border text-foreground hover:bg-surface-muted/80"
                    >
                      <span className="text-muted-foreground">{chip.label}:</span>
                      <span className="font-medium truncate max-w-[140px]">{chip.value}</span>
                      <button
                        type="button"
                        onClick={chip.onClear}
                        className="hover:bg-foreground/10 rounded p-0.5 ml-0.5 border-0 bg-transparent cursor-pointer"
                        aria-label={`Remove ${chip.label} filter`}
                      >
                        <Icon icon="lucide:x" width={11} />
                      </button>
                    </Badge>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-[11px] text-primary hover:underline font-semibold ml-1 cursor-pointer border-0 bg-transparent"
                  >
                    {t("clearAll", "Clear all")}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Table / Grid content */}
            <div className="border-t border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {viewMode === 'grid' || viewMode === 'cards' ? (
                    loadingAuthors ? (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: limitVal }).map((_, idx) => (
                          <Card key={idx} className="p-4 space-y-3">
                            <div className="flex gap-3 items-center">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-3/5 rounded" />
                                <Skeleton className="h-3 w-2/5 rounded" />
                              </div>
                            </div>
                            <Skeleton className="h-7 w-full rounded" />
                            <Skeleton className="h-4 w-1/3 rounded" />
                          </Card>
                        ))}
                      </div>
                    ) : authors.length === 0 ? (
                      <AuthorTable
                        asCard={false}
                        authors={[]}
                        loading={false}
                        error={errorAuthors}
                        onRetry={() => fetchAuthors()}
                      />
                    ) : (
                      <div className="p-4">
                        <MotionGrid staggerDelay={0.03} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {authors.map((author) => (
                            <MotionItem key={author.author_id ?? author.id}>
                              <AuthorCard author={author} />
                            </MotionItem>
                          ))}
                        </MotionGrid>
                      </div>
                    )
                  ) : (
                    <AuthorTable
                      asCard={false}
                      authors={authors}
                      loading={loadingAuthors}
                      error={errorAuthors}
                      onRetry={() => fetchAuthors()}
                      startIndex={startIndex}
                      currentSort={sortVal}
                      onSortChange={(newSort) => handleFilterChange('sort', newSort)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 4. Unified Pagination inside single card footer */}
            {totalAuthors > 0 && totalPagesCount > 1 && (
              <div className="border-t border-border px-4 py-3 bg-surface">
                <AdminPagination
                  totalItems={totalAuthors}
                  currentPage={pageVal}
                  limit={limitVal}
                  onPageChange={handlePageChange}
                  entityName={t("author.tacGia", "authors")}
                />
              </div>
            )}
          </Card>
        </motion.div>
      </MotionPage>
    </PageContainer>
  );
}
