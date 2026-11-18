import { useTranslation } from "react-i18next";
import { DashboardStatCard, PublicationTrendsChart, ActivityTimeline, VolumeIssueTable } from '../components/dashboard';
import useAdminDashboard from '../hooks/useAdminDashboard';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const {
    selectedYear,
    setSelectedYear,
    statCards,
    summaryLoading,
    summaryError,
    trendItems,
    trendYears,
    trendsLoading,
    trendsError,
    activityItems,
    activityLoading,
    activityError,
    volumeStatusItems,
    volumeLoading,
    volumeError,
    volumePage,
    setVolumePage,
    volumeLimit,
    volumeTotalPages,
    volumeTotalItems
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Dashboard' }
        ]}
        title="Dashboard"
        description="Monitor journals, article flow, review workload, and publication operations from a single research management surface."
      />

      <div className="admin-stat-grid">
        {summaryLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-border shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </>
        ) : summaryError ? (
          <div className="col-span-full">
            <StatePanel
              variant="error"
              title="Dashboard Summary Error"
              description={summaryError}
            />
          </div>
        ) : statCards.length === 0 ? (
          <div className="col-span-full">
            <StatePanel
              variant="neutral"
              title={t("admin.chuaCoDuLieuTongQuanDashboard")}
              description="No summary statistics available at this time."
            />
          </div>
        ) : (
          statCards.map(stat => (
            <DashboardStatCard
              key={stat.key}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              note={stat.note}
              noteType={stat.noteType}
            />
          ))
        )}
      </div>

      <div className="admin-dashboard-row">
        <PublicationTrendsChart
          data={trendItems}
          years={trendYears}
          selectedYear={selectedYear}
          onChangeYear={setSelectedYear}
          loading={trendsLoading}
          error={trendsError}
        />

        <ActivityTimeline
          items={activityItems}
          loading={activityLoading}
          error={activityError}
        />
      </div>

      <VolumeIssueTable
        items={volumeStatusItems}
        loading={volumeLoading}
        error={volumeError}
        currentPage={volumePage}
        totalPages={volumeTotalPages}
        onPageChange={setVolumePage}
        totalItems={volumeTotalItems}
        limit={volumeLimit}
      />
    </div>
  );
}