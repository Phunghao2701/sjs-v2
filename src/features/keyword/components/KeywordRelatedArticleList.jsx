import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { Badge } from '../../../shared/ui/badge';
import { Skeleton } from '../../../shared/ui/skeleton';

const KeywordRelatedArticleList = ({
  articles = [],
  loading = false
}) => {
  const { t } = useTranslation();
  const [copiedDoi, setCopiedDoi] = useState(null);

  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-surface space-y-2.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3.5 w-12 rounded" />
            </div>
            <Skeleton className="h-5 w-4/5 rounded" />
            <Skeleton className="h-3.5 w-3/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-border bg-surface-muted/20 text-muted-foreground">
        <Icon icon="lucide:file-search" width={36} className="mx-auto mb-2 opacity-40" />
        <p className="m-0 text-xs font-medium">
          {t("keyword.khongCoBaiBaoNaoLienQuanDenCac", "No articles found matching monitored keywords yet.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, idx) => {
        const pubYear = article.publication_year || article.year;
        const isCopied = copiedDoi === article.doi;
        const cleanDoi = article.doi ? article.doi.replace(/^https?:\/\/doi\.org\//, '') : '';

        return (
          <div
            key={article.id || article.article_id || idx}
            className="p-4 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-xs transition-all space-y-2.5"
          >
            {/* Header row: Journal & Year & Matched Keywords */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {article.journal_name ? (
                  <span className="font-semibold text-primary inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-subtle text-[11px]">
                    <Icon icon="lucide:book-marked" width={13} />
                    <span className="truncate max-w-[260px]">{article.journal_name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[11px] font-medium">
                    {t("author.tapChiKhoaHoc", "Scientific Publication")}
                  </span>
                )}
                {pubYear && (
                  <span className="text-muted-foreground text-[11px] font-mono font-medium">
                    • {pubYear}
                  </span>
                )}
              </div>

              {/* Matched keywords */}
              {Array.isArray(article.matched_keywords) && article.matched_keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {article.matched_keywords.map((kw, kwIdx) => (
                    <Badge
                      key={kwIdx}
                      variant="outline"
                      className="text-[10px] gap-1 py-0.5 font-medium border-primary/30 text-primary bg-primary/5"
                    >
                      <Icon icon="lucide:sparkles" width={10} />
                      <span>{kw}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <Link
              to={`/articles/${article.id || article.article_id}/visual`}
              className="group block no-underline"
            >
              <h4 className="m-0 text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                <LatexText text={article.title} />
              </h4>
            </Link>

            {/* Abstract preview if available */}
            {article.abstract && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed m-0">
                <LatexText text={article.abstract} />
              </p>
            )}

            {/* Footer: DOI with copy button, Citations, and Details Action */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                {article.doi && (
                  <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                    <span className="text-muted-foreground">DOI:</span>
                    <span className="truncate max-w-[220px]" title={article.doi}>
                      {cleanDoi}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyDoi(e, article.doi)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer inline-flex items-center shrink-0"
                      title={isCopied ? "Copied!" : "Copy DOI"}
                      aria-label="Copy DOI"
                    >
                      <Icon
                        icon={isCopied ? "lucide:check" : "lucide:copy"}
                        width={12}
                        className={isCopied ? "text-success" : ""}
                      />
                    </button>
                  </div>
                )}

                {article.citations != null && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                    <Icon icon="lucide:quote" width={11} className="text-muted-foreground" />
                    <span>{article.citations} citations</span>
                  </span>
                )}
              </div>

              <Link
                to={`/articles/${article.id || article.article_id}/visual`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover no-underline shrink-0"
              >
                <span>{t("article.xemChiTiet", "View Analysis")}</span>
                <Icon icon="lucide:arrow-right" width={13} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KeywordRelatedArticleList;
