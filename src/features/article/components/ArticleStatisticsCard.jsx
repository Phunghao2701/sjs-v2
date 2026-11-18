import { useTranslation } from "react-i18next";
import { Card } from '../../../shared/ui/card';
import { Icon } from '@iconify/react';

export default function ArticleStatisticsCard({ article }) {
  const { t } = useTranslation();
  if (!article) return null;

  const safeValue = (value) =>
    value !== undefined && value !== null && String(value).trim() !== '' ? value : '—';

  const citations = article.citations ?? article.citations_count ?? '—';
  const publicationYear = safeValue(article.publication_year);
  const volume = safeValue(article.volume_number || article.volume);
  const issue = safeValue(article.issue_number || article.issue);
  const pages = safeValue(article.pages);
  const doi = safeValue(article.doi);

  const metricCards = [
    {
      label: t("admin.namXuatBan", "Năm xuất bản"),
      value: publicationYear,
      icon: 'lucide:calendar',
    },
    {
      label: t("article.tapVolume", "Tập"),
      value: volume,
      icon: 'lucide:book',
    },
    {
      label: t("article.soIssue", "Số"),
      value: issue,
      icon: 'lucide:bookmark',
    },
  ];

  return (
    <Card className="p-4 mb-4 border border-border bg-surface rounded-card shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="lucide:bar-chart-2" className="text-primary h-5 w-5" />
        <h3 className="text-sm font-semibold text-foreground m-0">
          {t("article.thongKeBaiBao", "Thống kê bài báo")}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-center p-3 rounded-lg border border-border bg-surface-muted/50">
          <div className="text-muted-foreground text-xs font-semibold mb-1 uppercase tracking-wider">
            {t("article.soLuotTrichDanCitations", "Số lượt trích dẫn")}
          </div>
          <div className="flex items-center justify-center text-foreground gap-1.5 text-2xl font-bold">
            <Icon icon="lucide:quote" />
            <span>{citations}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="p-2.5 rounded-lg border border-border bg-surface flex flex-col justify-center"
            >
              <div className="text-muted-foreground text-xs font-semibold uppercase">
                {metric.label}
              </div>
              <div className="font-bold mt-1 text-xs flex items-center gap-1.5 text-foreground">
                <Icon icon={metric.icon} className="text-primary" />
                <span>{metric.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 mt-1 space-y-2">
          <div className="flex justify-between items-start text-xs gap-3">
            <span className="text-muted-foreground">DOI:</span>
            <span className="text-foreground font-semibold text-right break-all">{doi}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t("article.soTrangPages", "Số trang")}</span>
            <span className="text-foreground font-semibold">{pages}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
