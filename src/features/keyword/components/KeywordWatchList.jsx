import { useTranslation } from "react-i18next";
import Icon from '../../../shared/components/Icon';
import { Badge } from '../../../shared/ui/badge';
import KeywordChip from './KeywordChip';
import KeywordRelatedArticleList from './KeywordRelatedArticleList';

const KeywordWatchList = ({
  watchedKeywords = [],
  articles = [],
  loading = false,
  onManageClick
}) => {
  const { t } = useTranslation();
  const keywordCount = Array.isArray(watchedKeywords) ? watchedKeywords.length : 0;
  const articleCount = Array.isArray(articles) ? articles.length : 0;

  return (
    <div className="space-y-6">
      {/* Monitored Keywords Section */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:star" width={16} className="text-amber-500 fill-amber-500 shrink-0" />
            <h4 className="text-sm font-bold text-foreground m-0">
              {t("keyword.keywordsDangTheoDoi", "Monitored Keywords")}
            </h4>
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
              {keywordCount}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-2 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-28 rounded-lg bg-surface-muted/60 animate-pulse" />
            ))}
          </div>
        ) : keywordCount > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {watchedKeywords.map((kw, idx) => {
              const label = typeof kw === 'string' ? kw : kw.keyword || kw.name;
              return (
                <KeywordChip
                  key={idx}
                  keyword={label}
                  icon={<Icon icon="lucide:star" width={12} className="fill-amber-500" />}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border text-muted-foreground text-xs">
            {t("keyword.banChuaTheoDoiKeywordNaoTrongP", "No keywords are currently monitored in this project.")}
          </div>
        )}
      </div>

      {/* Watched Keywords Articles Section */}
      <div className="pt-2 border-t border-border/70">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:newspaper" width={16} className="text-primary shrink-0" />
            <h4 className="text-sm font-bold text-foreground m-0">
              {t("keyword.baiBaoMoiNhatTheoKeywordDangWa", "Latest articles for watched keywords")}
            </h4>
            {articleCount > 0 && (
              <Badge variant="outline" className="text-xs font-semibold">
                {articleCount}
              </Badge>
            )}
          </div>
        </div>

        <KeywordRelatedArticleList articles={articles} loading={loading} />
      </div>
    </div>
  );
};

export default KeywordWatchList;
