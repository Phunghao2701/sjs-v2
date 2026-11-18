import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className = '', type = 'text', invalid = false, 'aria-invalid': ariaInvalid, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs outline-none transition placeholder:text-subtle-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger',
      className,
    )}
    aria-invalid={ariaInvalid ?? (invalid || undefined)}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
