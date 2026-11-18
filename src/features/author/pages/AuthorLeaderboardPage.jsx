import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import useAuthors from '../hooks/useAuthors';
import AuthorLeaderboardTable from '../components/AuthorLeaderboardTable';
import AuthorLeaderboardCharts from '../components/AuthorLeaderboardCharts';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import { Button } from '../../../shared/ui/button';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import AdminPagination from '../../../shared/components/Pagination';
import './AuthorLeaderboardPage.css';

export default function AuthorLeaderboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    leaderboard,
    loadingLeaderboard,
    errorLeaderboard,
    fetchLeaderboard,
    totalLeaderboard,
    leaderboardTotalPages,
    subjectAreas,
    fetchSubjectAreas,
  } = useAuthors();
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('charts'); // 'charts' | 'table'
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (!subjectAreas || subjectAreas.length === 0) {
      fetchSubjectAreas();
    }
  }, [subjectAreas, fetchSubjectAreas]);

  useEffect(() => {
    fetchLeaderboard({
      subject_area: selectedArea,
      period: selectedPeriod,
      page: currentPage,
      limit: limit,
    });
  }, [selectedArea, selectedPeriod, currentPage, limit, fetchLeaderboard]);

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    setCurrentPage(1);
  };

  const handlePeriodChange = (val) => {
    setSelectedPeriod(val);
    setCurrentPage(1);
  };

  const handleLimitChange = (val) => {
    setLimit(val);
    setCurrentPage(1);
  };

  return (
    <PageContainer>
        <PageHeader
          title={t("author.bangXepHangTacGia")}
          description={t("author.cacTacGiaNoiBatNhatHeThongDuoc")}
          actions={
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-surface-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('charts')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'charts'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon icon="lucide:bar-chart-3" width={13} />
                  <span>{t('author.bieuDoPhanTich', 'Analytics View')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon icon="lucide:table" width={13} />
                  <span>{t('author.bangChiTiet', 'Table View')}</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/authors')}
              >
                <Icon icon="lucide:arrow-left" width={14} className="mr-1.5" />
                <span>{t("author.quayLaiDanhSachTacGia")}</span>
              </Button>
            </div>
          }
        />

        <AuthorNavigationTabs activeTab="leaderboard" />

        {viewMode === 'charts' ? (
          <AuthorLeaderboardCharts
            authors={leaderboard}
            subjectAreas={subjectAreas}
            selectedArea={selectedArea}
            onAreaChange={handleAreaChange}
            period={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            loading={loadingLeaderboard}
            error={errorLeaderboard}
            onRetry={() =>
              fetchLeaderboard({
                subject_area: selectedArea,
                period: selectedPeriod,
                page: currentPage,
                limit: limit,
              })
            }
          />
        ) : (
          <>
            <AuthorLeaderboardTable
              authors={leaderboard}
              loading={loadingLeaderboard}
              error={errorLeaderboard}
              onRetry={() =>
                fetchLeaderboard({
                  subject_area: selectedArea,
                  period: selectedPeriod,
                  page: currentPage,
                  limit: limit,
                })
              }
            />

            {leaderboard.length > 0 && leaderboardTotalPages > 1 && (
              <div className="mt-6">
                <AdminPagination
                  totalItems={totalLeaderboard}
                  currentPage={currentPage}
                  limit={limit}
                  onPageChange={setCurrentPage}
                  entityName={t("author.tacGia")}
                />
              </div>
            )}
          </>
        )}
      </PageContainer>
  );
}
