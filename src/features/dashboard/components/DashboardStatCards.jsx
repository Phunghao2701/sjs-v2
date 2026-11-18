import { useTranslation } from "react-i18next";
import StatCard from './StatCard';
import { MotionGrid, MotionItem } from '../../../shared/ui/motion';

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
  return (
    <MotionGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MotionItem key={card.icon}>
          <StatCard {...card} loading={loading} />
        </MotionItem>
      ))}
    </MotionGrid>
  );
}
