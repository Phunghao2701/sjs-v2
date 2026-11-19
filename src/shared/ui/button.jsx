import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px', {
  variants: {
    variant: {
      default: 'border-primary bg-primary text-white shadow-card hover:border-primary-hover hover:bg-primary-hover',
      secondary: 'border-primary-subtle bg-primary-subtle text-primary-hover hover:bg-primary-subtle-hover',
      ghost: 'border-transparent bg-transparent text-inherit hover:bg-surface-muted',
      outline: 'border-border bg-surface text-foreground hover:bg-surface-muted',
      destructive: 'border-danger bg-danger text-white shadow-card hover:bg-danger/90 hover:border-danger/90',
      link: 'border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:bg-transparent hover:text-primary-hover hover:underline',
    },
    size: {
      default: 'min-h-10 px-4 py-2',
      sm: 'min-h-9 px-3 py-1.5 text-xs',
      lg: 'min-h-11 px-5 py-2.5',
      icon: 'h-10 w-10 p-0',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

function Spinner({ className = '', label = 'Loading' }) {
  return <span aria-label={label} role="status" className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)} />;
}

const Button = React.forwardRef(({ className = '', variant, size, asChild = false, isLoading = false, loadingText, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || (isLoading && !asChild)}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading && <Spinner label={loadingText || 'Loading'} className="shrink-0" />}
          {isLoading && loadingText ? loadingText : children}
        </>
      )}
    </Comp>
  );
});
Button.displayName = 'Button';

export { Button, Spinner, buttonVariants };
