import { cn } from '../../../../lib/utils';
import { Badge } from '../../../ui/badge';

/**
 * Shared header/filter card for data pages that need a title, count badge,
 * and filter/search controls, normalized with shared tokens and primitives.
 */
export default function HeaderFilterCard({
  title,
  count,
  singularLabel = 'Item',
  pluralLabel = 'Items',
  children,
  className = '',
}) {
  const hasCount = count !== undefined && count !== null;
  const normalizedCount = Number(count);
  const label = normalizedCount === 1 ? singularLabel : pluralLabel;

  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-border', className)}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h2 className="m-0 text-base font-semibold text-foreground">{title}</h2>
        {hasCount && (
          <Badge variant="default" className="text-xs font-semibold">
            {count} {label}
          </Badge>
        )}
      </div>

      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
