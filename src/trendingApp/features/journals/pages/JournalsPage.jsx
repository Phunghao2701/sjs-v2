import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContainer from '../../dashboard/components/DashboardContainer';
import DashboardGrid from '../../../shared/components/layout/DashboardGrid';
import TopJournalRankingCard from '../components/TopJournalRankingCard';
import QuartileDistributionCard from '../components/QuartileDistributionCard';
import ImpactMatrixCard from '../components/ImpactMatrixCard';
import MigrationAnalysisCard from '../components/MigrationAnalysisCard';
import { useJournalsData } from '../hooks/useJournalsData';
import { StatePanel } from '../../../../shared/ui/state-panel';
import { Skeleton } from '../../../../shared/ui/skeleton';
import { Card } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { Icon } from '@iconify/react';
import '../styles/JournalsPage.css';

export default function JournalsPage() {
  const { t } = useTranslation();
  const { data, loading, error, topRanking, quartile, impactMatrix, migration, refetch } = useJournalsData();

  if (loading && !data) {
    return (
      <div className="journals-page flex flex-col h-full w-full">
        <DashboardContainer>
          <DashboardGrid columns={2}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 space-y-4 min-h-[360px]">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-64 w-full rounded" />
              </Card>
            ))}
          </DashboardGrid>
        </DashboardContainer>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <StatePanel
          variant="error"
          icon={<Icon icon="lucide:alert-triangle" width="32" className="text-danger" />}
          title={t('common.error', 'Data Loading Failed')}
          description={t('dashboard.loadingFailedDesc', 'Unable to load journals data. Please check your connection or try again.')}
          actions={
            <Button variant="outline" size="sm" onClick={refetch}>
              {t('common.retry', 'Thử lại')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="journals-page flex flex-col h-full w-full">
      <DashboardContainer>
        <DashboardGrid columns={2}>
          <QuartileDistributionCard 
            data={quartile.data} 
            loading={quartile.loading} 
            error={quartile.error} 
            onRetry={refetch}
          />
          <TopJournalRankingCard 
            data={topRanking.data} 
            loading={topRanking.loading} 
            error={topRanking.error} 
            onRetry={refetch}
          />
          <ImpactMatrixCard 
            data={impactMatrix.data} 
            loading={impactMatrix.loading} 
            error={impactMatrix.error} 
            onRetry={refetch}
          />
          <MigrationAnalysisCard 
            data={migration.data}
            isLoading={migration.loading}
            error={migration.error}
            onRetry={refetch}
          />
        </DashboardGrid>
      </DashboardContainer>
    </div>
  );
}
