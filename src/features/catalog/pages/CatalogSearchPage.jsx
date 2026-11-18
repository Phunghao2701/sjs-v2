import { useTranslation } from "react-i18next";
import { Dropdown } from '../../../shared/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogSearch } from '../hooks/useCatalogSearch';
import FilterPanel from '../components/FilterPanel';
import JournalTable from '../components/JournalTable';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import useAuth from '../../auth/hooks/useAuth';
import AdminPagination from '../../../shared/components/Pagination';
import { Card } from '../../../shared/ui/card';
import { StatePanel } from '../../../shared/ui/state-panel';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { MotionPage, fadeUp } from '../../../shared/ui/motion';
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
    <PageContainer>
      <MotionPage className="space-y-6">
        {/* 1. Standard Page Header */}
        <PageHeader
          title={t("catalog.danhMucTimKiem", "Journal Catalog & Search")}
          description={t("catalog.timKiemJournalLocTheoLinhVucXe", "Search international scientific journals, Scimago quartile rankings, and citation metrics.")}
        />

        {/* 2. Unified Container: Filter + Toolbar + Table + Pagination */}
        <motion.div variants={fadeUp}>
          <Card className="rounded-card border border-border bg-surface shadow-card">
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
          sort={sort}
          onSortChange={handleSortChange}
        />

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
      </motion.div>

      {/* Guest Authentication Interception Modal */}
      <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </MotionPage>
  </PageContainer>
  );
}
