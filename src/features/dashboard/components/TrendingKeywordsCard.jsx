import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';

function KeywordBars({ chartData, onKeywordClick, isFetching }) {
  const { t } = useTranslation();
  const labels = chartData?.labels || [];
  const values = chartData?.datasets?.[0]?.data || [];
  const rows = labels.slice(0, 8).map((keyword, index) => ({
    keyword: String(keyword),
    value: Number(values[index]) || 0,
  }));
  const maximum = Math.max(1, ...rows.map(({ value }) => value));

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ol
        aria-label="Trending keywords by publication count"
        className={`m-0 space-y-1 list-none p-0 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}
      >
        {rows.map(({ keyword, value }) => {
          const content = (
            <>
              <span
                className="w-40 sm:w-48 shrink-0 truncate text-left text-[11px] font-medium text-foreground group-hover:text-primary transition-colors"
                title={keyword}
              >
                {keyword}
              </span>
              <span
                aria-hidden="true"
                className="h-2 flex-1 min-w-16 overflow-hidden rounded-full bg-surface-muted border border-border/40"
              >
                <span
                  className="block h-full rounded-full bg-primary/80 group-hover:bg-primary transition-all duration-300"
                  style={{ width: `${Math.max(value > 0 ? 3 : 0, (value / maximum) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right text-[11px] font-mono tabular-nums text-muted-foreground group-hover:text-foreground">
                {value.toLocaleString()}
              </span>
            </>
          );

          return (
            <li key={keyword} className="min-w-0">
              {onKeywordClick ? (
                <button
                  type="button"
                  onClick={() => onKeywordClick(keyword)}
                  aria-label={`${keyword}: ${value}`}
                  className="group flex min-h-6 w-full items-center gap-2.5 rounded px-2 py-0.5 text-left transition-colors hover:bg-surface-muted/60 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
                >
                  {content}
                </button>
              ) : (
                <div className="group flex min-h-6 items-center gap-2.5 px-2 py-0.5">{content}</div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Bottom grounded footer */}
      <div className="pt-2.5 mt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{t('dashboard.tongSoKeyword', 'Top keywords')}</span>
        <span className="font-semibold text-foreground font-mono">{rows.length} {t('dashboard.chuDe', 'topics')}</span>
      </div>
    </div>
  );
}

export default function TrendingKeywordsCard({ keywords, loading, isFetching, error, onKeywordClick, onViewMore }) {
  const { t } = useTranslation();
  const labels = keywords?.labels || [];
  const dataset = keywords?.datasets?.[0] || { data: [] };
  const hasData = labels.length > 0 && dataset.data?.length > 0;

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:flame" width={16} className="text-primary" />
          <span>Trending Keywords</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Icon icon="lucide:loader" className="animate-spin text-muted-foreground" width={12} aria-label={t('common.dangCapNhat', 'Loading')} />
          )}
          {onViewMore && (
            <button
              type="button"
              onClick={onViewMore}
              className="shrink-0 text-[11px] text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{t('dashboard.xemThem', 'View all')}</span>
              <Icon icon="lucide:arrow-right" width={13} />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {loading && !hasData ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-2.5 py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                <span className="h-2 flex-1 animate-pulse rounded bg-surface-muted" />
                <span className="h-3 w-10 animate-pulse rounded bg-surface-muted" />
              </div>
            ))}
          </div>
        ) : error && !hasData ? (
          <div className="py-6 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={22} className="mx-auto mb-1.5" />
            {error}
          </div>
        ) : !hasData ? (
          <div className="py-6 text-center flex flex-col items-center justify-center my-auto">
            <div className="size-9 rounded-full bg-surface-muted text-muted-foreground flex items-center justify-center mb-2">
              <Icon icon="lucide:tag" width={18} />
            </div>
            <p className="mb-0.5 text-xs font-semibold text-foreground">{t('dashboard.chuaCoKeywordNao', 'No keywords yet')}</p>
            <p className="m-0 text-[11px] text-muted-foreground">{t('dashboard.themKeywordVaoProjectDeBatDauT', 'Add keywords to project to start tracking.')}</p>
          </div>
        ) : (
          <KeywordBars chartData={keywords} onKeywordClick={onKeywordClick} isFetching={isFetching} />
        )}
      </CardContent>
    </Card>
  );
}
