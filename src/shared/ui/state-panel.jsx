import { cn } from '../../lib/utils';
import { Button } from './button';

const stateIconStyles = {
  neutral: 'bg-surface-muted text-muted-foreground',
  info: 'bg-primary-subtle text-primary',
  warning: 'bg-warning-subtle text-warning',
  error: 'bg-danger-subtle text-danger',
};

function StatePanel({ variant = 'neutral', icon, title, description, actions, className = '', role, children }) {
  const liveRole = role || (variant === 'error' ? 'alert' : 'status');
  return <section role={liveRole} aria-live={liveRole === 'alert' ? 'assertive' : 'polite'} className={cn('flex min-h-64 flex-col items-center justify-center rounded-card border border-border bg-surface px-5 py-8 text-center', className)}>
    {icon && <span aria-hidden="true" className={cn('mb-3 inline-flex size-12 items-center justify-center rounded-full', stateIconStyles[variant] || stateIconStyles.neutral)}>{icon}</span>}
    {title && <h2 className="mb-2 text-base font-semibold leading-snug text-foreground">{title}</h2>}
    {description && <div className="mx-auto mb-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</div>}
    {children}
    {actions && <div className="mt-1 flex flex-wrap justify-center gap-3">{actions}</div>}
  </section>;
}

function EmptyState({ ...props }) {
  return <StatePanel {...props} variant={props.variant || 'neutral'} />;
}

function ErrorState({ onRetry, retryLabel = 'Try again', retrying = false, actions, ...props }) {
  const retryAction = onRetry ? <Button type="button" onClick={onRetry} isLoading={retrying} loadingText={retryLabel} disabled={retrying}>{retrying ? undefined : retryLabel}</Button> : null;
  return <StatePanel {...props} variant="error" actions={actions || retryAction} />;
}

export { EmptyState, ErrorState, StatePanel };
