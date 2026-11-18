import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import JournalStatsCards from '../components/JournalStatsCards';
import JournalSearchBar from '../components/JournalSearchBar';
import JournalTable from '../components/JournalTable';
import useJournalList from '../hooks/useJournalList';
import AdminPagination from '../../../shared/components/Pagination';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Alert } from '../../../shared/ui/alert';
import './JournalListPage.css';

export default function JournalListPage() {
  const { t } = useTranslation();
  const {
    journals,
    pagination,
    isLoading,
    loadingStats,
    error,
    stats,
    searchInput,
    setSearchInput,
    quartile,
    setQuartile,
    isOpenAccess,
    setIsOpenAccess,
    handleSearchSubmit,
    handlePageChange
  } = useJournalList();
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  // Clear all filters handler
  const handleClearAll = () => {
    setSearchInput('');
    setQuartile('all');
    setIsOpenAccess('all');
    window.location.reload();
  };

  return (
    <div className="journal-list-page text-main min-vh-100">
      <Header />

      <PageContainer className="journal-list-shell">
        <PageHeader
          breadcrumbs={[
            { label: t("home", "Home"), to: "/" },
            { label: t("typeJournal") }
          ]}
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold">
              <Icon icon="lucide:library" width="14" />
              <span>Journal catalog</span>
            </div>
          }
          title={t("typeJournal")}
          description={t("journal.danhSachTapChiKhoaHocTrongHeTh")}
        />

        {/* Statistic Cards */}
        <JournalStatsCards stats={stats} loading={loadingStats} />

        {/* Search & Filter Bar */}
        <JournalSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          quartile={quartile}
          setQuartile={setQuartile}
          isOpenAccess={isOpenAccess}
          setIsOpenAccess={setIsOpenAccess}
          onSubmit={handleSearchSubmit}
          onClear={handleClearAll}
        />

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <Icon icon="lucide:alert-circle" width="18" className="mr-2 inline" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Table & Loading Skeleton wrapper */}
        {isLoading ? (
          <div className="journal-loading-panel space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-surface-muted animate-pulse rounded-card" />
            ))}
          </div>
        ) : (
          <>
            {/* Journal Table */}
            <JournalTable journals={journals} page={pagination.page} limit={pagination.limit} />

            {/* Pagination Controls */}
            {journals.length > 0 && totalPages > 1 && (
              <div className="mt-5">
                <AdminPagination
                  totalItems={pagination.total}
                  currentPage={pagination.page}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                  entityName="tạp chí"
                />
              </div>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}
