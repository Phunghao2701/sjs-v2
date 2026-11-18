import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import { StateCard } from '../../../shared/components/Card';

export default function ArticleDetailEmpty({ articleId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <StateCard
      variant="warning"
      icon="lucide:alert-circle"
      title={t("article.khongTimThayBaiBao")}
      description={
        <>
          {t("article.baiBaoVoiMaSoId")} <strong>{articleId}</strong> {t("article.khongTonTaiHoacDaBiXoaKhoiHeTh")}
        </>
      }
      className="p-6"
      actions={
        <div className="flex flex-wrap gap-2.5 justify-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            {t("article.veDashboard")}
          </Button>
          <Button size="sm" onClick={() => navigate('/articles')}>
            {t("article.xemDanhSachBaiBao")}
          </Button>
        </div>
      }
    />
  );
}
