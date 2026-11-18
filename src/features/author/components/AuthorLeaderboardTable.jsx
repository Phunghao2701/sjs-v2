import { useTranslation } from "react-i18next";
import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import AuthorAvatar from './AuthorAvatar';
import AuthorRankBadge from './AuthorRankBadge';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';

export default function AuthorLeaderboardTable({
  authors = [],
  loading = false,
  error = null,
  onRetry = null,
  limit = null
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (error) {
    return (
      <StatePanel
        variant="error"
        icon={<Icon icon="lucide:wifi-off" width="32" className="text-danger" />}
        title={t("article.loiTaiDuLieu", "Lỗi tải dữ liệu")}
        description={error}
        actions={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {t("article.thuLai", "Thử lại")}
            </Button>
          )
        }
      />
    );
  }

  if (!loading && authors.length === 0) {
    return (
      <StatePanel
        variant="neutral"
        icon={<Icon icon="lucide:trophy" width="32" className="text-muted-foreground" />}
        title={t("author.chuaCoDuLieuBangXepHang")}
        description={t("author.duLieuXepHangSeHienThiODay")}
      />
    );
  }

  const displayList = limit ? authors.slice(0, limit) : authors;

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAuthorClick = (author) => {
    const id = author.author_id ?? author.id;
    if (id) navigate(`/authors/${id}`);
  };

  return (
    <div className="author-leaderboard-table-shell rounded-card border border-border bg-surface shadow-sm overflow-hidden">
      <Table hover responsive className="author-leaderboard-table m-0 align-middle">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
            <th className="author-leaderboard-rank-col text-center py-3">{t("author.thuHang")}</th>
            <th className="py-3">{t("typeAuthor")}</th>
            <th className="py-3">{t("author.linhVucChinh")}</th>
            <th className="py-3">{t("articles")}</th>
            <th className="py-3">Citations</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: limit || 5 }).map((_, idx) => (
              <tr key={idx} className="border-b border-border">
                <td className="text-center py-3">
                  <Skeleton className="h-7 w-7 rounded-full mx-auto" />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                </td>
                <td className="py-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </td>
                <td className="py-3">
                  <Skeleton className="h-3.5 w-12 rounded" />
                </td>
                <td className="py-3">
                  <Skeleton className="h-3.5 w-16 rounded" />
                </td>
              </tr>
            ))
          ) : (
            displayList.filter(Boolean).map((author, idx) => {
              const id = author.author_id ?? author.id;
              const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown';
              const orcid = author.orcid ?? '';
              const field = author.subject_area ?? author.primary_subject_area ?? author.field ?? author.area ?? '—';
              const articles = author.article_count ?? author.papers ?? author.works_count ?? 0;
              const citations = author.citation_count ?? author.citations ?? author.cited_by_count ?? 0;
              const rank = author.final_rank ?? idx + 1;
              const avatarColor = author.avatar_color ?? (rank === 1 ? '#0071BC' : rank === 2 ? '#6366F1' : rank === 3 ? '#0EA5E9' : '#071A1C');

              return (
                <tr
                  key={id ?? idx}
                  onClick={() => handleAuthorClick(author)}
                  className="author-leaderboard-row cursor-pointer transition-colors hover:bg-surface-muted/50 border-b border-border"
                >
                  <td className="text-center py-3">
                    <div className="flex justify-center">
                      <AuthorRankBadge rank={rank} />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="author-leaderboard-author flex items-center gap-2.5">
                      <AuthorAvatar name={name} size="sm" bgColor={avatarColor} />
                      <div>
                        <div className="author-leaderboard-name font-semibold text-foreground text-sm">
                          {name}
                        </div>
                        {orcid ? (
                          <div className="author-leaderboard-orcid text-xs text-muted-foreground font-mono">
                            {orcid}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {!field || field === '' ? '—' : <span className="author-leaderboard-field-chip">{field}</span>}
                  </td>
                  <td className="author-leaderboard-cell py-3 text-xs font-semibold text-foreground">
                    {formatLocalNumber(articles)}
                  </td>
                  <td className="author-leaderboard-cell author-leaderboard-citations py-3 text-xs font-bold text-primary">
                    ↑ {formatLocalNumber(citations)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
