import Icon from '../../Icon';
import { StatePanel } from '../../../ui/state-panel';

/**
 * Shared state card for empty, error, loading, and informational states.
 * Bridged to the shared StatePanel primitive for consistent tokens and accessibility.
 */
export default function StateCard({
  title,
  description,
  icon,
  variant = 'neutral',
  actions,
  className = '',
  role,
}) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={icon ? <Icon icon={icon} width="24" /> : null}
      variant={variant}
      actions={actions}
      className={className}
      role={role}
    />
  );
}
