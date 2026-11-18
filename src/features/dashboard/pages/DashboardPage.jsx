import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\pages\DashboardPage.jsx
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useUserStore } from "../../../app/store/userStore";
import useDashboard from "../hooks/useDashboard";
import DashboardStatCards from "../components/DashboardStatCards";
import PublicationTrendChart from "../components/PublicationTrendChart";
import RecentProjectsCard from "../components/RecentProjectsCard";
import TrendingKeywordsCard from "../components/TrendingKeywordsCard";
import QuickAccessGrid from "../components/QuickAccessGrid";
import TopAuthorsTable from "../components/TopAuthorsTable";
import AuthRequiredModal from "../../../shared/components/AuthRequiredModal";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { PageContainer } from "../../../shared/ui/page-layout";

/**
 * DashboardPage — Trang Tổng quan / Dashboard
 * Route: /dashboard
 *
 * Layout:
 *  Header → WelcomeSection → StatCards →
 *  [Chart 70% | RecentProjects 30%] →
 *  [TrendingKeywords | QuickAccess] →
 *  TopAuthorsTable
 */
export default function DashboardPage() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const email = useUserStore(state => state.email);

  // Year range select state for publication trends ('5', '10', 'all')
  const [trendRange, setTrendRange] = useState("5");
  const {
    projects,
    analytics,
    trendingKeywords,
    topAuthors,
    summaryStats,
    loadingProjects,
    loadingAnalytics,
    isFetchingAnalytics,
    loadingKeywords,
    isFetchingKeywords,
    loadingAuthors,
    errorProjects,
    errorAnalytics,
    errorKeywords,
    errorAuthors,
    refetchAnalytics
  } = useDashboard(email, trendRange);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const handleCreateProject = () => {
    if (!email) {
      setShowAuthModal(true);
    } else {
      navigate("/projects/create");
    }
  };
  const handleProjectClick = project => {
    const id = project.project_id ?? project.id;
    if (id) navigate(`/projects/${id}`);
  };
  const handleAuthorClick = author => {
    const id = author.author_id ?? author.id;
    if (id) navigate(`/authors/${id}`);
  };
  const handleKeywordClick = keyword => {
    navigate(`/catalog?search=${encodeURIComponent(keyword)}`);
  };
  return (
    <PageContainer>
      <Card className="dashboard-welcome relative overflow-hidden border-l-3 border-l-primary p-4 sm:p-5">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Icon icon="lucide:sparkles" width={14} /><span>Trending System Analytics</span>
            </div>
            <h1 className="mb-1 text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground">{t("dashboard.chaoMungBanDenVoiResearchpulse")}</h1>
            <p className="m-0 max-w-2xl text-sm leading-6 text-muted-foreground">{t("dashboard.khamPhaXuHuongXepHangTapChiVaC")}</p>
          </div>
          <Button onClick={handleCreateProject} size="sm" className="gap-1.5 shrink-0 text-xs">
            <Icon icon="lucide:plus" width={14} />
            <span>{t("dashboard.taoProject", "Create Project")}</span>
          </Button>
        </div>
      </Card>
      <DashboardStatCards stats={summaryStats} loading={loadingProjects} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <PublicationTrendChart
            analytics={analytics}
            loading={loadingAnalytics}
            isFetching={isFetchingAnalytics}
            error={errorAnalytics}
            onRetry={() => refetchAnalytics()}
            selectedRange={trendRange}
            onRangeChange={setTrendRange}
          />
        </div>
        <RecentProjectsCard
          projects={projects}
          loading={loadingProjects}
          error={errorProjects}
          onViewAll={() => navigate("/projects")}
          onProjectClick={handleProjectClick}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendingKeywordsCard keywords={trendingKeywords} loading={loadingKeywords} isFetching={isFetchingKeywords}
          error={errorKeywords} onKeywordClick={handleKeywordClick} onViewMore={() => navigate("/catalog")} />
        <QuickAccessGrid />
      </div>
      <TopAuthorsTable authors={topAuthors} loading={loadingAuthors} error={errorAuthors} onAuthorClick={handleAuthorClick} onViewAll={() => navigate("/authors")} />
      <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </PageContainer>
  );
}
