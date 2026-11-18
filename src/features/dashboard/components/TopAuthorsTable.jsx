import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount } from '../../../shared/utils/formatNumber';

function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <span
        title="Rank 1"
        className="inline-flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold"
      >
        <Icon icon="lucide:crown" width={13} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        title="Rank 2"
        className="inline-flex size-6 items-center justify-center rounded-full bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[11px] font-bold font-mono"
      >
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        title="Rank 3"
        className="inline-flex size-6 items-center justify-center rounded-full bg-amber-800/10 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-700/20 text-[11px] font-bold font-mono"
      >
        3
      </span>
    );
  }
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground text-[11px] font-medium font-mono">
      {rank}
    </span>
  );
}

export default function TopAuthorsTable({ authors = [], loading, error, onAuthorClick, onViewAll }) {
  const { t } = useTranslation();

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:users" width={16} className="text-primary" />
          <span>{t('dashboard.topAuthorsTuanNay', 'Top Contributing Authors')}</span>
        </CardTitle>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-[11px] text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('dashboard.bangXepHang', 'View Leaderboard')}</span>
            <Icon icon="lucide:arrow-right" width={13} />
          </button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="p-4 space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={24} className="mx-auto mb-1.5" />
            {error}
          </div>
        ) : authors.length === 0 ? (
          <div className="py-8 text-center">
            <div className="size-9 rounded-full bg-surface-muted text-muted-foreground flex items-center justify-center mx-auto mb-2">
              <Icon icon="lucide:users" width={18} />
            </div>
            <p className="mb-0.5 text-xs font-semibold text-foreground">
              {t('dashboard.chuaCoDuLieuTacGia', 'No author data yet')}
            </p>
            <p className="m-0 text-[11px] text-muted-foreground">
              {t('dashboard.duLieuLeaderboardSeHienThiODay', 'Leaderboard data will be displayed here.')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-xs table-fixed">
              <thead className="bg-surface-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-3 py-2 w-14 text-center">#</th>
                  <th scope="col" className="px-3 py-2 w-auto">{t('typeAuthor', 'Author')}</th>
                  <th scope="col" className="px-3 py-2 w-44 hidden sm:table-cell">{t('author.linhVuc', 'Research Field')}</th>
                  <th scope="col" className="px-3 py-2 w-28 text-right">{t('articles', 'Articles')}</th>
                  <th scope="col" className="px-4 py-2 w-28 text-right">Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {authors.map((author, i) => {
                  const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown';
                  const field = author.subject_area ?? author.primary_subject_area ?? author.field ?? author.area ?? '—';
                  const articles = author.article_count ?? author.papers ?? author.works_count ?? 0;
                  const citations = author.citation_count ?? author.citations ?? author.cited_by_count ?? 0;
                  const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0].toUpperCase())
                    .join('');

                  return (
                    <tr key={author.author_id ?? author.id ?? i} className="transition-colors hover:bg-surface-muted/40">
                      <td className="px-3 py-2 text-center">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => onAuthorClick?.(author)}
                          className="flex max-w-full items-center gap-2 rounded border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-primary cursor-pointer group"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {initials}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-foreground text-xs group-hover:text-primary transition-colors" title={name}>
                              {name}
                            </span>
                            {author.orcid && (
                              <span className="block truncate text-[10px] font-mono text-muted-foreground">
                                {author.orcid}
                              </span>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell">
                        <span className="inline-block max-w-[160px] truncate rounded-full bg-surface-muted border border-border px-2 py-0.5 text-[10px] text-muted-foreground" title={field}>
                          {field || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-foreground font-medium tabular-nums text-xs">
                        {formatCount(articles)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-primary tabular-nums text-xs">
                        {formatCount(citations)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
