import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useDistribution } from '../hooks/useDistribution';
import { mapFiltersToQueryParams } from '../services/globalEcosystem.service';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../shared/ui/card';

export default function ResearchLandscapeCard() {
  const { t } = useTranslation();
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();
  const queryParams = mapFiltersToQueryParams(filters);
  const { data, isLoading, error } = useDistribution(projectId, queryParams, refreshTrigger);
  
  if (isLoading) {
    return (
      <Card className="dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-foreground">
            {t('dashboard.researchLandscape', 'Research Landscape')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LoadingSkeleton height="150px" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
        <CardContent className="p-4">
          <InlineErrorState 
            message={t('dashboard.landscapeError', 'Failed to load research landscape')}
            onRetry={refreshData}
          />
        </CardContent>
      </Card>
    );
  }

  const validData = Array.isArray(data) ? data : [];
  
  const getClassForIndex = (index) => {
    const classes = ['biotech', 'ai', 'materials'];
    return classes[index % classes.length];
  };

  return (
    <Card className="dashboard-card bg-surface border-border shadow-card rounded-card overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">
          {t('dashboard.researchLandscape', 'Research Landscape')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="research-landscape-grid">
          {validData.length === 0 ? (
            <div className="landscape-empty-state text-xs text-muted-foreground py-4 text-center">
              {t('dashboard.landscapeNoData', 'No topic distribution is available for this project yet.')}
            </div>
          ) : (
            <>
            <div className={`landscape-card ${getClassForIndex(0)}`}>
              <div className="landscape-card-content">
                <span className="landscape-label">{validData[0].name}</span>
                <span className="landscape-value">{validData[0].value}<small>%</small></span>
              </div>
            </div>
            <div className="landscape-column">
              {validData.slice(1, 3).map((item, index) => (
                <div key={item.name} className={`landscape-card ${getClassForIndex(index + 1)}`}>
                  <div className="landscape-card-content">
                    <span className="landscape-label">{item.name}</span>
                    <span className="landscape-value">{item.value}<small>%</small></span>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
