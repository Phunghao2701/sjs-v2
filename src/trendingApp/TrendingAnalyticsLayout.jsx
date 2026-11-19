import { NavLink, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { I18nextProvider } from 'react-i18next';
import { DashboardProvider } from './features/dashboard/contexts/DashboardContext';
import trendingI18n from './i18n';
import './shared/styles/tokens.css';
import { Button, buttonVariants } from '../shared/ui/button';
import { PageContainer, PageHeader } from '../shared/ui/page-layout';
import { cn } from '../lib/utils';

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
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (!id || id === 'default-id') {
    return <Navigate to={`/${lang}/projects`} replace />;
  }

  return (
    <DashboardProvider projectId={id}>
      <PageContainer className="trending-analytics-shell">
        <PageHeader
          title="In-depth analysis"
          description="Trending System · Project analytics"
          className="border-0 pb-2 flex-col sm:flex-col sm:items-start gap-3"
        >
          <nav className="flex flex-wrap items-center gap-2 pt-2 border-b border-border pb-3 w-full" aria-label="Analytics pages">
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={`/${lang}/project/${id}/${path}`}
                end={path === 'analytics'}
                className={({ isActive }) =>
                  cn(
                    buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
                    'no-underline inline-flex items-center text-decoration-none'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </PageHeader>
        <I18nextProvider i18n={trendingI18n}>
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </I18nextProvider>
      </PageContainer>
    </DashboardProvider>
  );
}
