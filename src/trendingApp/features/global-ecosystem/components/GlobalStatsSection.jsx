import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGrid from '../../../shared/components/layout/DashboardGrid';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useDashboardStatsQuery } from '../hooks/useDashboardStatsQuery';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';
import { Card } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';

const KPIStatCard = ({ title, value, trend, trendValue }) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <Card className="p-4 sm:p-5 bg-surface border-border shadow-card rounded-card flex flex-col justify-between hover:border-primary/40 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</div>
        <Badge
          variant={isPositive ? 'success' : isNegative ? 'destructive' : 'secondary'}
          className="gap-1 font-medium px-2 py-0.5 text-xs"
        >
          <span>{isPositive ? '↗' : isNegative ? '↘' : '—'}</span>
          <span>{trendValue}</span>
        </Badge>
      </div>

      <div className="mt-3 h-7 w-full opacity-75">
        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
          {isPositive && <path d="M0,25 Q25,5 50,20 T100,5" fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="2.5" strokeLinecap="round" />}
          {isNegative && <path d="M0,5 Q25,25 50,10 T100,25" fill="none" stroke="currentColor" className="text-rose-500" strokeWidth="2.5" strokeLinecap="round" />}
          {!isPositive && !isNegative && <path d="M0,15 L100,15" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" />}
        </svg>
      </div>
    </Card>
  );
};

export default function GlobalStatsSection() {
  const { t } = useTranslation();
  const { projectId, refreshTrigger, refreshData } = useDashboardContext();
  const { data: stats, isLoading, error } = useDashboardStatsQuery(projectId, refreshTrigger);

  if (isLoading) {
    return (
      <DashboardGrid columns={4} className="kpi-cards-grid">
        {[1, 2, 3, 4].map(i => (
          <div className="kpi-stat-card" key={i}>
            <LoadingSkeleton height="80px" />
          </div>
        ))}
      </DashboardGrid>
    );
  }

  if (error || !stats) {
    return (
      <DashboardGrid columns={1}>
        <InlineErrorState 
          message={error?.response?.data?.message || error?.message || t('dashboard.statsError', 'Failed to load stats')}
          onRetry={refreshData}
        />
      </DashboardGrid>
    );
  }

  const getLocalizedTitle = (title) => {
    switch (title) {
      case 'TOP AUTHORS': return t('dashboard.topAuthors', 'TOP AUTHORS');
      case 'INSTITUTIONS': return t('dashboard.institutions', 'INSTITUTIONS');
      case 'DENSITY INDEX': return t('dashboard.densityIndex', 'DENSITY INDEX');
      case 'RELOCATED': return t('dashboard.relocated', 'RELOCATED');
      default: return title;
    }
  };

  const getLocalizedTrendValue = (trend, val) => {
    if (trend === 'stable' && val === 'stable') return t('dashboard.stable', 'stable');
    return val;
  };

  return (
    <DashboardGrid columns={4} className="kpi-cards-grid">
      {stats.map(stat => (
        <KPIStatCard
          key={stat.title}
          title={getLocalizedTitle(stat.title)}
          value={stat.value}
          trend={stat.trend}
          trendValue={getLocalizedTrendValue(stat.trend, stat.trendValue)}
        />
      ))}
    </DashboardGrid>
  );
}
