import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import AuthorAvatar from './AuthorAvatar';

export default function AuthorCard({ author }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!author) return null;

  const cleanStr = (val) => String(val ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  const id = author.author_id ?? author.id ?? author.openalex_id;
  const rawName = cleanStr(author.display_name || author.full_name || author.name || '');
  const name = rawName || (author.openalex_id ? `Author ${author.openalex_id}` : (id ? `Author #${id}` : t("typeAuthor")));
  const rawInst1 = cleanStr(author.institution_1 ?? author.last_known_institution ?? author.affiliation ?? author.institution ?? '');
  const rawInst2 = cleanStr(author.institution_2 ?? author.department ?? '');
  const institution1 = rawInst1 && rawInst1 !== '-' ? rawInst1 : '—';
  const institution2 = rawInst2 && rawInst2 !== '-' ? rawInst2 : '';
  const hIndex = author.h_index ?? author.hindex ?? 0;
  const citations = author.citation_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.papers ?? 0;
  const tags = (Array.isArray(author.subject_areas) ? author.subject_areas : author.subject_area ? [author.subject_area] : [])
    .map((tag) => typeof tag === 'string'
      ? tag
      : tag?.name || tag?.display_name || tag?.subject_area || tag?.field || tag?.domain || '')
    .filter(Boolean);
  const avatarUrl = author.url_image || author.avatar_url || '';
  const avatarColor = author.avatar_color ?? '#0071BC';

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toLocaleString('vi-VN');
  };

  const handleCardClick = () => {
    if (id) navigate(`/authors/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="group flex h-full flex-col justify-between p-3 sm:p-3.5 cursor-pointer text-left transition-colors border border-border bg-surface hover:border-primary/50 hover:bg-surface-muted/30 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
      >
        <div>
          {/* Header row: avatar + info */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <AuthorAvatar
              name={name}
              url={avatarUrl}
              size="sm"
              bgColor={avatarColor}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="m-0 truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                {name}
              </h3>
              <span className="block truncate text-[11px] text-muted-foreground mt-0.5" title={institution1}>
                {institution1}
              </span>
              {institution2 && (
                <span className="block truncate text-[11px] text-muted-foreground mt-0.5" title={institution2}>
                  {institution2}
                </span>
              )}
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-lg border border-border bg-surface-muted/50 mb-2.5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                H-index
              </div>
              <div className="mt-0.5 text-xs font-bold text-foreground tabular-nums">
                {hIndex}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("author.trichDan")}
              </div>
              <div className="mt-0.5 text-xs font-bold text-foreground tabular-nums">
                {formatLocalNumber(citations)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("articles")}
              </div>
              <div className="mt-0.5 text-xs font-bold text-foreground tabular-nums">
                {formatLocalNumber(articlesCount)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer tags */}
        <div className="border-t border-border pt-2">
          <div className="flex flex-wrap gap-1 items-center">
            {tags.length === 0 ? (
              <span className="text-[11px] italic text-muted-foreground">
                {t("author.chuaCapNhatLinhVuc")}
              </span>
            ) : (
              tags.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] py-0.5 px-1.5 font-medium cursor-pointer hover:bg-primary-subtle hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/catalog?search=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                </Badge>
              ))
            )}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] py-0.5 px-1 font-normal text-muted-foreground">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
