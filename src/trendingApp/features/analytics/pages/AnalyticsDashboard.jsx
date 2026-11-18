import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';
import { Tabs } from '../components/Tabs/Tabs';
import { JournalTable } from '../components/JournalTable/JournalTable';
import { SummaryCards } from '../components/SummaryCards/SummaryCards';
import DashboardFooter from '../../../shared/components/layout/DashboardFooter';
import { useTrackedJournalsQuery } from '../hooks/useTrackedJournals';
import { Skeleton } from '../../../../shared/ui/skeleton';
import { StatePanel } from '../../../../shared/ui/state-panel';
import { Card } from '../../../../shared/ui/card';
import { Icon } from '@iconify/react';
import styles from '../styles/Analytics.module.css';

/**
 * ---------------------------------------------------------
 * Analytics Dashboard
 *
 * Displays the Scientia Analytics overview page.
 *
 * Issue:
 * #53
 *
 * Author:
 * Team Scientia
 * ---------------------------------------------------------
 */
export const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const projectId = id === 'default-id' ? '1' : id;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 4; // Matches the design displaying 4 journals per page

  const { data, isLoading, error } = useTrackedJournalsQuery(projectId, page, limit);

  const journals = data?.journals || data?.data?.journals || [];
  const pagination = data?.pagination || data?.data?.pagination || { totalCount: 0, page, limit, totalPages: 0 };
  const summary = data?.summary || data?.data?.summary || { averageImpactFactor: 0, percentageChange: '+0.0%', trackedCount: 0, limit: 100 };

  // Prefetch next page in background for instantaneous page switching
  useEffect(() => {
    if (pagination.totalCount && page * limit < pagination.totalCount) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: ['trackedJournals', projectId, nextPage, limit],
        queryFn: async () => {
          const response = await apiClient.get('/analytics/journals/ranking', {
            params: { project_id: projectId, page: nextPage, limit },
          });
          const rawData = response?.data || response;
          if (rawData && rawData.data && (rawData.data.journals || rawData.data.pagination)) {
            return rawData.data;
          }
          return rawData;
        },
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [page, limit, pagination.totalCount, projectId, queryClient]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => (prev * limit < pagination.totalCount ? prev + 1 : prev));
  };

  const hasData = journals.length > 0;
  const showLoading = isLoading && !hasData;

  return (
    <div className={styles.analyticsPage}>
      <Tabs />

      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>{t('analytics.trackedJournals', 'Tracked Journals')}</h2>
          <p className={styles.pageDescription}>
            {t('analytics.trackedJournalsDesc', 'Manage your watchlist for bibliometric monitoring. These journals are currently indexed for real-time impact factor updates and citation frequency alerts.')}
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {showLoading ? (
          <div className="space-y-4 py-4">
            <Card className="p-6 space-y-3">
              <Skeleton className="h-6 w-48 rounded" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </Card>
          </div>
        ) : error && !hasData ? (
          <StatePanel
            variant="error"
            icon={<Icon icon="lucide:alert-triangle" width="32" className="text-danger" />}
            title={t('common.error', 'Error Loading Data')}
            description={error.message || t('analytics.unableToConnect', 'Unable to connect to the server.')}
          />
        ) : (
          <>
            <JournalTable
              journals={journals}
              page={page}
              limit={limit}
              totalCount={pagination.totalCount}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />

            <SummaryCards summary={summary} />
          </>
        )}
      </div>
      <DashboardFooter />
    </div>
  );
};

export default AnalyticsDashboard;
