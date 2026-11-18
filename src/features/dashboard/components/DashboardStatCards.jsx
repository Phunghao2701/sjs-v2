import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\components\DashboardStatCards.jsx
 */
import StatCard from './StatCard';

/**
 * DashboardStatCards — renders 4 stat cards in a responsive grid.
 * Desktop: 4 columns | Tablet: 2×2 | Mobile: 1 column
 */
export default function DashboardStatCards({
  stats,
  loading
}) {
  const {
    t
  } = useTranslation();
  const cards = [{
    icon: 'lucide:folder-open',
    iconBg: 'bg-primary-subtle text-primary',
    value: stats?.projectCount,
    label: t("dashboard.projectsDangTheoDoi"),
    growth: null,
    growthLabel: ''
  }, {
    icon: 'lucide:hash',
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    value: stats?.keywordCount,
    label: t("dashboard.keywordsDangWatch"),
    growth: null,
    growthLabel: ''
  }, {
    icon: 'lucide:file-text',
    iconBg: 'bg-success-subtle text-success',
    value: stats?.articleCount,
    label: t("dashboard.baiBaoTrongProjects"),
    growth: null,
    growthLabel: ''
  }, {
    icon: 'lucide:book-open',
    iconBg: 'bg-warning-subtle text-warning',
    value: stats?.journalCount,
    label: t("dashboard.journalsTheoDoi"),
    growth: null,
    growthLabel: ''
  }];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => <StatCard key={card.icon} {...card} loading={loading} />)}
    </div>;
}
