import { useTranslation } from "react-i18next";
import { Card } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';

export default function ArticlesTabContent({
  recentArticles = [],
  loading,
  onArticleClick
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <section key={i} className="journal-surface p-4 rounded-card border border-border bg-surface space-y-2.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-4/5 rounded mb-1" />
            <Skeleton className="h-4 w-48 rounded mb-2" />
            <Skeleton className="h-14 w-full rounded" />
          </section>
        ))}
      </div>
    );
  }

  if (!recentArticles || recentArticles.length === 0) {
    return (
      <StatePanel
        variant="neutral"
        icon={<Icon icon="lucide:book-open" width="32" className="text-muted-foreground" />}
        title={t("journal.journalNayChuaCoBaiBaoGanDay")}
        description={t("article.chuaCoThongTinJournal", "Hiện chưa có danh sách bài báo xuất bản gần đây.")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 text-start">
      {recentArticles.map((article, index) => {
        const articleId = article.article_id || article.id || article.articleId;
        const hasArticleId = articleId !== undefined && articleId !== null && String(articleId).trim() !== '';
        const handleArticleOpen = () => {
          if (hasArticleId && onArticleClick) onArticleClick(articleId);
        };

        return (
          <Card
            key={articleId || `${article.title || 'article'}-${index}`}
            className="journal-article-card rounded-card border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2 flex-wrap text-xs text-muted-foreground">
              <span>
                {article.publication_year || article.year || 'N/A'}
              </span>
              {article.doi && (
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:link-2" width="14" />
                  DOI: {article.doi}
                </span>
              )}
            </div>

            <h3
              className={`journal-article-title text-base font-semibold text-foreground mb-2 leading-snug ${
                hasArticleId ? 'cursor-pointer hover:text-primary transition-colors' : 'text-muted-foreground'
              }`}
              onClick={handleArticleOpen}
              role={hasArticleId ? 'button' : undefined}
              title={hasArticleId ? t("article.xemChiTietBaiBao") : t("journal.baiBaoNayChuaCoMaDinhDanh")}
            >
              <LatexText text={article.title || 'Untitled Article'} />
            </h3>

            {article.authors && (
              <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
                <Icon icon="lucide:users" width="15" className="text-muted-foreground shrink-0" />
                <span className="truncate">
                  {Array.isArray(article.authors)
                    ? article.authors.map((author) => author.display_name || author.name || author.author_name).filter(Boolean).join(', ')
                    : article.authors}
                </span>
              </div>
            )}

            {article.abstract && (
              <p className="journal-article-abstract text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                <LatexText text={article.abstract} />
              </p>
            )}

            <div className="mt-auto flex justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasArticleId}
                onClick={handleArticleOpen}
              >
                <span>{t("journal.xemChiTiet")}</span>
                <Icon icon="lucide:arrow-right" width="14" className="ml-1.5" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
