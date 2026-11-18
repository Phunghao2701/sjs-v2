import React from 'react';
import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import AuthorTableRow from './AuthorTableRow';
import AuthorCard from './AuthorCard';
import Pagination from '../../../shared/components/Pagination';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';

export default function AuthorTable({
  authors = [],
  loading = false,
  error = null,
  onRetry = null,
  startIndex = 1,
  currentSort = 'articles',
  onSortChange = null,
  pagination = null,
  asCard = true,
}) {
  const { t } = useTranslation();

  if (error) {
    return (
      <StatePanel
        variant="error"
        icon={<Icon icon="lucide:wifi-off" width="32" className="text-danger" />}
        title={t("article.loiTaiDuLieu", "Error loading data")}
        description={error?.message || String(error)}
        actions={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {t("article.thuLai", "Retry")}
            </Button>
          )
        }
      />
    );
  }

  if (!loading && (!authors || authors.length === 0)) {
    return (
      <StatePanel
        icon={<Icon icon="lucide:users" width="32" className="text-muted-foreground" />}
        title={t("author.khongCoTacGiaNao", "No authors found")}
        description={t("author.thuTimKiemVoiTuKhoaKhac", "Try adjusting your search keyword or selected research field.")}
      />
    );
  }

  const tableBody = (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-muted/40 text-xs font-semibold text-muted-foreground select-none">
            <th className="py-3 px-4 w-12 text-center">#</th>
            <th className="py-3 px-4 min-w-[200px] text-left">Author</th>
            <th className="py-3 px-4 min-w-[240px] text-left">Affiliation</th>
            
            {/* Sortable Publications Column */}
            <th
              className="py-3 px-4 min-w-[120px] text-left cursor-pointer group hover:text-foreground transition-colors"
              onClick={() => onSortChange?.('articles')}
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Publications</span>
                {currentSort === 'articles' || currentSort === 'publications' ? (
                  <Icon icon="lucide:arrow-down" width={13} className="text-primary font-bold" />
                ) : (
                  <Icon icon="lucide:arrow-up-down" width={12} className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </th>

            {/* Sortable Citations Column */}
            <th
              className="py-3 px-4 min-w-[100px] text-left cursor-pointer group hover:text-foreground transition-colors"
              onClick={() => onSortChange?.('citations')}
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Citations</span>
                {currentSort === 'citations' ? (
                  <Icon icon="lucide:arrow-down" width={13} className="text-primary font-bold" />
                ) : (
                  <Icon icon="lucide:arrow-up-down" width={12} className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </th>

            {/* Sortable H-index Column */}
            <th
              className="py-3 px-4 min-w-[90px] text-left cursor-pointer group hover:text-foreground transition-colors"
              onClick={() => onSortChange?.('impact')}
            >
              <div className="inline-flex items-center gap-1.5">
                <span>H-index</span>
                {currentSort === 'impact' || currentSort === 'h_index' ? (
                  <Icon icon="lucide:arrow-down" width={13} className="text-primary font-bold" />
                ) : (
                  <Icon icon="lucide:arrow-up-down" width={12} className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="border-b border-border">
                <td className="py-3 px-4 text-center">
                  <Skeleton className="h-4 w-4 mx-auto rounded" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-36 rounded" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12 rounded" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12 rounded" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-8 rounded" />
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
      </table>
    </div>
  );

  const mobileContent = loading ? (
    <div className="grid grid-cols-1 gap-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-border bg-surface space-y-3">
          <div className="flex gap-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/5 rounded" />
              <Skeleton className="h-3 w-2/5 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded" />
        </div>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-3">
      {authors.filter(Boolean).map((author, idx) => (
        <AuthorCard key={author.author_id ?? author.id ?? idx} author={author} />
      ))}
    </div>
  );

  if (!asCard) {
    return (
      <div>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          {tableBody}
        </div>

        {/* Mobile Card View fallback */}
        <div className="block md:hidden p-3 space-y-3">
          {mobileContent}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="hidden md:block rounded-xl border border-border bg-surface shadow-card overflow-hidden"
      >
        {tableBody}

        {/* Embedded Pagination inside table card */}
        {pagination && pagination.totalItems > 0 && (
          <div className="border-t border-border px-4 py-3 bg-surface">
            <Pagination
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              limit={pagination.limit}
              onPageChange={pagination.onPageChange}
              entityName={t("author.tacGia", "authors")}
              className="pt-0"
            />
          </div>
        )}
      </motion.div>

      {/* Mobile Card View fallback */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="block md:hidden space-y-3"
      >
        {mobileContent}

        {pagination && pagination.totalItems > 0 && (
          <div className="p-3 bg-surface rounded-xl border border-border">
            <Pagination
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              limit={pagination.limit}
              onPageChange={pagination.onPageChange}
              entityName={t("author.tacGia", "authors")}
              className="pt-0"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
