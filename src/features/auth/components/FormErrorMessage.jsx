/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\FormErrorMessage.jsx
 */
import Icon from '../../../shared/components/Icon';
import { Alert } from '../../../shared/ui/alert';

export default function FormErrorMessage({ message }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="mb-4 items-center py-2.5 px-3">
      <Icon icon="lucide:alert-triangle" width="18" className="flex-shrink-0" aria-hidden="true" />
      <div>{message}</div>
    </Alert>
  );
}
