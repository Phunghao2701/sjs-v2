import { cn } from '../../lib/utils';
import { Breadcrumbs } from './breadcrumb';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from './motion';

function PageContainer({ className = '', children, ...props }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      variants={reduceMotion ? {} : fadeUp}
      className={cn('w-full max-w-[1360px] mx-auto px-4 pt-4 pb-12 sm:px-6 sm:pt-5 sm:pb-16 space-y-4 sm:space-y-5', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function PageHeader({
  title,
  description,
  actions,
  badge,
  breadcrumb,
  breadcrumbs,
  className = '',
  children,
}) {
  const activeBreadcrumb = breadcrumb || breadcrumbs;

  return (
    <header className={cn('flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        {activeBreadcrumb && (
          Array.isArray(activeBreadcrumb) ? (
            <Breadcrumbs items={activeBreadcrumb} className="mb-1.5" />
          ) : (
            <div className="mb-1.5">{activeBreadcrumb}</div>
          )
        )}
        {badge && <div className="mb-1.5">{badge}</div>}
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
