import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordList.jsx
 */
import { Icon } from '@iconify/react';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AdminPagination from '../../../shared/components/Pagination';
import KeywordListItem from './KeywordListItem';

/**
 * Danh sách keyword kèm loading, empty, error và pagination.
 */
export default function KeywordList({
  keywords,
  loading,
  error,
  pagination,
  onPageChange,
  onViewArticles,
  onRetry
}) {
  const { t } = useTranslation();
  const totalItems = pagination?.total || pagination?.total_items || pagination?.totalItems || 0;
  const currentPage = pagination?.page || 1;
  const limit = pagination?.limit || pagination?.page_size || 10;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(item => (
          <div key={item} className="keyword-skeleton-card">
            <LoadingSkeleton width="120px" height="14px" className="mb-3" />
            <LoadingSkeleton width="80%" height="28px" className="mb-3" />
            <LoadingSkeleton width="140px" height="22px" className="mb-4" />
            <LoadingSkeleton width="180px" height="40px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="keyword-state-card">
        <Icon icon="lucide:alert-triangle" width="42" className="keyword-state-icon mb-3" />
        <h3 className="keyword-state-title mb-2">{t("keywords.khongTheTaiDanhSachKeywords")}</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button type="button" onClick={onRetry} className="btn keyword-retry-btn px-4">{t("article.thuLai")}</button>
      </div>
    );
  }

  if (!keywords || keywords.length === 0) {
    return (
      <div className="keyword-state-card">
        <Icon icon="lucide:inbox" width="42" className="text-muted-foreground mb-3" />
        <h3 className="keyword-state-title mb-2">{t("keywords.khongTimThayKeywordPhuHop")}</h3>
        <p className="text-muted-foreground mb-0">{t("keywords.thuDoiTuKhoaTimKiemHoacResetBo")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {keywords.map(keyword => (
          <KeywordListItem key={keyword.keyword_id} keyword={keyword} onViewArticles={onViewArticles} />
        ))}
      </div>
      {totalItems > limit && (
        <AdminPagination
          totalItems={totalItems}
          currentPage={currentPage}
          limit={limit}
          onPageChange={onPageChange}
          entityName="keywords"
        />
      )}
    </>
  );
}
