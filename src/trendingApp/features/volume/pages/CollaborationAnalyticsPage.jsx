import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardFooter from '../../../shared/components/layout/DashboardFooter';
import CollaborationTabs from '../components/collaboration-analytics/CollaborationTabs';
import CollaborationHeader from '../components/collaboration-analytics/CollaborationHeader';
import TopInfluentialAuthorsCard from '../components/collaboration-analytics/TopInfluentialAuthorsCard';
import LeadingInstitutionsCard from '../components/collaboration-analytics/LeadingInstitutionsCard';
import AuthorImpactMatrix from '../components/collaboration-analytics/AuthorImpactMatrix';
import KeyInsightsCard from '../components/collaboration-analytics/KeyInsightsCard';
import GlobalCollaborationNetwork from '../components/collaboration-analytics/GlobalCollaborationNetwork';
import TopicIntensityMatrix from '../components/collaboration-analytics/TopicIntensityMatrix';
import CollaborationAnalyticsSkeleton from '../components/collaboration-analytics/CollaborationAnalyticsSkeleton';
import {
  useCollaborationDashboardQuery,
} from '../hooks/useCollaborationAnalyticsQueries';
import { useParams } from 'react-router-dom';
import ErrorStateSection from '../../../shared/components/common/ErrorStateSection';
import '../components/collaboration-analytics/CollaborationAnalytics.css';

const CollaborationAnalyticsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const projectId = id === 'default-id' ? '1' : id;

  const [intensityType, setIntensityType] = React.useState('author');
  const { data: dashboard, isLoading, error, refetch } = useCollaborationDashboardQuery(projectId, intensityType);
  const rankings = dashboard?.rankings;
  const impactMatrix = dashboard?.impactMatrix;
  const keyInsights = dashboard?.keyInsights;
  const globalNetwork = dashboard?.globalNetwork;
  const topicIntensity = dashboard?.topicIntensity;

  return (
    <>
      <div className="ca-page">
        <CollaborationTabs />

        {isLoading ? (
          <CollaborationAnalyticsSkeleton />
        ) : error ? (
          <ErrorStateSection
            title={t('common.error', 'Collaboration Analytics Failed')}
            message={error?.message || error || t('dashboard.loadingFailedDesc', 'Something went wrong')}
            onRetry={refetch}
            minHeight={400}
          />
        ) : !rankings && !impactMatrix && !keyInsights && !globalNetwork && !topicIntensity ? (
          <div className="kn-empty">
            <h2>{t('dashboard.noData', 'No Data')}</h2>
            <p>{t('dashboard.noCollaborationData', 'No collaboration analytics data available.')}</p>
          </div>
        ) : (
          <>
            <CollaborationHeader />
            <div className="ca-layout">
              <div className="ca-row ca-row-half ca-row-rankings">
                <TopInfluentialAuthorsCard data={rankings?.authors} />
                <LeadingInstitutionsCard data={rankings?.institutions} />
              </div>

              <div className="ca-row ca-row-2-1">
                <AuthorImpactMatrix data={impactMatrix} />
                <KeyInsightsCard data={keyInsights} />
              </div>

              <div className="ca-row ca-row-half">
                <GlobalCollaborationNetwork data={globalNetwork} />
                <TopicIntensityMatrix
                  data={topicIntensity}
                  type={intensityType}
                  onTypeChange={setIntensityType}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <DashboardFooter />
    </>
  );
};

export default CollaborationAnalyticsPage;
