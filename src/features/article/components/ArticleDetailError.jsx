import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import { StateCard } from '../../../shared/components/Card';

export default function ArticleDetailError({ errorMsg, onRetry }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <StateCard
      variant="error"
      icon="lucide:wifi-off"
      title={t("article.loiTaiDuLieu")}
      description={errorMsg || t("article.khongTheKetNoiDenMayChuVuiLong")}
      className="p-6"
      actions={
        <div className="flex flex-wrap gap-2.5 justify-center">
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              {t("article.thuTaiLai")}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/articles')}>
            {t("article.veDanhSachBaiBao")}
          </Button>
        </div>
      }
    />
  );
}
