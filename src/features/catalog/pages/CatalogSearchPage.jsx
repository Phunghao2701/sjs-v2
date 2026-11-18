import { useTranslation } from "react-i18next";
import { Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useCatalogSearch } from '../hooks/useCatalogSearch';
import FilterPanel from '../components/FilterPanel';
import JournalTable from '../components/JournalTable';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import useAuth from '../../auth/hooks/useAuth';
import AdminPagination from '../../../shared/components/Pagination';
import { Card } from '../../../shared/ui/card';
import { StatePanel } from '../../../shared/ui/state-panel';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import '../components/CatalogSearch.css';

export default function CatalogSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    searchInput,
    setSearchInput,
    subjectAreas,
    subjectCategories,
    loadingFilters,
    journals,
    total,
    loadingJournals,
    error,
    page,
    sort,
    selectedAreas,
    selectedCategories,
    selectedAccess,
    selectedQuartiles,
    selectedYear,
    selectedZone,
    zones,
    isOaDiamond,
    followedJournals,
    showAuthModal,
    setShowAuthModal,
    handleSearchSubmit,
    onAreaSelect,
    onCategorySelect,
    onAccessSelect,
    onQuartileSelect,
    onYearSelect,
    onZoneSelect,
    handleOaDiamondToggle,
    handleClearAll,
    handleSortChange,
    handlePageChange,
    handleFollowJournal,
    fetchJournals,
  } = useCatalogSearch(user);

  const pageLimit = 10;
  const totalPages = Math.ceil(total / pageLimit) || 1;

  return (
    <PageContainer className="space-y-6">
      {/* 1. Standard Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Journal Catalog' }
        ]}
        title={t("catalog.danhMucTimKiem", "Journal Catalog & Search")}
        description={t("catalog.timKiemJournalLocTheoLinhVucXe", "Search international scientific journals, Scimago quartile rankings, and citation metrics.")}
        badge={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground shadow-2xs">
            <span className="size-2 rounded-full bg-success" />
            <span>Indexed Database:</span>
            <strong className="text-foreground">{total ? Number(total).toLocaleString() : '270,000+'}</strong>
            <span>journals</span>
          </div>
        }
      />

      {/* 2. Unified Container: Filter + Toolbar + Table + Pagination */}
      <Card className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
        {/* Filter Toolbar Panel */}
        <FilterPanel
          asCard={false}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          subjectAreas={subjectAreas}
          subjectCategories={subjectCategories}
          selectedAreas={selectedAreas}
          selectedCategories={selectedCategories}
          selectedAccess={selectedAccess}
          selectedQuartiles={selectedQuartiles}
          onAreaSelect={onAreaSelect}
          onCategorySelect={onCategorySelect}
          onAccessSelect={onAccessSelect}
          onQuartileSelect={onQuartileSelect}
          selectedYear={selectedYear}
          selectedZone={selectedZone}
          zones={zones}
          onYearSelect={onYearSelect}
          onZoneSelect={onZoneSelect}
          isOaDiamond={isOaDiamond}
          onOaDiamondToggle={handleOaDiamondToggle}
          onClearAll={handleClearAll}
          loading={loadingFilters}
        />

        {/* Toolbar: Results Counter + Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-surface-muted/30">
          <div className="text-xs text-muted-foreground">
            {loadingJournals ? (
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:loader-2" width="14" className="animate-spin text-primary" />
                <span>{t("catalog.dangTimKiemTapChi", "Searching journals database...")}</span>
              </span>
            ) : (
              <span>
                {t("catalog.timThay", "Found ")}
                <strong className="text-foreground font-bold">{Number(total || 0).toLocaleString()}</strong> {t("catalog.tapChiCount", "journals")}
                <span className="mx-1.5">•</span>
                {t("pagination.page", "Page")} <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPages}</strong>
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="sort-dropdown"
              className="h-8 px-3 rounded-control border border-border bg-surface text-foreground text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:border-primary/40"
            >
              <Icon icon="lucide:arrow-up-down" width="13" className="text-muted-foreground" />
              <span>
                {sort === 'metric' && t("catalog.macDinh", "Sort: SJR Metric")}
                {sort === 'name' && t("catalog.tenAz", "Sort: Name (A-Z)")}
              </span>
              <Icon icon="lucide:chevron-down" width="12" className="text-muted-foreground" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="border border-border bg-surface shadow-popover rounded-card p-1 text-xs">
              <Dropdown.Item
                onClick={() => handleSortChange('metric')}
                className={`rounded-control text-xs py-1.5 px-3 ${sort === 'metric' ? 'bg-primary-subtle text-primary font-bold' : ''}`}
              >
                {t("catalog.macDinh", "Sort: SJR Metric (Default)")}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleSortChange('name')}
                className={`rounded-control text-xs py-1.5 px-3 ${sort === 'name' ? 'bg-primary-subtle text-primary font-bold' : ''}`}
              >
                {t("catalog.tenAz", "Sort: Name (A-Z)")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Table Result Area */}
        <div className="border-t border-border">
          {loadingJournals ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/5 rounded-control" />
                    <Skeleton className="h-3 w-1/4 rounded-control" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-control shrink-0" />
                  <Skeleton className="h-6 w-16 rounded-control shrink-0" />
                  <Skeleton className="h-6 w-20 rounded-control shrink-0" />
                  <Skeleton className="h-7 w-24 rounded-control shrink-0" />
                </div>
              ))}
            </div>
          ) : error && journals.length === 0 ? (
            <div className="p-6">
              <StatePanel
                variant="error"
                icon={
                  <Icon
                    icon={error?.includes(t("catalog.dangNhap")) ? 'lucide:lock' : 'lucide:alert-triangle'}
                    width="36"
                    className="text-danger"
                  />
                }
                title={
                  error?.includes(t("catalog.dangNhap"))
                    ? t("catalog.canDangNhapDeTimKiem", "Authentication Required")
                    : t("catalog.khongTheTaiDuLieuTimKiem", "Failed to load journals")
                }
                description={error}
                action={
                  error?.includes(t("catalog.dangNhap")) ? {
                    label: t("signIn", "Sign In"),
                    onClick: () => navigate('/login')
                  } : {
                    label: t("article.thuLai", "Try Again"),
                    onClick: () => fetchJournals()
                  }
                }
              />
            </div>
          ) : journals.length === 0 ? (
            <div className="p-6">
              <StatePanel
                variant="neutral"
                icon={<Icon icon="lucide:folder-search" width="36" className="text-muted-foreground" />}
                title={t("catalog.khongTimThayJournalPhuHop", "No journals matching your criteria")}
                description={t("catalog.hayThuThayDoiTuKhoaTimKiemHoac", "Try adjusting your search keywords, field filters, or quartile selection.")}
                action={{
                  label: t("article.xoaBoLoc", "Clear all filters"),
                  onClick: handleClearAll
                }}
              />
            </div>
          ) : (
            <JournalTable
              asCard={false}
              journals={journals}
              followedJournals={followedJournals}
              onFollow={handleFollowJournal}
            />
          )}
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && !loadingJournals && (
          <div className="border-t border-border px-4 py-3 bg-surface">
            <AdminPagination
              totalItems={total}
              currentPage={page}
              limit={pageLimit}
              onPageChange={handlePageChange}
              entityName="journals"
              className="pt-0"
            />
          </div>
        )}
      </Card>

      {/* Guest Authentication Interception Modal */}
      <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </PageContainer>
  );
}
