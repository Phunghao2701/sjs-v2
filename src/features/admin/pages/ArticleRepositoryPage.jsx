import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  ArticleFilterBar,
  ArticleTable,
  EditorInsightsCard,
  PeerMatchingPromoCard,
} from '../components/article-repository';
import Pagination from '../../../shared/components/Pagination';
import useAdminArticleRepository from '../hooks/useAdminArticleRepository';
import ROUTES from '../../../app/routes/routePaths';
import { Button } from '../../../shared/ui/button';
import { Alert } from '../../../shared/ui/alert';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';

export default function ArticleRepositoryPage() {
  const navigate = useNavigate();
  const {
    journalFilter,
    statusFilter,
    submittedDateFilter,
    setJournalFilter,
    setStatusFilter,
    setSubmittedDateFilter,
    handleApplyFilters,
    handleClearFilters,
    pageItems,
    insights,
    totalItems,
    loading,
    error,
    currentPage,
    setCurrentPage,
    startIndex,
    endIndex,
    pageSize,
  } = useAdminArticleRepository();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Management' },
          { label: 'Manuscripts' }
        ]}
        title="Article Repository"
        description="Review submitted articles, filter editorial status, and open manuscript records for operational updates."
        actions={
          <Button
            type="button"
            className="flex items-center gap-1.5"
            onClick={() => navigate(ROUTES.ADMIN_ARTICLE_CREATE)}
          >
            <Icon icon="lucide:plus" width="16" aria-hidden="true" />
            <span>Submit New Article</span>
          </Button>
        }
      />

      {/* Filter bar */}
      <ArticleFilterBar
        journal={journalFilter}
        status={statusFilter}
        submittedDate={submittedDateFilter}
        onChangeJournal={setJournalFilter}
        onChangeStatus={setStatusFilter}
        onChangeSubmittedDate={setSubmittedDateFilter}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {loading ? (
        <div className="admin-card p-4 space-y-3 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="space-y-1.5 flex-1 max-w-md">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-4 items-center">
          <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
          <div className="flex-1 text-xs">{error}</div>
        </Alert>
      ) : (
        <>
          <ArticleTable
            items={pageItems}
            totalItems={totalItems}
            startIndex={pageItems.length === 0 ? 0 : startIndex}
            endIndex={endIndex}
          />

          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            limit={pageSize}
            onPageChange={setCurrentPage}
            entityName="articles"
          />
        </>
      )}

      {/* Bottom row: Editor's Insights + Peer-Matching promo */}
      <div className="admin-repository-bottom-row">
        <EditorInsightsCard insights={insights} />
        <PeerMatchingPromoCard />
      </div>
    </div>
  );
}
