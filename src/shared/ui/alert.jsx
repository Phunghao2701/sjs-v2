import { cva } from 'class-variance-authority';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';

const alertVariants = cva('relative flex gap-3 rounded-control border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0', {
  variants: {
    variant: {
      info: 'border-primary/20 bg-primary-subtle text-primary-hover',
      success: 'border-success/20 bg-success-subtle text-success',
      warning: 'border-warning/20 bg-warning-subtle text-warning',
      destructive: 'border-danger/20 bg-danger-subtle text-danger',
    },
  },
  defaultVariants: { variant: 'info' },
});

function Alert({ className = '', variant, role, children, onDismiss, dismissLabel = 'Dismiss message', ...props }) {
  const isUrgent = variant === 'destructive';
  return <div role={role || (isUrgent ? 'alert' : 'status')} aria-live={isUrgent ? 'assertive' : 'polite'} className={cn(alertVariants({ variant }), onDismiss && 'pr-11', className)} {...props}>
    <div className="min-w-0 flex-1">{children}</div>
    {onDismiss && <button type="button" aria-label={dismissLabel} title={dismissLabel} onClick={onDismiss} className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-control border-0 bg-transparent text-current hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Icon icon="lucide:x" aria-hidden="true" /></button>}
  </div>;
}

function AlertTitle({ className = '', ...props }) {
  return <h3 className={cn('font-semibold leading-none tracking-tight', className)} {...props} />;
}

function AlertDescription({ className = '', ...props }) {
  return <div className={cn('text-sm leading-relaxed [&_p]:leading-relaxed', className)} {...props} />;
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
