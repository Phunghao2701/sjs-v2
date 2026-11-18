import { useTranslation } from "react-i18next";
import { Table } from '../../../shared/ui/table';
import { Icon } from '@iconify/react';
import ArticleTableRow from './ArticleTableRow';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { Card } from '../../../shared/ui/card';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Badge } from '../../../shared/ui/badge';

export default function ArticleTable({
  articles = [],
  isLoading = false,
  onDetailClick,
  onClearFilters,
  asCard = true
}) {
  const { t } = useTranslation();

  // Renders a loader with multiple shimmer rows using Design System Skeleton
  const renderSkeletons = () => (
    <tbody>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <tr key={i} className="border-b border-border/60">
          <td className="px-4 py-3.5 text-left">
            <Skeleton className="h-4 w-4/5 rounded mb-2" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </td>
          <td className="px-3 py-3.5 text-left">
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
          <td className="px-4 py-3.5 text-center">
            <Skeleton className="h-5 w-10 rounded-full mx-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  // If loading and there are no items
  if (isLoading && articles.length === 0) {
    const loadingTable = (
      <div className="table-responsive">
        <Table hover className="align-middle mb-0 text-start w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-[12px] text-muted-foreground font-semibold">
              <th className="px-4 py-3 text-left">{t("article.tenBaiBao", "Article Title")}</th>
              <th className="px-3 py-3 text-left">Journal</th>
              <th className="px-3 py-3 text-center">{t("article.nam1", "Year")}</th>
              <th className="px-3 py-3">DOI</th>
              <th className="px-3 py-3">Topic / Field</th>
              <th className="px-4 py-3 text-center">Access</th>
            </tr>
          </thead>
          {renderSkeletons()}
        </Table>
      </div>
    );

    if (!asCard) {
      return loadingTable;
    }

    return (
      <section className="rounded-card border border-border bg-surface shadow-card overflow-hidden">
        {loadingTable}
      </section>
    );
  }

  // If search matches nothing
  if (articles.length === 0) {
    return (
      <StatePanel
        variant="neutral"
        icon={<Icon icon="lucide:file-search" width="36" className="text-muted-foreground" />}
        title={t("article.khongTimThayBaiBaoPhuHop", "No matching articles found")}
        description={t("article.hayThuThayDoiTuKhoaHoacXoaCacB", "Try adjusting your search keywords, clear filters, or browse other topics.")}
        actions={
          onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <Icon icon="lucide:rotate-ccw" width="14" className="mr-1.5" />
              <span>{t("article.xoaBoLoc", "Clear all filters")}</span>
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      {/* 1. TABLE LAYOUT (Desktop & Tablet) */}
      {asCard ? (
        <section className="hidden md:block rounded-card border border-border bg-surface shadow-card overflow-hidden">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-start w-full">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-[12px] text-muted-foreground font-semibold">
                  <th className="px-4 py-3 text-left">{t("article.tenBaiBao", "Article Title")}</th>
                  <th className="px-3 py-3 text-left">Journal</th>
                  <th className="px-3 py-3 text-center">{t("article.nam1", "Year")}</th>
                  <th className="px-3 py-3">DOI</th>
                  <th className="px-3 py-3">Topic / Field</th>
                  <th className="px-4 py-3 text-center">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {articles.map((article, index) => (
                  <ArticleTableRow
                    key={article.article_id}
                    article={article}
                    index={index}
                    onDetailClick={onDetailClick}
                  />
                ))}
              </tbody>
            </Table>
          </div>
        </section>
      ) : (
        <div className="hidden md:block">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-start w-full">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60 text-[12px] text-muted-foreground font-semibold">
                  <th className="px-4 py-3 text-left">{t("article.tenBaiBao", "Article Title")}</th>
                  <th className="px-3 py-3 text-left">Journal</th>
                  <th className="px-3 py-3 text-center">{t("article.nam1", "Year")}</th>
                  <th className="px-3 py-3">DOI</th>
                  <th className="px-3 py-3">Topic / Field</th>
                  <th className="px-4 py-3 text-center">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {articles.map((article, index) => (
                  <ArticleTableRow
                    key={article.article_id}
                    article={article}
                    index={index}
                    onDetailClick={onDetailClick}
                  />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* 2. CARD LAYOUT (Mobile) */}
      <div className={`block md:hidden ${asCard ? 'space-y-3' : 'p-3 space-y-3 bg-surface'}`}>
        {articles.map((article, index) => {
          return (
            <Card
              key={article.article_id}
              onClick={() => onDetailClick(article.article_id)}
              className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-muted-foreground text-xs font-mono">#{index + 1}</span>
                <div className="flex items-center gap-1.5">
                  {article.primary_topic && (
                    <Badge variant="secondary" className="text-[11px] font-semibold max-w-[150px] truncate">
                      {article.primary_topic}
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

              <h6 className="text-foreground font-bold text-sm mb-1.5 line-clamp-2 leading-snug">
                <LatexText text={article.title} />
              </h6>

              {article.abstract && (
                <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">
                  <LatexText text={article.abstract} />
                </p>
              )}

              <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2 text-xs">
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
                  <Icon icon="lucide:arrow-right" width="12" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
