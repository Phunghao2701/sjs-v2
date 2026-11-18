import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import KeywordSearchBar from '../components/KeywordSearchBar';
import KeywordSortDropdown from '../components/KeywordSortDropdown';
import KeywordList from '../components/KeywordList';
import { useKeywords } from '../hooks/useKeywords';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import './KeywordListPage.css';

/**
 * Trang danh sách Keywords.
 * Route: /keywords
 */
export default function KeywordListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    keywords,
    pagination,
    loading,
    error,
    filters,
    actions
  } = useKeywords();

  const handleSearch = (q) => {
    actions.setKeyword(q);
  };

  const handleClearSearch = () => {
    actions.setKeyword('');
  };

  const handleSortChange = (sortBy, sortOrder) => {
    actions.setSort(sortBy, sortOrder);
  };

  const handlePageChange = (page) => {
    actions.setPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleViewArticles = (keywordId) => {
    navigate(`/keywords/${keywordId}/articles`);
  };

  return (
    <div className="grid-bg keyword-list-page d-flex flex-column min-vh-100">
      <Header />

      <PageContainer className="keyword-list-shell">
        <PageHeader
          title={t("keywords.khamPhaKeywords")}
          description={t("keywords.timKiemCacTuKhoaNghienCuuVaMoN")}
          actions={
            pagination.total > 0 && (
              <aside className="keyword-list-total-pill text-end" aria-label="Tổng kết từ khóa">
                <div className="text-xs text-muted-foreground">{t("keywords.tongCong")}</div>
                <div className="text-base font-bold text-foreground mt-0.5">
                  {pagination.total.toLocaleString()}
                </div>
              </aside>
            )
          }
        />

        <div className="keyword-toolbar">
          <div className="keyword-toolbar__search">
            <KeywordSearchBar value={filters.keyword} onSearch={handleSearch} onClear={handleClearSearch} />
          </div>
          <KeywordSortDropdown sortBy={filters.sortBy} sortOrder={filters.sortOrder} onChange={handleSortChange} />
        </div>

        {/* Active filter context */}
        {filters.keyword && (
          <div className="keyword-active-filter">
            <span>{t("keywords.ketQuaTimKiemCho")}</span>
            <span className="keyword-active-filter__term">
              "{filters.keyword}"
            </span>
            <button
              type="button"
              className="btn btn-link btn-sm p-0 keyword-active-filter__clear"
              onClick={handleClearSearch}
            >
              <Icon icon="lucide:x" width="14" className="me-1" />
              {t("keyword.xoa")}
            </button>
          </div>
        )}

        {/* Keyword grid */}
        <KeywordList
          keywords={keywords}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewArticles={handleViewArticles}
          onRetry={actions.refetch}
        />
      </PageContainer>
    </div>
  );
}
