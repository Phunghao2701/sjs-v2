import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
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
  const countryVal = searchParams.get('country') || '';
  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    const params = {
      search: searchVal,
      page: pageVal,
      limit: limitVal,
      sort: sortVal,
      subject_area: subjectAreaVal,
      period: periodVal,
      country: countryVal,
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '')
    );
    fetchAuthors(filteredParams);
  }, [searchVal, pageVal, limitVal, sortVal, subjectAreaVal, periodVal, countryVal, fetchAuthors]);

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
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{stat.label}</span>
                  <div className={cn("size-7 rounded-lg flex items-center justify-center shrink-0", stat.iconBg, stat.iconColor)}>
                    <Icon icon={stat.icon} width="14" height="14" />
                  </div>
                </div>
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
          <Card className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
            {/* 1. Integrated Search & Filter Header (gộp section search vào table) */}
            <div className="p-3 sm:p-3.5 bg-surface">
              <form onSubmit={handleSearchSubmit}>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full min-w-[200px]">
                    <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={15} />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t("author.timTheoTenVienNghienCuuTuKhoa", "Search by author name, institution, or keyword...")}
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

                  {/* Date Period Filter */}
                  <div className="relative inline-flex items-center w-full sm:w-auto shrink-0">
                    <Icon icon="lucide:calendar" className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <select
                      value={periodVal}
                      onChange={(e) => handleFilterChange('period', e.target.value)}
                      className="w-full sm:w-[130px] h-9 pl-8 pr-8 text-xs bg-surface border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="">{t("allTime", "All time")}</option>
                      <option value="2021-2026">2021 – 2026</option>
                      <option value="2016-2020">2016 – 2020</option>
                      <option value="2011-2015">2011 – 2015</option>
                      <option value="2000-2010">2000 – 2010</option>
                    </select>
                    <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Research Fields Filter */}
                  <div className="relative inline-flex items-center w-full sm:w-[200px] shrink-0">
                    <Icon icon="lucide:layers" className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <select
                      value={subjectAreaVal}
                      onChange={(e) => handleFilterChange('subject_area', e.target.value)}
                      className="w-full h-9 pl-8 pr-8 text-xs bg-surface border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground appearance-none cursor-pointer truncate shadow-2xs"
                    >
                      <option value="">{t("admin.chonLinhVuc", "All research fields")}</option>
                      {(subjectAreas || []).map((area) => {
                        const val = area.display_name || area.name || '';
                        return <option key={val} value={val}>{val}</option>;
                      })}
                    </select>
                    <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Sort by Filter */}
                  <div className="relative inline-flex items-center w-full sm:w-auto shrink-0">
                    <Icon icon="lucide:arrow-up-down" className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <select
                      value={sortVal}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="w-full sm:w-[160px] h-9 pl-8 pr-8 text-xs bg-surface border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground appearance-none cursor-pointer shadow-2xs"
                    >
                      <option value="articles">{t("sortPublications", "Sort: Publications")}</option>
                      <option value="citations">{t("sortCitations", "Sort: Citations")}</option>
                      <option value="impact">{t("sortHIndex", "Sort: H-index")}</option>
                    </select>
                    <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                  </div>

                  <Button type="submit" size="sm" className="h-9 px-4 gap-1.5 shrink-0 w-full sm:w-auto text-xs font-semibold">
                    <Icon icon="lucide:search" width={14} aria-hidden="true" />
                    <span>{t("searchBtn", "Search")}</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* 2. Results Counter Toolbar (đồng bộ như Catalog / Article) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-surface-muted/30">
              <div className="text-xs text-muted-foreground">
                <span>{t("article.timThay", "Found")} </span>
                <strong className="text-foreground font-semibold">{totalAuthors.toLocaleString()}</strong>
                <span> {t("author.tacGia", "authors")}</span>
                {totalAuthors > 0 && (
                  <span> &bull; Page <strong className="text-foreground font-semibold">{pageVal}</strong> of <strong className="text-foreground font-semibold">{totalPagesCount}</strong></span>
                )}
              </div>

              {(searchVal || periodVal || subjectAreaVal || sortVal !== 'articles') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    const nextParams = new URLSearchParams();
                    nextParams.set('page', '1');
                    setSearchParams(nextParams);
                  }}
                  className="text-xs text-danger hover:underline font-semibold flex items-center gap-1 border-0 bg-transparent p-0 cursor-pointer"
                >
                  <Icon icon="lucide:rotate-ccw" width={12} />
                  <span>{t("resetAllFilters", "Reset all filters")}</span>
                </button>
              )}
            </div>

            {/* 3. Table / Grid content */}
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
