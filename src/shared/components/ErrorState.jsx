import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { ErrorState as ErrorStatePanel } from '../ui/state-panel';

export default function ErrorState({
  title,
  message,
  icon = 'lucide:alert-triangle',
  onRetry = null,
  retryLabel,
  className = '',
  retrying = false,
}) {
  const { t } = useTranslation();
  return <ErrorStatePanel
    title={title || t('common.khongTheTaiDuLieu')}
    description={message || t('common.vuiLongKiemTraLaiKetNoiMangHoa')}
    icon={<Icon icon={icon} width="24" />}
    onRetry={onRetry}
    retryLabel={retryLabel || t('article.thuLai')}
    retrying={retrying}
    className={className}
  />;
}
