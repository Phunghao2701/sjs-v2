import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Skeleton } from '../../../shared/ui/skeleton';

// Helper function to map country code to circle-flags icon code
const getCountryFlagCode = (item) => {
  const rawCode = (item.code || item.iso_code || item.iso2 || item.name?.substring(0, 2) || '').toLowerCase().trim();
  const isoMap = {
    gb: 'gb', gbr: 'gb', uk: 'gb',
    us: 'us', usa: 'us',
    de: 'de', deu: 'de',
    nl: 'nl', nld: 'nl',
    ch: 'ch', che: 'ch',
    vn: 'vn', vnm: 'vn',
    jp: 'jp', jpn: 'jp',
    kr: 'kr', kor: 'kr',
    cn: 'cn', chn: 'cn',
    in: 'in', ind: 'in',
    br: 'br', bra: 'br',
    ru: 'ru', rus: 'ru',
    ca: 'ca', can: 'ca',
    fr: 'fr', fra: 'fr',
    au: 'au', aus: 'au'
  };
  return isoMap[rawCode] || (rawCode.length === 2 ? rawCode : 'un');
};

export default function GeographyTerritoryChart({
  data = [],
  loading = false,
  selectedCountry = null,
  onSelectCountry,
  selectedYear = 'All'
}) {
  const { t } = useTranslation();

  // Top 10 countries sorted by article count
  const top10 = useMemo(() => {
    const sorted = [...data].sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0));
    return sorted.slice(0, 10);
  }, [data]);

  // Max value for width scaling
  const maxVal = useMemo(() => {
    const max = Math.max(...top10.map(item => Number(item.article_count) || 0), 0);
    return max > 0 ? max : 1;
  }, [top10]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground tracking-tight m-0 truncate">
            {t("zone.top10QuocGiaCoSanLuongArticleCa", "Top 10 Countries by Article Output")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0 truncate">
            {t("zone.phanBoSoLuongBaiBaoKhoaHocXuat", "Distribution of scientific publications worldwide")}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-muted text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0">
          {selectedYear === 'All' ? t("zone.tatCaCacNam", "All Years") : `Năm ${selectedYear}`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3.5 py-4 flex-1 flex flex-col justify-around min-h-[420px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-6 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-7 flex-1 rounded-md" />
              <Skeleton className="h-4 w-12 shrink-0" />
            </div>
          ))}
        </div>
      ) : top10.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground py-16 text-sm">
          <Icon icon="lucide:globe" width="40" className="opacity-40 mb-2" />
          <span>{t("topic.khongCoDuLieu", "No geographic data available")}</span>
        </div>
      ) : (
        <div className="pt-3 space-y-2.5 flex-1 flex flex-col justify-around">
          {top10.map((item, index) => {
            const val = Number(item.article_count) || 0;
            const widthPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const flagCode = getCountryFlagCode(item);
            const isSelected = selectedCountry?.zone_id === item.zone_id;
            const rank = index + 1;

            return (
              <div
                key={item.zone_id || index}
                onClick={() => onSelectCountry?.(item)}
                className={`group flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-subtle/50 border-primary shadow-xs'
                    : 'border-transparent hover:bg-surface-muted/60 hover:border-border/60'
                }`}
              >
                {/* Rank Badge */}
                <span className={`w-5 text-center text-xs font-mono font-bold shrink-0 ${
                  rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {rank}
                </span>

                {/* Country Flag & Label */}
                <div className="w-[140px] sm:w-[160px] md:w-[175px] shrink-0 min-w-0 flex items-center gap-2.5">
                  <Icon
                    icon={`circle-flags:${flagCode}`}
                    width={22}
                    height={22}
                    className="rounded-full shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1 truncate">
                    <span
                      className="block truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight"
                      title={item.name}
                    >
                      {item.name || item.code}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                      {item.code || item.iso_code || '—'}
                    </span>
                  </div>
                </div>

                {/* Horizontal Bar Track & Fill */}
                <div className="flex-1 min-w-0 h-6 sm:h-7 rounded-md bg-surface-muted/70 relative flex items-center overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all duration-500 ease-out flex items-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-primary to-primary-hover shadow-sm'
                        : 'bg-gradient-to-r from-primary/85 to-primary group-hover:from-primary group-hover:to-primary-hover'
                    }`}
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  >
                    {/* Number inside when bar is wide */}
                    {widthPercent >= 35 && (
                      <span className="ml-auto pr-2 text-[11px] font-bold text-white font-mono whitespace-nowrap">
                        {val.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Number outside when bar is narrow to prevent cut-off */}
                  {widthPercent < 35 && (
                    <span className="pl-2 text-[11px] font-bold text-foreground font-mono whitespace-nowrap">
                      {val.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Percentage Share */}
                <span className="w-12 sm:w-14 text-right text-xs font-mono font-semibold text-muted-foreground shrink-0">
                  {widthPercent.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
