import { useTranslation } from "react-i18next";
import { Col } from '../../../shared/ui/layout-grid';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

export default function JournalCardAdmin({ journal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!journal) return null;

  const id = journal.id || journal.journal_id;
  const title = journal.title || journal.display_name;
  const isActive = journal.status === 'Active' || journal.status === 'Published';

  return (
    <Col xs={12} sm={6} lg={4}>
      <Card className="flex h-full flex-col justify-between p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card">
        <div>
          {/* Header row: category and status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant="outline" className="text-xs uppercase font-semibold">
              {journal.subjectCategory || 'General'}
            </Badge>
            <Badge variant={isActive ? 'success' : 'warning'} className="text-xs">
              {journal.status || 'Draft'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="m-0 mb-1 text-base font-semibold leading-snug text-foreground line-clamp-2">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 truncate">
            <Icon icon="lucide:building" width="14" className="shrink-0" aria-hidden="true" />
            <span className="truncate">{journal.publisher || t("journal.chuaCoNhaXuatBan")}</span>
          </div>

          {/* Metadata box */}
          <div className="p-2.5 rounded-control border border-border bg-surface-muted/50 mb-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("journal.maSoIssn")}</span>
              <span className="font-semibold text-foreground font-mono">{journal.issn || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("journal.tongBienTap")}</span>
              <span className="font-semibold text-foreground truncate max-w-[150px]" title={journal.editorInChief}>
                {journal.editorInChief || t("admin.chuaChiDinh")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigate('/admin/journals/repository')}
          >
            <Icon icon="lucide:layers" width="14" aria-hidden="true" />
            <span>{t("journal.khoDuLieu")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigate(`/admin/journals/${id}/edit`)}
          >
            <Icon icon="lucide:edit-3" width="14" aria-hidden="true" />
            <span>{t("journal.suaDoi")}</span>
          </Button>
        </div>
      </Card>
    </Col>
  );
}
