import { useTranslation } from "react-i18next";
import { Table } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

export default function JournalTable({
  journals = [],
  followedJournals = {},
  onFollow,
  asCard = true
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderAccessBadge = (journal) => {
    if (journal.is_open_access) {
      return (
        <Badge variant="success" className="gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold">
          <span className="size-1.5 rounded-full bg-success" />
          Open Access
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="px-2.5 py-0.5 text-[11px] font-medium">
        Subscription
      </Badge>
    );
  };

  const renderQuartileBadge = (quartile = '') => {
    if (!quartile) return <span className="text-muted-foreground text-xs">—</span>;
    const q = String(quartile).trim().toUpperCase();
    if (q === 'Q1') {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md text-xs font-extrabold bg-success-subtle text-success border border-success/20 shadow-2xs">
          Q1
        </span>
      );
    }
    if (q === 'Q2') {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md text-xs font-extrabold bg-primary-subtle text-primary border border-primary/20 shadow-2xs">
          Q2
        </span>
      );
    }
    if (q === 'Q3') {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md text-xs font-extrabold bg-warning-subtle text-warning border border-warning/20 shadow-2xs">
          Q3
        </span>
      );
    }
    if (q === 'Q4') {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md text-xs font-extrabold bg-surface-muted text-muted-foreground border border-border shadow-2xs">
          Q4
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md text-xs font-bold bg-surface-muted text-muted-foreground border border-border">
        {quartile}
      </span>
    );
  };

  const tableContent = (
    <div className="table-responsive">
      <Table hover className="catalog-table align-middle mb-0 text-start w-full">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-xs text-muted-foreground uppercase font-bold tracking-wider">
              <th className="px-4 py-3 text-start">Journal & ISSN</th>
              <th className="px-3 py-3 text-start">Publisher & Region</th>
              <th className="px-3 py-3 text-center">Quartile</th>
              <th className="px-3 py-3 text-center">SJR Metric</th>
              <th className="px-3 py-3 text-center">Access</th>
              <th className="px-4 py-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {journals.map((journal) => {
              const id = journal.id || journal.journal_id;
              const isFollowed = !!followedJournals[id];
              return (
                <tr
                  key={id}
                  onClick={() => navigate(`/journals/${id}`)}
                  className="cursor-pointer transition-colors hover:bg-primary-subtle/20 group"
                >
                  {/* Journal Name & ISSN */}
                  <td className="px-4 py-3.5 max-w-sm">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2 leading-snug">
                      {journal.display_name}
                    </div>
                    {journal.issn ? (
                      <div className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center gap-1.5">
                        <span className="uppercase text-[10px] font-semibold text-muted-foreground/80">ISSN:</span>
                        <span className="font-medium text-foreground/80">{journal.issn}</span>
                      </div>
                    ) : null}
                  </td>

                  {/* Publisher & Country */}
                  <td className="px-3 py-3.5">
                    <div className="text-xs font-medium text-foreground truncate max-w-[220px]" title={journal.publisher}>
                      {journal.publisher || '—'}
                    </div>
                    {journal.country ? (
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Icon icon="lucide:globe" width="12" className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px]">{journal.country}</span>
                      </div>
                    ) : null}
                  </td>

                  {/* Quartile Badge */}
                  <td className="px-3 py-3.5 text-center whitespace-nowrap">
                    {renderQuartileBadge(journal.quartile)}
                  </td>

                  {/* Metric Value & Year */}
                  <td className="px-3 py-3.5 text-center whitespace-nowrap">
                    <div className="font-mono text-xs font-bold text-foreground">
                      {journal.metric_value ? Number(journal.metric_value).toFixed(2) : '—'}
                    </div>
                    {journal.metric_year ? (
                      <div className="text-[10px] text-muted-foreground">
                        {journal.metric_year}
                      </div>
                    ) : null}
                  </td>

                  {/* Access Type Badge */}
                  <td className="px-3 py-3.5 text-center whitespace-nowrap">
                    {renderAccessBadge(journal)}
                  </td>

                  {/* Follow Action Button */}
                  <td className="px-4 py-3.5 text-end whitespace-nowrap">
                    <Button
                      type="button"
                      size="sm"
                      variant={isFollowed ? "secondary" : "outline"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onFollow(id);
                      }}
                      className="h-8 px-2.5 text-xs gap-1.5"
                      title={isFollowed ? 'Unfollow journal' : 'Follow journal'}
                    >
                      <Icon icon={isFollowed ? 'lucide:check' : 'lucide:plus'} width="13" />
                      <span>{isFollowed ? t("catalog.daTheoDoi", "Following") : t("catalog.theoDoi", "Follow")}</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );

  if (!asCard) {
    return tableContent;
  }

  return (
    <section className="catalog-table-card rounded-card border border-border bg-surface shadow-card overflow-hidden">
      {tableContent}
    </section>
  );
}
