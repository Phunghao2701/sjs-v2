import { NavLink, Navigate, Outlet, useParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { DashboardProvider } from './features/dashboard/contexts/DashboardContext';
import trendingI18n from './i18n';
import './shared/styles/tokens.css';
import { Button } from '../shared/ui/button';
import { PageContainer, PageHeader } from '../shared/ui/page-layout';

const links = [
  ['dashboard', 'Global ecosystem & trends'],
  ['journals', 'Journal analytics'],
  ['volumes/journal-metrics', 'Collaboration analytics'],
  ['volumes/keywords-networks', 'Keyword networks'],
  ['analytics', 'Tracked journals'],
  ['analytics/curated-articles', 'Curated articles'],
];

export default function TrendingAnalyticsLayout() {
  const { lang = 'en', id } = useParams();

  if (!id || id === 'default-id') {
    return <Navigate to={`/${lang}/projects`} replace />;
  }

  return (
    <DashboardProvider projectId={id}>
      <PageContainer className="trending-analytics-shell">
        <PageHeader
          title="In-depth analysis"
          description="Trending System · Project analytics"
          className="border-0 pb-0"
          actions={(
            <nav className="flex flex-wrap gap-2" aria-label="Analytics pages">
            {links.map(([path, label]) => (
              <NavLink key={path} to={`/${lang}/project/${id}/${path}`} end={path === 'analytics'}>
                {({ isActive }) => (
                  <Button asChild size="sm" variant={isActive ? 'default' : 'outline'}>
                    <span>{label}</span>
                  </Button>
                )}
              </NavLink>
            ))}
            </nav>
          )}
        />
        <I18nextProvider i18n={trendingI18n}>
          <Outlet />
        </I18nextProvider>
      </PageContainer>
    </DashboardProvider>
  );
}
