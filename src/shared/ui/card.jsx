import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <section ref={ref} className={cn('rounded-card border border-border bg-surface shadow-card', className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = ({ className = '', ...props }) => (
  <div className={cn('flex items-center justify-between gap-2 border-b border-border px-4 py-2.5 min-h-[46px]', className)} {...props} />
);
const CardTitle = ({ className = '', ...props }) => (
  <h2 className={cn('m-0 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2', className)} {...props} />
);
const CardDescription = ({ className = '', ...props }) => (
  <p className={cn('mt-0.5 text-xs text-muted-foreground', className)} {...props} />
);
const CardContent = ({ className = '', ...props }) => (
  <div className={cn('p-3.5', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
