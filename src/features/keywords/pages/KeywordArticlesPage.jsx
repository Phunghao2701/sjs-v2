import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import KeywordArticleList from '../components/KeywordArticleList';
import { useKeywordArticles } from '../hooks/useKeywordArticles';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Button } from '../../../shared/ui/button';
import './KeywordArticlesPage.css';

/**
 * Trang bài báo theo Keyword.
 * Route: /keywords/:keywordId/articles
 */
export default function KeywordArticlesPage() {
  const { t } = useTranslation();
  const { keywordId } = useParams();
  const navigate = useNavigate();
  const {
    keyword,
    articles,
    pagination,
    loadingKeyword,
    loadingArticles,
    keywordError,
    articlesError,
    handlePageChange
  } = useKeywordArticles(keywordId);

  const handleViewDetail = (articleId) => {
    navigate(`/articles/${articleId}/visual`);
  };

  const handleRetry = () => {
    handlePageChange(1);
  };

  return (
    <div className="grid-bg keyword-articles-page d-flex flex-column min-vh-100">
      <Header />

      <PageContainer className="keyword-articles-shell">
        {/* Unified Design System PageHeader */}
        <PageHeader
          breadcrumbs={[
            { label: t("home"), to: "/" },
            { label: "Keywords", to: "/keywords" },
            { label: keyword?.display_name || t("keywords.baiBaoTheoKeyword") }
          ]}
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold">
              <Icon icon="lucide:tag" width="14" />
              <span>Research Keyword</span>
            </div>
          }
          title={
            loadingKeyword ? (
              <Skeleton className="h-7 w-64 rounded" />
            ) : keywordError ? (
              t("keywords.keywordKhongTimThay")
            ) : (
              keyword?.display_name
            )
          }
          description={
            loadingKeyword ? (
              <Skeleton className="h-4 w-96 rounded mt-1" />
            ) : keywordError ? (
              `ID: ${keywordId}`
            ) : pagination.total > 0 ? (
              `${pagination.total.toLocaleString()} ${t("keywords.baiBaoDangDuocLienKetVoiKeywor")}`
            ) : (
              t("keywords.keywordNayHienChuaCoBaiBaoLien")
            )
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/keywords')}
            >
              <Icon icon="lucide:arrow-left" width="14" className="mr-1.5" />
              <span>Quay lại Keywords</span>
            </Button>
          }
        />

        <div>
          <div className="keyword-articles-heading mb-4">
            <h2 className="keyword-articles-section-title text-base font-semibold text-foreground">
              {t("keywords.baiBaoLienQuan")}
            </h2>
          </div>

          <KeywordArticleList
            articles={articles}
            loading={loadingArticles}
            error={articlesError}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewDetail={handleViewDetail}
            onRetry={handleRetry}
          />
        </div>
      </PageContainer>
    </div>
  );
}
