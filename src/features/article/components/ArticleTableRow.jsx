import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

export default function ArticleTableRow({
  article,
  index,
  onDetailClick
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Helper to assign topic semantic badge from Design System
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
      <Badge variant={variant} className="text-[11px] font-semibold max-w-[150px] truncate" title={topic}>
        {topic}
      </Badge>
    );
  };

  // Copy DOI link to clipboard
  const handleCopyDoi = (e, doi) => {
    e.stopPropagation();
    if (!doi) return;
    navigator.clipboard.writeText(doi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJournalClick = (e, journalId) => {
    e.stopPropagation();
    if (journalId) {
      navigate(`/journals/${journalId}`);
    }
  };

  const journalId = article.journal_id || article.journal?.journal_id;
  const journalName = article.journal_name || article.journal?.display_name;

  return (
    <tr
      onClick={() => onDetailClick(article.article_id)}
      className="cursor-pointer transition-colors hover:bg-primary-subtle/30 group text-start"
    >
      {/* Index */}
      <td className="px-3 py-3.5 text-center text-xs font-mono text-muted-foreground w-10">
        {index + 1}
      </td>

      {/* Article Title & Abstract */}
      <td className="px-4 py-3.5 max-w-md">
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
      <td className="px-3 py-3.5 max-w-[170px]">
        {article.doi ? (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[125px]" title={article.doi}>
              {article.doi}
            </span>
            <button
              type="button"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors border-0 bg-transparent cursor-pointer inline-flex items-center"
              onClick={(e) => handleCopyDoi(e, article.doi)}
              title={copied ? "Copied DOI!" : "Copy DOI"}
              aria-label="Copy DOI"
            >
              <Icon icon={copied ? "lucide:check" : "lucide:copy"} width="13" className={copied ? "text-success" : ""} />
            </button>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>

      {/* Topic Badge */}
      <td className="px-3 py-3.5 whitespace-nowrap">
        {renderTopicBadge(article.primary_topic)}
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
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onDetailClick(article.article_id)}
          className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary-hover hover:bg-primary-subtle gap-1"
        >
          <span>{t("article.chiTiet1", "Details")}</span>
          <Icon icon="lucide:arrow-right" width={13} />
        </Button>
      </td>
    </tr>
  );
}
