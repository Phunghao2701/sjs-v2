import { cn } from '../../lib/utils';
import { Breadcrumbs } from './breadcrumb';

function PageContainer({ className = '', children, ...props }) {
  return (
    <div
      className={cn('w-full px-4 pt-4 pb-12 sm:px-6 lg:px-8 space-y-4 sm:space-y-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function PageHeader({
  title,
  description,
  actions,
  className = '',
  children,
}) {
  return (
    <header className={cn('flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="m-0 text-lg sm:text-xl font-bold leading-snug tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="mb-0 mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

export { PageContainer, PageHeader, Breadcrumbs };
