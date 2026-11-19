import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useQuartiles } from '../hooks/useQuartiles';
import { mapFiltersToQueryParams } from '../services/globalEcosystem.service';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/ui/card';

export default function ImpactQuartilesCard() {
  const { t } = useTranslation();
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();
  const queryParams = mapFiltersToQueryParams(filters);
  const { data: quartilesData, isLoading, error } = useQuartiles(projectId, queryParams, refreshTrigger);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  if (isLoading) {
    return (
      <Card className="donut-chart-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">{t('dashboard.impactQuartiles', 'Impact Quartiles')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LoadingSkeleton height="150px" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="donut-chart-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardContent className="p-4">
          <InlineErrorState 
            message={t('dashboard.quartilesError', 'Failed to load impact quartiles')}
            onRetry={refreshData}
          />
        </CardContent>
      </Card>
    );
  }

  if (!quartilesData) {
    return (
      <Card className="donut-chart-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">{t('dashboard.impactQuartiles', 'Impact Quartiles')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground m-0">
            {t('dashboard.quartilesNoData', 'OpenAlex does not provide journal quartile rankings.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentage = quartilesData.percentage;
  const label = quartilesData.label;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const description = quartilesData 
    ? t('dashboard.quartilesDescDynamic', { 
        group: quartilesData.highestGroup.group, 
        total: quartilesData.totalJournals,
        defaultValue: `Highest concentration is in ${quartilesData.highestGroup.group} (${quartilesData.totalJournals} total journals)`
      })
    : t('dashboard.quartilesDescStatic', 'Ratio of publications in top 25% of citation rankings');

  return (
    <Card className="donut-chart-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">{t('dashboard.impactQuartiles', 'Impact Quartiles')}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="donut-chart-info flex-1">
          <p className="text-xs text-muted-foreground m-0 leading-relaxed">{description}</p>
        </div>
        
        <div className="donut-chart-visual shrink-0">
          <svg className="donut-svg" viewBox="0 0 100 100">
            <circle
              className="donut-bg"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeWidth="8"
            />
            <circle
              className="donut-progress"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="donut-chart-label">
            <span className="donut-percentage">{percentage}%</span>
            <span className="donut-text">{label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
