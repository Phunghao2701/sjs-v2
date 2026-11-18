import { useTranslation } from "react-i18next";
import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Skeleton } from '../../../shared/ui/skeleton';

export default function GeographyRankingTable({
  data = [],
  loading = false,
  selectedCountry = null,
  onSelectCountry
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const rankedData = useMemo(() => {
    return [...data]
      .sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0))
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rankedData;
    const term = searchTerm.toLowerCase();
    return rankedData.filter(item =>
      item.name?.toLowerCase().includes(term) ||
      item.code?.toLowerCase().includes(term) ||
      item.iso_code?.toLowerCase().includes(term)
    );
  }, [rankedData, searchTerm]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight m-0">
            {t("zone.xepHangQuocGia", "Country Rankings")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0">
            {filteredData.length} {t("zone.quocGia", "countries")}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mt-3.5 mb-2.5">
        <Icon
          icon="lucide:search"
          width="14"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          placeholder={t("zone.timQuocGia", "Search country...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-surface-muted/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors shadow-2xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 border-0 bg-transparent cursor-pointer"
            aria-label="Clear search"
          >
            <Icon icon="lucide:x" width="13" />
          </button>
        )}
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 px-2 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
        <span className="col-span-2 text-center">{t("zone.hang", "Rank")}</span>
        <span className="col-span-6">{t("journal.quocGia", "Country")}</span>
        <span className="col-span-4 text-right">Articles</span>
      </div>

      {/* Table Body */}
      <div className="overflow-y-auto max-h-[460px] divide-y divide-border/40 space-y-0.5 pr-1">
        {loading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-2 py-2 items-center">
                <Skeleton className="col-span-2 h-4 w-6 mx-auto rounded" />
                <Skeleton className="col-span-6 h-4 w-28 rounded" />
                <Skeleton className="col-span-4 h-4 w-16 ml-auto rounded" />
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            {t("zone.khongTimThayQuocGiaPhuHop", "No matching countries found")}
          </div>
        ) : (
          filteredData.map((item) => {
            const isSelected = selectedCountry?.zone_id === item.zone_id;
            return (
              <div
                key={item.zone_id || item.rank}
                onClick={() => onSelectCountry?.(item)}
                className={`grid grid-cols-12 gap-2 px-2 py-2.5 items-center rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary-subtle text-primary font-bold shadow-2xs'
                    : 'text-foreground hover:bg-surface-muted/60'
                }`}
              >
                <span className={`col-span-2 text-center font-mono font-bold ${
                  item.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.rank}
                </span>
                <span className="col-span-6 truncate font-medium text-foreground" title={item.name}>
                  {item.name || '—'}
                </span>
                <span className="col-span-4 text-right font-mono font-semibold text-foreground">
                  {Number(item.article_count || 0).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
