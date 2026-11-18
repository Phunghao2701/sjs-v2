import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount } from '../../../shared/utils/formatNumber';

export default function StatCard({ label, value, loading }) {
  const { t } = useTranslation();

  return (
    <Card className="min-w-0 p-3.5 sm:p-4 transition-colors hover:border-primary/40">
      {loading ? (
        <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-1/3" />
        </div>
      ) : (
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
            {label}
          </span>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {typeof value === 'number' ? formatCount(value) : value ?? '0'}
          </div>
        </div>
      )}
    </Card>
  );
}
