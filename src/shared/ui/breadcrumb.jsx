import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Breadcrumbs({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.key || item.label || idx} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="no-underline !text-muted-foreground hover:!text-primary transition-colors font-normal"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium truncate max-w-xs sm:max-w-md',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="select-none text-muted-foreground/60 text-[11px]">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
