import { useTranslation } from "react-i18next";
import { Modal } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import useArticleList from '../hooks/useArticleList';
import ArticleStatsCards from '../components/ArticleStatsCards';
import ArticleFilterBar from '../components/ArticleFilterBar';
import ArticleTable from '../components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import '../Article.css';

export default function ArticleListPage() {
  const { t } = useTranslation();
  const {
    articles,
    total,
    currentPage,
    totalPages,
    isLoading,
    stats,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
    handleDetailClick,
    showAuthModal,
    setShowAuthModal,
    handleAuthRedirect,
  } = useArticleList();

  return (
    <PageContainer>
      {/* Unified Design System PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: t("articles", "Scientific Articles") }
        ]}
        badge={
          <Badge variant="info" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <Icon icon="lucide:library-big" width="14" height="14" />
            <span>Trending System Repository</span>
          </Badge>
        }
        title={t("article.khoLuuTruBaiBaoKhoaHoc", "Scientific Articles Repository")}
        description={t("article.duyetQuaTimKiemVaLocHangNghinB", "Search, filter, and discover millions of high-impact scientific publications.")}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-end">
              <div className="text-xs text-muted-foreground">{t("article.tongKetQua", "Total Papers")}</div>
              <div className="text-sm font-bold text-foreground">
                {total ? total.toLocaleString() : '219M+'} papers
              </div>
            </div>
          </div>
        }
      >
        {(filters.selectedVolume || filters.selectedIssue) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {filters.selectedVolume && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-medium">
                <Icon icon="solar:folder-with-files-bold" width="14" />
                <span>{t("article.dangXemBaiBaoThuocVolume", "Viewing volume: ")}{filters.selectedVolume}</span>
              </Badge>
            )}
            {filters.selectedIssue && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5 text-xs font-medium">
                <Icon icon="lucide:layers-3" width="14" />
                <span>{t("article.dangXemBaiBaoThuocIssue", "Viewing issue: ")}{filters.selectedIssue}</span>
              </Badge>
            )}
          </div>
        )}
      </PageHeader>

      {/* Thẻ thống kê chuẩn hóa (Scimago / Scopus grade) */}
      <ArticleStatsCards stats={stats} isLoading={isLoading} />

      {/* Thanh lọc & Sắp xếp tích hợp */}
      <ArticleFilterBar filters={filters} updateFilters={updateFilters} clearFilters={clearFilters} />

      {/* Bảng dữ liệu */}
      <ArticleTable
        articles={articles}
        isLoading={isLoading}
        onDetailClick={handleDetailClick}
        onClearFilters={clearFilters}
      />

      {/* Phân trang */}
      {total > 0 && totalPages > 1 && (
        <div className="pt-2">
          <AdminPagination
            totalItems={total}
            currentPage={currentPage}
            limit={10}
            onPageChange={handlePageChange}
            entityName="bài báo"
          />
        </div>
      )}

      {/* Warning Auth Modal */}
      <Modal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        centered
        contentClassName="border-0 rounded-card shadow-popover"
      >
        <Modal.Body className="p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Icon icon="lucide:lock" width="24" height="24" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground mb-1.5">
              {t("article.yeuCauDangNhap", "Sign in Required")}
            </h4>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              {t("article.deXemToanBoNoiDungChiTietBaiBa", "Please sign in to your account to view the full details and analytics for this article.")}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAuthModal(false)}>
              {t("article.dong", "Close")}
            </Button>
            <Button size="sm" onClick={handleAuthRedirect}>
              {t("article.dangNhapNgay", "Sign in Now")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </PageContainer>
  );
}
