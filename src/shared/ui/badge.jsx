import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-white',
      secondary: 'border-transparent bg-surface-muted text-muted-foreground',
      outline: 'border-border bg-transparent text-muted-foreground',
      success: 'border-success/20 bg-success-subtle text-success',
      info: 'border-primary/20 bg-primary-subtle text-primary-hover',
      warning: 'border-warning/20 bg-warning-subtle text-warning',
      destructive: 'border-danger/20 bg-danger-subtle text-danger',
    },
  },
  defaultVariants: { variant: 'default' },
});

function Badge({ className = '', variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
