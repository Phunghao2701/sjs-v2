import { useTranslation } from "react-i18next";
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../shared/components/Icon';
import { Skeleton } from '../../../shared/ui/skeleton';

// Helper function to map country code to circle-flags icon code
const getCountryFlagCode = (item) => {
  const rawCode = (item?.code || item?.iso_code || item?.iso2 || item?.name?.substring(0, 2) || '').toLowerCase().trim();
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

export default function GeographyRankingTable({
  data = [],
  loading = false,
  selectedCountry = null,
  onSelectCountry,
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
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:list-ordered" width={18} className="text-primary shrink-0" />
            <h3 className="text-base font-bold text-foreground tracking-tight m-0">
              {t("zone.xepHangQuocGia", "Country Rankings")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0">
            {filteredData.length} {t("zone.quocGia", "countries")}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mt-3.5 mb-2.5 shrink-0">
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
          className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-surface-muted/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 transition-colors shadow-2xs"
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
      <div className="grid grid-cols-12 gap-2 px-2 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 shrink-0">
        <span className="col-span-2 text-center">{t("zone.hang", "Rank")}</span>
        <span className="col-span-6">{t("journal.quocGia", "Country")}</span>
        <span className="col-span-4 text-right">Articles</span>
      </div>

      {/* Table Body */}
      <div className="overflow-y-auto max-h-[380px] divide-y divide-border/40 space-y-0.5 pr-1 custom-scrollbar">
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
            const flagCode = getCountryFlagCode(item);

            return (
              <motion.div
                key={item.zone_id || item.rank}
                onClick={() => onSelectCountry?.(item)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.12 }}
                className={`grid grid-cols-12 gap-2 px-2 py-2.5 items-center rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary-subtle text-primary font-bold shadow-2xs border border-primary/30'
                    : 'text-foreground hover:bg-surface-muted/60 border border-transparent'
                }`}
              >
                <span className={`col-span-2 text-center font-mono font-bold ${
                  item.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.rank}
                </span>
                <div className="col-span-6 flex items-center gap-2 min-w-0" title={item.name}>
                  <Icon
                    icon={`circle-flags:${flagCode}`}
                    width={18}
                    height={18}
                    className="rounded-full shrink-0 shadow-2xs"
                  />
                  <span className="truncate font-medium text-foreground">
                    {item.name || '—'}
                  </span>
                </div>
                <span className="col-span-4 text-right font-mono font-semibold text-foreground">
                  {Number(item.article_count || 0).toLocaleString()}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
