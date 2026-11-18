import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { EmptyState as EmptyStatePanel } from '../ui/state-panel';
import { Button } from '../ui/button';

export default function EmptyState({
  title,
  description,
  icon = 'lucide:folder-open',
  actionLabel = '',
  onAction = null,
  className = '',
}) {
  const { t } = useTranslation();
  return <EmptyStatePanel
    title={title || t('topic.khongCoDuLieu')}
    description={description || t('common.khongTimThayKetQuaPhuHop')}
    icon={<Icon icon={icon} width="24" />}
    className={className}
    actions={actionLabel && onAction ? <Button type="button" onClick={onAction}>{actionLabel}</Button> : null}
  />;
}
