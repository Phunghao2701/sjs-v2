import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';

/**
 * Component JournalCardAdmin - Hiển thị thông tin tạp chí dưới dạng thẻ khối độc lập dành cho Admin.
 */
export default function JournalCardAdmin({
  journal
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = journal.id || journal.journal_id;
  const title = journal.title || journal.display_name;
  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';
  const idStr = id ? String(id) : '';
  const cleanId = idStr.replace(/\D/g, '') || '101';
  const displayId = `ID: #${cleanId}`;
  const isPublished = journal.status === 'Active' || journal.status === 'Published';
  const isReview = journal.status === 'Under Review' || journal.status === 'Draft';
  const statusClass = isPublished ? 'admin-status-dot admin-status-dot--accent' : isReview ? 'admin-status-dot admin-status-dot--warning' : 'admin-status-dot admin-status-dot--muted';

  return (
    <div className="w-full h-full">
      <Card
        className="journal-dark-card h-full shadow-2xs border border-border transition-colors admin-clickable-card flex flex-col p-4 text-left cursor-pointer"
        onClick={() => navigate(`${basePath}/journals/repository`)}
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(`${basePath}/journals/repository`);
          }
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted-foreground text-xs font-semibold font-mono">{displayId}</span>
          <span className="bg-foreground text-background px-2.5 py-1 uppercase text-xs font-bold rounded">
            {journal.subjectCategory || 'General'}
          </span>
        </div>

        <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2 text-base">
          {title}
        </h3>
        <div className="text-muted-foreground font-mono text-xs mb-3">
          ISSN: {journal.issn || '—'}
        </div>

        <div className="bg-muted/40 p-3 rounded-lg mb-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="border-r border-b border-border pb-1.5 pr-2">
              <span className="text-muted-foreground text-xs block uppercase font-semibold">Publisher</span>
              <span className="text-foreground font-bold truncate block">{journal.publisher || 'Trending System'}</span>
            </div>
            <div className="border-b border-border pb-1.5 pl-2">
              <span className="text-muted-foreground text-xs block uppercase font-semibold">Type</span>
              <span className="text-foreground font-bold block">{journal.type || 'Journal'}</span>
            </div>
            <div className="border-r border-border pt-1.5 pr-2">
              <span className="text-muted-foreground text-xs block uppercase font-semibold">Coverage</span>
              <span className="text-foreground font-bold block">{journal.coverage || '1980-2026'}</span>
            </div>
            <div className="pt-1.5 pl-2">
              <span className="text-muted-foreground text-xs block uppercase font-semibold">Region</span>
              <span className="text-foreground font-bold truncate block">{journal.country || 'Vietnam'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs py-1 px-2.5 rounded-full font-medium">
            OPEN ACCESS
          </span>
          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 text-xs py-1 px-2.5 rounded-full font-medium">
            DIAMOND OA
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-muted/30 p-2.5 rounded-lg mb-4 mt-auto border border-border/50">
          <div className="size-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground shrink-0" aria-hidden="true">
            <Icon icon="lucide:building-2" width="16" />
          </div>
          <div className="truncate">
            <span className="font-bold text-foreground block truncate text-sm">
              {journal.publisher || t("admin.chuaChiDinh")}
            </span>
            <span className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider">
              Publisher
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border w-full">
          <div className="flex items-center gap-1.5">
            <span className={statusClass} />
            <span className="font-bold uppercase text-foreground text-xs">
              {journal.status || 'Draft'}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8"
              onClick={event => {
                event.stopPropagation();
                navigate(`${basePath}/journals/repository`);
              }}
              title="View repository log"
            >
              <Icon icon="lucide:eye" width="14" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-2 h-8 w-8"
              onClick={event => {
                event.stopPropagation();
                navigate(`${basePath}/journals/${id}/edit`);
              }}
              title="Edit configurations"
            >
              <Icon icon="lucide:edit-2" width="14" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
