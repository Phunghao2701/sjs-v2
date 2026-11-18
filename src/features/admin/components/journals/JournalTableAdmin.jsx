import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../shared/ui/table';
import { Button } from '../../../../shared/ui/button';
import { StateCard } from '../../../../shared/components/Card';

/**
 * Component JournalTableAdmin - Bảng hiển thị danh sách tạp chí phục vụ mục đích quản trị.
 *
 * @param {Array} journals - Danh sách tạp chí sau khi đã qua bộ lọc search/status
 */
export default function JournalTableAdmin({
  journals
}) {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();

  if (!journals || journals.length === 0) {
    return <StateCard variant="neutral" icon="lucide:search-x" title={t("admin.khongTimThayTapChiNao")} description={t("admin.hayThuThayDoiTuKhoaTimKiemHoac")} className="my-4 border-dashed" />;
  }

  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface shadow-2xs">
      <Table className="w-full text-left">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="py-3.5 pl-4 text-xs font-semibold text-muted-foreground uppercase">JOURNAL TITLE & CATEGORY</TableHead>
            <TableHead className="py-3.5 text-xs font-semibold text-muted-foreground uppercase">ISSN</TableHead>
            <TableHead className="py-3.5 text-xs font-semibold text-muted-foreground uppercase">PUBLISHER</TableHead>
            <TableHead className="py-3.5 text-xs font-semibold text-muted-foreground uppercase">LAST UPDATED</TableHead>
            <TableHead className="py-3.5 text-xs font-semibold text-muted-foreground uppercase">STATUS</TableHead>
            <TableHead className="py-3.5 pr-4 text-right text-xs font-semibold text-muted-foreground uppercase w-[120px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {journals.map(journal => {
            const id = journal.id || journal.journal_id;
            return (
              <TableRow
                key={id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate(`${basePath}/journals/repository`)}
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`${basePath}/journals/repository`);
                  }
                }}
              >
                <TableCell className="py-3 pl-4">
                  <button
                    type="button"
                    className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 p-0 text-left border-0 bg-transparent cursor-pointer"
                    onClick={event => {
                      event.stopPropagation();
                      navigate(`${basePath}/journals/repository`);
                    }}
                  >
                    {journal.title || journal.display_name}
                  </button>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {journal.subjectCategory || 'General Category'} • Quarterly
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs text-foreground">
                  {journal.issn || '—'}
                </TableCell>

                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0" aria-hidden="true">
                      <Icon icon="lucide:building-2" width="15" />
                    </div>
                    <span className="text-foreground font-semibold text-sm">{journal.publisher || t("admin.chuaChiDinh")}</span>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground text-xs font-mono">
                  {journal.lastUpdated || '—'}
                </TableCell>

                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-semibold ${
                    journal.status === 'Active' || journal.status === 'Published'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : journal.status === 'Under Review' || journal.status === 'Draft'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {journal.status || 'Draft'}
                  </span>
                </TableCell>

                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      onClick={event => {
                        event.stopPropagation();
                        navigate(`${basePath}/journals/repository`);
                      }}
                      title={t("admin.quanLyRepoVolumeIssue")}
                    >
                      <Icon icon="lucide:eye" width="15" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="size-8 p-0"
                      onClick={event => {
                        event.stopPropagation();
                        navigate(`${basePath}/journals/${id}/edit`);
                      }}
                      title={t("admin.chinhSuaThongTinTapChi")}
                    >
                      <Icon icon="lucide:edit-2" width="15" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
