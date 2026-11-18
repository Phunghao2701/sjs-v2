import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';

export default function JournalStatsCards({
  stats = { totalJournals: 0, q1Journals: 0, totalCountries: 0, openAccessJournals: 0 },
  loading = false
}) {
  const { t } = useTranslation();

  const cardData = [
    {
      title: t("journal.tongJournals", "Tổng số tạp chí"),
      value: (stats.totalJournals || 0).toLocaleString('en-US'),
      icon: 'lucide:book-open',
      color: 'text-primary'
    },
    {
      title: 'Q1 Journals',
      value: (stats.q1Journals || 0).toLocaleString('en-US'),
      icon: 'lucide:award',
      color: 'text-amber-600'
    },
    {
      title: t("journal.quocGia", "Quốc gia"),
      value: (stats.totalCountries || 0).toLocaleString('en-US'),
      icon: 'lucide:globe',
      color: 'text-indigo-600'
    },
    {
      title: 'Open Access',
      value: (stats.openAccessJournals || 0).toLocaleString('en-US'),
      icon: 'lucide:unlock',
      color: 'text-emerald-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border border-border bg-surface rounded-card shadow-card">
            <Skeleton className="h-4 w-24 rounded mb-3" />
            <Skeleton className="h-8 w-20 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cardData.map((item, idx) => (
        <Card key={idx} className="p-4 border border-border bg-surface rounded-card shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {item.title}
            </span>
            <div className={`p-2 rounded-lg bg-surface-muted/60 ${item.color}`}>
              <Icon icon={item.icon} width="18" height="18" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
