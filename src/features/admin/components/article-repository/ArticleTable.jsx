import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import StatusBadge from '../shared/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../shared/ui/table';
import { Button } from '../../../../shared/ui/button';

export default function ArticleTable({
  items = [],
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  asCard = true
}) {
  const navigate = useNavigate();

  const handleEdit = (articleId) => {
    navigate(`/admin/articles/${articleId}`);
  };

  if (!items || items.length === 0) {
    return (
      <div className={asCard ? "text-center py-8 border border-border rounded-lg bg-surface m-4" : "text-center py-8 bg-surface"}>
        <Icon icon="lucide:file-x" width="48" className="text-muted-foreground mx-auto mb-2 opacity-50" />
        <h6 className="text-foreground font-bold text-base">No Manuscripts Found</h6>
        <p className="text-muted-foreground text-xs mb-0">No articles match the selected filters or search query.</p>
      </div>
    );
  }

  return (
    <div className={asCard ? "border border-border rounded-lg overflow-hidden bg-surface shadow-2xs" : "table-responsive"}>
      <Table className="w-full text-left">
        <TableHeader className="bg-surface-muted/60">
          <TableRow>
            <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase w-[40%]">
              Article Details
            </TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[18%]">
              Lead Author
            </TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[18%]">
              Journal
            </TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[10%]">
              Status
            </TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[10%]">
              Submitted
            </TableHead>
            <TableHead className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase w-[60px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
              {/* Article Details: title + meta */}
              <TableCell className="py-3 px-4">
                <button
                  type="button"
                  onClick={() => handleEdit(item.id)}
                  className="font-bold text-foreground hover:text-primary transition-colors text-left text-sm line-clamp-2 border-0 bg-transparent cursor-pointer p-0 block"
                >
                  {item.title}
                </button>
                <div className="text-muted-foreground text-xs font-mono mt-1 flex items-center gap-2">
                  <span>{item.msId}</span>
                  <span>&middot;</span>
                  <span>{item.pages} Pages</span>
                  <span>&middot;</span>
                  <span>{item.citations} Citations</span>
                </div>
              </TableCell>

              {/* Lead Author */}
              <TableCell className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <img
                    src={item.leadAuthorAvatar}
                    alt={item.leadAuthor}
                    className="size-7 rounded-full object-cover shrink-0 border border-border"
                  />
                  <span className="text-foreground font-semibold text-xs truncate max-w-[140px]" title={item.leadAuthor}>
                    {item.leadAuthor}
                  </span>
                </div>
              </TableCell>

              {/* Journal */}
              <TableCell className="py-3 px-3">
                <span className="text-foreground text-xs line-clamp-1" title={item.journal}>
                  {item.journal}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell className="py-3 px-3">
                <StatusBadge status={item.status} />
              </TableCell>

              {/* Submitted Date */}
              <TableCell className="py-3 px-3 text-muted-foreground text-xs font-mono">
                {item.submittedDate}
              </TableCell>

              {/* Actions */}
              <TableCell className="py-3 px-4 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => handleEdit(item.id)}
                  title={`Edit ${item.title}`}
                  aria-label={`Edit ${item.title}`}
                >
                  <Icon icon="lucide:pencil" width={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
