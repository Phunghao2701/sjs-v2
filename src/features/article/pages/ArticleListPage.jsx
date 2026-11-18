import { useTranslation } from "react-i18next";
import { Modal } from '../../../shared/ui/modal';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import useArticleList from '../hooks/useArticleList';
import ArticleStatsCards from '../components/ArticleStatsCards';
import ArticleFilterBar from '../components/ArticleFilterBar';
import ArticleTable from '../components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { MotionPage, fadeUp } from '../../../shared/ui/motion';
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
      <MotionPage className="space-y-4">
        {/* Unified Design System PageHeader */}
        <PageHeader
          title={t("article.khoLuuTruBaiBaoKhoaHoc", "Scientific Articles Repository")}
          description={t("article.duyetQuaTimKiemVaLocHangNghinB", "Search, filter, and discover millions of high-impact scientific publications.")}
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

        {/* Unified Article Section: Filter + Table + Pagination in ONE Card */}
        <motion.div variants={fadeUp}>
          <Card className="rounded-card border border-border bg-surface shadow-card">
            {/* Thanh lọc & Sắp xếp tích hợp */}
            <ArticleFilterBar
              asCard={false}
              filters={filters}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
            />

            {/* Bảng dữ liệu */}
            <div className="border-t border-border">
              <ArticleTable
                asCard={false}
                articles={articles}
                isLoading={isLoading}
                onDetailClick={handleDetailClick}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Phân trang Footer */}
            {total > 0 && totalPages > 1 && (
              <div className="border-t border-border px-4 py-3 bg-surface">
                <AdminPagination
                  totalItems={total}
                  currentPage={currentPage}
                  limit={10}
                  onPageChange={handlePageChange}
                  entityName="bài báo"
                  className="pt-0"
                />
              </div>
            )}
          </Card>
        </motion.div>

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
      </MotionPage>
    </PageContainer>
  );
}
