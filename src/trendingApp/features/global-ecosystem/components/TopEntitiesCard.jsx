import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useTopEntities } from '../hooks/useTopEntities';
import { mapFiltersToQueryParams } from '../services/globalEcosystem.service';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/ui/card';

export default function TopEntitiesCard() {
  const { t } = useTranslation();
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();
  const queryParams = mapFiltersToQueryParams(filters);
  const { data: items = [], isLoading, error } = useTopEntities(projectId, { limit: 4, filters: queryParams, refreshTrigger });

  if (isLoading) {
    return (
      <Card className="ranking-list-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">{t('dashboard.topAuthors', 'Top Authors')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LoadingSkeleton height="150px" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ranking-list-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardContent className="p-4">
          <InlineErrorState 
            message={t('dashboard.topEntitiesError', 'Failed to load top entities')}
            onRetry={refreshData}
          />
        </CardContent>
      </Card>
    );
  }

  const maxValue = items.length > 0 ? Math.max(...items.map(item => item.value)) : 1;

  return (
    <Card className="ranking-list-container dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">{t('dashboard.topAuthors', 'Top Authors')}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="ranking-list-content">
          {items.length === 0 ? (
            <div className="ranking-empty-state text-xs text-muted-foreground py-4 text-center">
              {t('dashboard.topAuthorsNoData', 'No author data is available for this project yet.')}
            </div>
          ) : items.map((item, index) => (
            <div key={index} className="ranking-item">
              <div className="ranking-item-info">
                <span className="ranking-item-name">{item.name}</span>
                <span className="ranking-item-value">{item.displayValue}</span>
              </div>
              <div className="ranking-item-bar-container">
                <div 
                  className="ranking-item-bar" 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
