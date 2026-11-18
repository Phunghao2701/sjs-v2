import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import useAuthors from '../hooks/useAuthors';
import AuthorLeaderboardCharts from '../components/AuthorLeaderboardCharts';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import { Button } from '../../../shared/ui/button';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { MotionPage } from '../../../shared/ui/motion';
import './AuthorLeaderboardPage.css';

export default function AuthorLeaderboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    leaderboard,
    loadingLeaderboard,
    errorLeaderboard,
    fetchLeaderboard,
    subjectAreas,
    fetchSubjectAreas,
  } = useAuthors();
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
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
      page: 1,
      limit: limit,
    });
  }, [selectedArea, selectedPeriod, limit, fetchLeaderboard]);

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
  };

  const handlePeriodChange = (val) => {
    setSelectedPeriod(val);
  };

  const handleLimitChange = (val) => {
    setLimit(val);
  };

  return (
    <PageContainer>
      <MotionPage className="space-y-4">
        <PageHeader
          title={t("author.bangXepHangTacGia")}
          description={t("author.cacTacGiaNoiBatNhatHeThongDuoc")}
          actions={
            <div className="flex items-center gap-2">
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
              page: 1,
              limit: limit,
            })
          }
        />
      </MotionPage>
    </PageContainer>
  );
}
