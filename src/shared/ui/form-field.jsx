import * as React from 'react';
import { cn } from '../../lib/utils';

function FormField({ id, label, hint, error, required = false, className = '', labelClassName = '', associateChild = true, children }) {
  const generatedId = React.useId();
  const controlId = id || `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const control = associateChild && React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id || controlId,
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
      })
    : children;

  return <div className={cn('grid gap-1.5', className)}>
    {label && <label htmlFor={controlId} className={cn('text-sm font-medium text-foreground', labelClassName)}>{label}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}{required && <span className="sr-only"> (required)</span>}</label>}
    {control}
    {hint && <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    {error && <p id={errorId} className="text-xs font-medium leading-relaxed text-danger" role="alert">{error}</p>}
  </div>;
}

export { FormField };
