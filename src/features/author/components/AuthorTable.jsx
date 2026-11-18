import { useTranslation } from "react-i18next";
import { Table, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import AuthorTableRow from './AuthorTableRow';
import AuthorCard from './AuthorCard';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';

export default function AuthorTable({
  authors = [],
  loading = false,
  error = null,
  onRetry = null,
  startIndex = 1
}) {
  const { t } = useTranslation();

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
        icon={<Icon icon="lucide:search-slash" width="32" className="text-muted-foreground" />}
        title={t("author.khongTimThayTacGiaPhuHop")}
        description={t("author.hayThuThayDoiTuKhoaTimKiemHoac")}
      />
    );
  }

  return (
    <div>
      <div className="author-table-shell d-none d-md-block rounded-card border border-border bg-surface shadow-sm overflow-hidden">
        <Table hover responsive className="author-table m-0 align-middle">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <th className="author-table-index-col text-center py-3">#</th>
              <th className="py-3">{t("typeAuthor")}</th>
              <th className="py-3">{t("author.toChuc")}</th>
              <th className="py-3">{t("publications")}</th>
              <th className="py-3">Citations</th>
              <th className="py-3">H-index</th>
              <th className="author-table-action-col py-3">{t("article.chiTiet1")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="text-center">
                    <Skeleton className="h-4 w-5 mx-auto rounded" />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3.5 w-28 rounded" />
                        <Skeleton className="h-2.5 w-20 rounded" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-36 rounded" />
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-10 rounded" />
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-12 rounded" />
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-8 rounded" />
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-14 rounded" />
                  </td>
                </tr>
              ))
            ) : (
              authors.filter(Boolean).map((author, idx) => (
                <AuthorTableRow
                  key={author.author_id ?? author.id ?? idx}
                  author={author}
                  index={startIndex + idx}
                />
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="d-block d-md-none">
        {loading ? (
          <Row className="g-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Col xs={12} key={idx}>
                <div className="p-4 rounded-card border border-border bg-surface space-y-3">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/5 rounded" />
                      <Skeleton className="h-3 w-2/5 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="g-3">
            {authors.filter(Boolean).map((author, idx) => (
              <Col xs={12} key={author.author_id ?? author.id ?? idx}>
                <AuthorCard author={author} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
