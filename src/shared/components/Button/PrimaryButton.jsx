import { Button } from '../../ui/button';
import Icon from '../Icon';

/**
 * Reusable Primary Button bridged to shared UI Button primitive.
 */
export default function PrimaryButton({
  children,
  icon = '',
  className = '',
  variant = 'default',
  type = 'button',
  ...props
}) {
  const mappedVariant = variant === 'primary' ? 'default' : variant;
  return (
    <Button
      variant={mappedVariant}
      type={type}
      className={className}
      {...props}
    >
      {icon && <Icon icon={icon} width="15" className="me-1.5" />}
      {children}
    </Button>
  );
}
