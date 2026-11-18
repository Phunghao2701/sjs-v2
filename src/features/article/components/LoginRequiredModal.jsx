import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';

export default function LoginRequiredModal({ show, onHide }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = () => {
    onHide();
    navigate('/login');
  };

  const handleRegister = () => {
    onHide();
    navigate('/register');
  };

  return (
    <Modal show={show} onHide={onHide} size="sm" className="text-center p-6">
      <div className="flex flex-col items-center">
        {/* Header Icon */}
        <div className="flex items-center justify-center size-14 rounded-full bg-primary-subtle border border-primary/20 mb-3">
          <Icon icon="lucide:lock" className="text-primary" width="28" height="28" />
        </div>

        {/* Modal Title */}
        <h3 className="text-base font-bold text-foreground mb-1.5">
          {t("article.dangNhapDeLuuBaiBao", "Đăng nhập để lưu bài báo")}
        </h3>

        {/* Modal Description */}
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mb-5">
          {t("article.banCanDangNhapDeSuDungTinhNangLuu", "Bạn cần đăng nhập để sử dụng tính năng lưu bài báo vào danh sách yêu thích cá nhân.")}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={handleRegister} className="w-full sm:w-auto">
            {t("common.dangKy", "Đăng ký")}
          </Button>
          <Button size="sm" onClick={handleLogin} className="w-full sm:w-auto">
            {t("signIn", "Đăng nhập")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
