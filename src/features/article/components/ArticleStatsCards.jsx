import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';

export default function ArticleStatsCards({
  stats,
  isLoading
}) {
  const { t } = useTranslation();

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const statItems = [
    {
      label: t("article.tongBaiBao", "TOTAL ARTICLES"),
      value: stats?.totalArticles || 0,
      hint: t("article.indexedInDb", "Indexed in repository"),
      icon: 'lucide:file-text',
      iconBg: 'bg-primary-subtle text-primary',
    },
    {
      label: 'OPEN ACCESS',
      value: stats?.openAccessCount || 0,
      hint: t("article.fullTextFree", "Freely accessible papers"),
      icon: 'lucide:unlock',
      iconBg: 'bg-success-subtle text-success',
    },
    {
      label: t("article.tongTacGia", "ACTIVE AUTHORS"),
      value: stats?.authorsCount || 0,
      hint: t("article.recordedAuthors", "Contributing researchers"),
      icon: 'lucide:users',
      iconBg: 'bg-primary-subtle text-primary-hover',
    },
    {
      label: t("typeArea", "RESEARCH TOPICS"),
      value: stats?.topicsCount || 0,
      hint: t("article.fieldsAndDisciplines", "Scientific fields & topics"),
      icon: 'lucide:layers',
      iconBg: 'bg-warning-subtle text-warning',
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-3 sm:p-3.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="space-y-1.5 w-full">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
              <Skeleton className="size-8 rounded-lg shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item, index) => (
        <Card key={index} className="p-3 sm:p-3.5 transition-colors hover:border-primary/40">
          <div className="flex items-start justify-between gap-2.5">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                {item.label}
              </span>
              <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">
                {formatNumber(item.value)}
              </div>
              <p className="text-[11px] text-muted-foreground truncate m-0">
                {item.hint}
              </p>
            </div>
            <div className={`p-1.5 rounded-lg shrink-0 ${item.iconBg}`}>
              <Icon icon={item.icon} width="16" height="16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
