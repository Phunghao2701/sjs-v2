import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
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
    return searchParams.get('view') || localStorage.getItem('author_view_mode') || 'grid';
  });

  const setViewMode = (mode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('author_view_mode', mode);
    } catch {
      // ignore storage access errors
    }
    const nextParams = new URLSearchParams(searchParams);
    if (mode === 'grid') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', mode);
    }
    setSearchParams(nextParams, { replace: true });
  };
  const searchVal = searchParams.get('search') || '';
  const pageVal = parseInt(searchParams.get('page') || '1', 10);
  const limitVal = parseInt(searchParams.get('limit') || '10', 10);
  const sortVal = searchParams.get('sort') || 'impact';
  const subjectAreaVal = searchParams.get('subject_area') || '';
  const countryVal = searchParams.get('country') || '';
  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    const params = {
      search: searchVal,
      page: pageVal,
      limit: limitVal,
      sort: sortVal,
      subject_area: subjectAreaVal,
      country: countryVal,
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '')
    );
    fetchAuthors(filteredParams);
  }, [searchVal, pageVal, limitVal, sortVal, subjectAreaVal, countryVal, fetchAuthors]);

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
      <PageHeader
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: t("author.danhSachTacGia", "Authors") }
        ]}
        badge={
          <Badge variant="info" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <Icon icon="lucide:users-round" width="14" />
            <span>Author registry</span>
          </Badge>
        }
        title={t("author.danhSachNhaKhoaHocTacGia", "Authors & Researchers Directory")}
        description={t("author.traCuuThongTinChiSoHocThuatHin", "Explore author profiles, scientific contributions, h-index rankings, and publication impact.")}
        actions={
          <div className="text-end">
            <div className="text-xs text-muted-foreground">{t("author.tongTacGia", "Total Authors")}</div>
            <div className="text-sm font-bold text-foreground">
              {totalAuthors ? totalAuthors.toLocaleString() : '—'} authors
            </div>
          </div>
        }
      />

      <AuthorNavigationTabs activeTab="list" />

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="p-3 sm:p-3.5 flex flex-col justify-between relative overflow-hidden group">
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
        ))}
      </section>

      {/* Filter bar */}
      <Card className="p-3 sm:p-3.5 shadow-card">
        <Form onSubmit={handleSearchSubmit}>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width={15} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("author.timTheoTenVienNghienCuuTuKhoa", "Search by author name, institution, or keyword...")}
                className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground"
              />
            </div>

            <div className="w-full sm:w-[220px] shrink-0">
              <select
                value={subjectAreaVal}
                onChange={(e) => handleFilterChange('subject_area', e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-background border border-border rounded-control focus:border-primary focus:outline-none transition-colors text-foreground"
              >
                <option value="">{t("admin.chonLinhVuc", "All subject areas")}</option>
                {(subjectAreas || []).map((area) => {
                  const val = area.display_name || area.name || '';
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>

            <Button type="submit" size="sm" className="h-9 px-4 gap-1.5 shrink-0 w-full sm:w-auto text-xs">
              <Icon icon="lucide:search" width={14} aria-hidden="true" />
              <span>{t("searchBtn", "Search")}</span>
            </Button>
          </div>
        </Form>
      </Card>

      {/* View Mode Toolbar: Count & Toggle (Grid / List) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="text-xs text-muted-foreground">
          {loadingAuthors ? (
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:loader-2" width="13" className="animate-spin text-primary" />
              <span>{t("dangTai", "Loading authors...")}</span>
            </span>
          ) : (
            <span>
              {t("catalog.timThay", "Found ")}
              <strong className="text-foreground font-bold">{Number(totalAuthors || 0).toLocaleString()}</strong> {t("author.tacGia", "authors")}
              <span className="mx-1.5">•</span>
              {t("pagination.page", "Page")} <strong className="text-foreground">{pageVal}</strong> of <strong className="text-foreground">{totalPagesCount}</strong>
            </span>
          )}
        </div>

        {/* View Mode Toggle: Grid vs List */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-control shadow-2xs self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors border-0 cursor-pointer",
              viewMode === 'grid'
                ? "bg-primary text-white font-semibold shadow-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted"
            )}
            title={t("viewGrid", "Grid View")}
            aria-label="Grid View"
            aria-pressed={viewMode === 'grid'}
          >
            <Icon icon="lucide:layout-grid" width={14} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors border-0 cursor-pointer",
              viewMode === 'list'
                ? "bg-primary text-white font-semibold shadow-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-muted"
            )}
            title={t("viewList", "List View")}
            aria-label="List View"
            aria-pressed={viewMode === 'list'}
          >
            <Icon icon="lucide:list" width={14} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Authors List (Responsive 4 columns) */}
      <div>
        {viewMode === 'grid' ? (
          loadingAuthors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              authors={[]}
              loading={false}
              error={errorAuthors}
              onRetry={() => fetchAuthors()}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {authors.map((author) => (
                <AuthorCard key={author.author_id ?? author.id} author={author} />
              ))}
            </div>
          )
        ) : (
          <AuthorTable
            authors={authors}
            loading={loadingAuthors}
            error={errorAuthors}
            onRetry={() => fetchAuthors()}
            startIndex={startIndex}
          />
        )}
      </div>

      {authors.length > 0 && totalPagesCount > 1 && (
        <div className="pt-2">
          <AdminPagination
            totalItems={totalAuthors}
            currentPage={pageVal}
            limit={limitVal}
            onPageChange={handlePageChange}
            entityName={t("author.tacGia", "authors")}
          />
        </div>
      )}
    </PageContainer>
  );
}
