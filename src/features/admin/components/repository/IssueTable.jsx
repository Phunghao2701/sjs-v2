import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../shared/ui/table';
import { StateCard } from '../../../../shared/components/Card';

const getIssueId = issue => issue.issue_id || issue.id;
const getIssueNumber = issue => issue.issue_number ?? issue.issueNumber ?? '—';
const getIssueYear = issue => issue.publication_year || issue.publicationYear;
const getIssueStatus = issue => issue.is_deleted ? 'Deleted' : issue.status || 'Active';

/**
 * Component IssueTable - Bảng hiển thị các Issue được query theo volume_id.
 * Article count dùng dữ liệu Article đã query theo issue_id ở parent/hook, không dùng mock.
 *
 * @param {Array} issues - Danh sách Issue của Volume đang chọn
 * @param {Object} articleCountsByIssueId - Map số Article theo issue_id
 */
export default function IssueTable({
  issues,
  articleCountsByIssueId = {}
}) {
  const { t: _t } = useTranslation();
  if (!issues || issues.length === 0) {
    return <StateCard variant="neutral" icon="lucide:calendar-dashed" title="No issues found" description="This volume does not have any issues created yet." className="my-4 border-dashed" />;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface shadow-2xs">
      <Table className="w-full text-left">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="py-3 pl-4 text-xs font-semibold text-muted-foreground uppercase w-[240px]">Issue Details</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase">Publication Year</TableHead>
            <TableHead className="py-3 text-xs font-semibold text-muted-foreground uppercase">Articles</TableHead>
            <TableHead className="py-3 pr-4 text-xs font-semibold text-muted-foreground uppercase w-[120px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map(issue => {
            const issueId = getIssueId(issue);
            const issueStatus = getIssueStatus(issue);
            const isPublished = issueStatus === 'Published' || issueStatus === 'Active';
            const articleCount = articleCountsByIssueId[issueId];
            return (
              <TableRow key={issueId} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-3 pl-4">
                  <div className="font-bold text-foreground font-mono text-sm">
                    {getIssueNumber(issue)}
                  </div>
                  <small className="text-muted-foreground text-xs font-display">
                    {issue.issueName || issue.title || `Issue ${getIssueNumber(issue)}`}
                  </small>
                </TableCell>

                <TableCell className="text-muted-foreground text-xs font-display">
                  {getIssueYear(issue) || '—'}
                </TableCell>

                <TableCell className="text-foreground font-medium font-mono text-sm">
                  {typeof articleCount === 'number' ? articleCount : t("admin.chuaCoApiArticleTheoIssueidDaX")}
                </TableCell>

                <TableCell className="pr-4">
                  <span className={`px-2.5 py-1 rounded uppercase text-[10px] font-semibold ${
                    isPublished
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : issueStatus === 'Deleted'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}>
                    {issueStatus}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
