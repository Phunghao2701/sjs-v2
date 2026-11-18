import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import Pagination from '../../../shared/components/Pagination';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';

// Helper function to map country code to circle-flags icon code
const getCountryFlagCode = (countryName = '') => {
  const code = countryName.toLowerCase().trim();
  const isoMap = {
    'united states': 'us', usa: 'us', us: 'us',
    'united kingdom': 'gb', uk: 'gb', gb: 'gb',
    china: 'cn', cn: 'cn',
    germany: 'de', de: 'de',
    japan: 'jp', jp: 'jp',
    france: 'fr', fr: 'fr',
    india: 'in', in: 'in',
    indonesia: 'id', id: 'id',
    canada: 'ca', ca: 'ca',
    brazil: 'br', br: 'br',
    italy: 'it', it: 'it',
    russia: 'ru', ru: 'ru',
    australia: 'au', au: 'au',
    spain: 'es', es: 'es',
    'south korea': 'kr', korea: 'kr', kr: 'kr',
    netherlands: 'nl', nl: 'nl',
    switzerland: 'ch', ch: 'ch',
    vietnam: 'vn', 'viet nam': 'vn', vn: 'vn'
  };
  return isoMap[code] || (code.length === 2 ? code : 'un');
};

export default function GeographyArticleList({
  articles = [],
  loading = false,
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  onDetailClick,
  countryName = '',
  onClose
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copiedDoi, setCopiedDoi] = useState(null);

  // Copy DOI to clipboard helper
  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  const handleJournalClick = (e, journalId) => {
    e.stopPropagation();
    if (journalId) {
      navigate(`/journals/${journalId}`);
    }
  };

  // Helper to assign semantic topic badge
  const renderTopicBadge = (topic) => {
    if (!topic) {
      return (
        <Badge variant="secondary" className="text-[11px] font-medium">
          {t("article.chuaPhanLoai", "General")}
        </Badge>
      );
    }
    const name = String(topic).toLowerCase();
    let variant = 'secondary';
    if (name.includes('machine learning') || name.includes('ml') || name.includes('intelligence') || name.includes('computer') || name.includes('data')) {
      variant = 'info';
    } else if (name.includes('medicine') || name.includes('bio') || name.includes('health')) {
      variant = 'success';
    } else if (name.includes('physic') || name.includes('math') || name.includes('engineer')) {
      variant = 'warning';
    }

    return (
      <Badge variant={variant} className="text-[11px] font-semibold max-w-[160px] truncate" title={topic}>
        {topic}
      </Badge>
    );
  };

  // Render skeletons for loading state
  const renderSkeletons = () => (
    <tbody className="divide-y divide-border/60">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i} className="border-b border-border/60">
          <td className="px-3 py-3.5 text-center w-12">
            <Skeleton className="h-3.5 w-5 rounded mx-auto" />
          </td>
          <td className="px-4 py-3.5">
            <Skeleton className="h-4 w-4/5 rounded mb-2" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </td>
          <td className="px-3 py-3.5">
            <Skeleton className="h-3.5 w-28 rounded" />
          </td>
          <td className="px-3 py-3.5 text-center">
            <Skeleton className="h-3.5 w-10 rounded mx-auto" />
          </td>
          <td className="px-3 py-3.5">
            <Skeleton className="h-3 w-24 rounded" />
          </td>
          <td className="px-3 py-3.5">
            <Skeleton className="h-5 w-20 rounded-md" />
          </td>
          <td className="px-3 py-3.5 text-center">
            <Skeleton className="h-5 w-10 rounded-full mx-auto" />
          </td>
          <td className="px-4 py-3.5 text-end">
            <Skeleton className="h-4 w-14 rounded ms-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  const flagCode = getCountryFlagCode(countryName);

  return (
    <section className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
      {/* Card Header with Country info & Close button */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            icon={`circle-flags:${flagCode}`}
            width={24}
            height={24}
            className="rounded-full shrink-0 shadow-2xs"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground tracking-tight m-0 truncate">
                {t("zone.danhSachBaiBaoKhoaHocTai", "Scientific Publications in")} {countryName}
              </h3>
              <Badge variant="info" className="text-[11px] font-semibold">
                {Number(total || 0).toLocaleString()} {t("articles", "articles")}
              </Badge>
            </div>
            {!loading && total > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5 mb-0 truncate">
                {t("zone.hienThiBaiBaoThu", "Displaying articles")} <strong className="text-foreground font-mono">{(page - 1) * 10 + 1}</strong> – <strong className="text-foreground font-mono">{Math.min(page * 10, total)}</strong> {t("zone.trongTongSo", "of")} <strong className="text-foreground font-mono">{total.toLocaleString()}</strong>
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
            title={t("zone.dong", "Close")}
          >
            <Icon icon="lucide:x" width={14} />
            <span>{t("zone.boChon", "Deselect")}</span>
          </Button>
        )}
      </div>

      {/* Main Content: Table or Loading or Empty */}
      {loading && articles.length === 0 ? (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-[12px] text-muted-foreground font-semibold">
                <th className="px-3 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">{t("article.tenBaiBao", "Article Title")}</th>
                <th className="px-3 py-3 w-48">Journal</th>
                <th className="px-3 py-3 text-center w-20">{t("article.nam1", "Year")}</th>
                <th className="px-3 py-3 w-36">DOI</th>
                <th className="px-3 py-3 w-40">Topic / Field</th>
                <th className="px-3 py-3 text-center w-20">Access</th>
                <th className="px-4 py-3 text-end w-24">{t("article.chiTiet", "Action")}</th>
              </tr>
            </thead>
            {renderSkeletons()}
          </table>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
          <div className="size-12 rounded-full bg-surface-muted flex items-center justify-center text-muted-foreground mb-3">
            <Icon icon="lucide:file-x" width={24} />
          </div>
          <h4 className="text-base font-bold text-foreground mb-1">
            {t("zone.khongCoBaiBaoNao", "No publications found")}
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mb-0">
            {t("zone.hienTaiChuaCoBaiBaoKhoaHocNaoT", "No articles recorded for this jurisdiction in the selected time period.")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (full-width, high-density, no squishing) */}
          <div className="overflow-x-auto w-full hidden md:block">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-[12px] text-muted-foreground font-semibold">
                  <th className="px-3 py-3 text-center w-12">#</th>
                  <th className="px-4 py-3 min-w-[280px]">{t("article.tenBaiBao", "Article Title")}</th>
                  <th className="px-3 py-3 w-48">Journal</th>
                  <th className="px-3 py-3 text-center w-20">{t("article.nam1", "Year")}</th>
                  <th className="px-3 py-3 w-36">DOI</th>
                  <th className="px-3 py-3 w-40">Topic / Field</th>
                  <th className="px-3 py-3 text-center w-20">Access</th>
                  <th className="px-4 py-3 text-end w-24">{t("article.chiTiet", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {articles.map((article, index) => {
                  const globalIndex = (page - 1) * 10 + index + 1;
                  const isCopied = copiedDoi === article.doi;
                  const journalId = article.journal_id || article.journal?.journal_id;
                  const journalName = article.journal_name || article.journal?.display_name;
                  const topicName = article.topic_name || article.primary_topic_name || article.primary_topic;

                  return (
                    <tr
                      key={article.article_id || index}
                      onClick={() => onDetailClick?.(article.article_id)}
                      className="cursor-pointer transition-colors hover:bg-primary-subtle/30 group"
                    >
                      {/* Index */}
                      <td className="px-3 py-3.5 text-center text-xs font-mono text-muted-foreground">
                        {globalIndex}
                      </td>

                      {/* Title & Abstract preview */}
                      <td className="px-4 py-3.5 max-w-lg">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2 leading-snug">
                          <LatexText text={article.title} />
                        </div>
                        {article.abstract && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1 font-normal leading-normal">
                            <LatexText text={article.abstract} />
                          </div>
                        )}
                      </td>

                      {/* Journal Name */}
                      <td className="px-3 py-3.5 max-w-[200px]">
                        {journalName ? (
                          <div
                            onClick={(e) => handleJournalClick(e, journalId)}
                            className="text-xs font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                            title={journalName}
                          >
                            {journalName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Publication Year */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {article.publication_year || '—'}
                        </span>
                      </td>

                      {/* DOI */}
                      <td className="px-3 py-3.5 max-w-[150px]">
                        {article.doi ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[110px]" title={article.doi}>
                              {article.doi}
                            </span>
                            <button
                              type="button"
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors border-0 bg-transparent cursor-pointer inline-flex items-center shrink-0"
                              onClick={(e) => handleCopyDoi(e, article.doi)}
                              title={isCopied ? "Copied DOI!" : "Copy DOI"}
                              aria-label="Copy DOI"
                            >
                              <Icon icon={isCopied ? "lucide:check" : "lucide:copy"} width={13} className={isCopied ? "text-success" : ""} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Topic Badge */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {renderTopicBadge(topicName)}
                      </td>

                      {/* Open Access */}
                      <td className="px-3 py-3.5 text-center whitespace-nowrap">
                        {article.is_open_access ? (
                          <Badge variant="success" className="gap-1 text-[11px] font-bold px-2 py-0.5">
                            <span className="size-1.5 rounded-full bg-success" />
                            OA
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
                            Closed
                          </Badge>
                        )}
                      </td>

                      {/* Action: Details */}
                      <td className="px-4 py-3.5 text-end whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary group-hover:text-primary-hover font-semibold gap-1 h-8 px-2"
                        >
                          <span>{t("article.chiTiet1", "Details")}</span>
                          <Icon icon="lucide:arrow-right" width={13} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden divide-y divide-border/60">
            {articles.map((article, index) => {
              const globalIndex = (page - 1) * 10 + index + 1;
              const topicName = article.topic_name || article.primary_topic_name || article.primary_topic;

              return (
                <div
                  key={article.article_id || index}
                  onClick={() => onDetailClick?.(article.article_id)}
                  className="p-4 cursor-pointer hover:bg-surface-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-muted-foreground text-xs font-mono">#{globalIndex}</span>
                    <div className="flex items-center gap-1.5">
                      {topicName && (
                        <Badge variant="secondary" className="text-[11px] font-semibold max-w-[150px] truncate">
                          {topicName}
                        </Badge>
                      )}
                      {article.is_open_access ? (
                        <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0.5">
                          OA
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0.5">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h4 className="text-foreground font-bold text-sm mb-1.5 line-clamp-2 leading-snug">
                    <LatexText text={article.title} />
                  </h4>

                  {article.abstract && (
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">
                      <LatexText text={article.abstract} />
                    </p>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {article.journal_name || article.journal?.display_name || '—'}
                      </div>
                      <div className="text-muted-foreground text-[11px] font-mono mt-0.5">
                        {article.publication_year ? `Year ${article.publication_year}` : ''} {article.doi ? `· ${article.doi}` : ''}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary shrink-0">
                      <span>{t("article.chiTiet1", "Details")}</span>
                      <Icon icon="lucide:arrow-right" width={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integrated Card Footer Pagination */}
          {total > 0 && totalPages > 1 && (
            <div className="border-t border-border bg-surface-muted/20">
              <Pagination
                totalItems={total}
                currentPage={page}
                limit={10}
                onPageChange={onPageChange}
                entityName="articles"
                className="border-0 bg-transparent py-3 px-4"
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
