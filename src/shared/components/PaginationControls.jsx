/**
 * Low-level numbered pagination controls shared across admin and public pages.
 *
 * - currentPage: current page number (1-indexed)
 * - totalPages: total number of pages
 * - onPageChange: called when user clicks a page, Previous, or Next
 */
import Icon from './Icon';

// Build visible items as page numbers or a single ellipsis between distant ranges.
function buildPageItems(currentPage, totalPages) {
  const items = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= 1;

    if (isEdge || isNearCurrent) {
      items.push(page);
    } else if (items[items.length - 1] !== 'ellipsis') {
      items.push('ellipsis');
    }
  }

  return items;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md border border-border bg-surface text-text-main text-xs font-medium transition-colors hover:not-disabled:border-primary hover:not-disabled:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <Icon icon="lucide:chevron-left" />
      </button>

      {pageItems.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="inline-flex items-center justify-center min-w-[32px] h-8 text-text-muted text-xs">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-md border text-xs font-medium transition-colors ${
              item === currentPage
                ? 'bg-primary border-primary text-white hover:text-white'
                : 'border-border bg-surface text-text-main hover:border-primary hover:text-primary'
            }`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md border border-border bg-surface text-text-main text-xs font-medium transition-colors hover:not-disabled:border-primary hover:not-disabled:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <Icon icon="lucide:chevron-right" />
      </button>
    </nav>
  );
}
