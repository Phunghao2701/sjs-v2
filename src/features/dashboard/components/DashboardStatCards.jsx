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
  const { t } = useTranslation();

  const cards = [
    {
      id: 'projects',
      value: stats?.projectCount,
      label: t("dashboard.projectsDangTheoDoi"),
    },
    {
      id: 'keywords',
      value: stats?.keywordCount,
      label: t("dashboard.keywordsDangWatch"),
    },
    {
      id: 'articles',
      value: stats?.articleCount,
      label: t("dashboard.baiBaoTrongProjects"),
    },
    {
      id: 'journals',
      value: stats?.journalCount,
      label: t("dashboard.journalsTheoDoi"),
    },
  ];

  return (
    <MotionGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MotionItem key={card.id}>
          <StatCard label={card.label} value={card.value} loading={loading} />
        </MotionItem>
      ))}
    </MotionGrid>
  );
}
