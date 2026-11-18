import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

export default function AuthRequiredModal({ show, onHide }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onHide();
    navigate('/login');
  };

  const handleRegisterClick = () => {
    onHide();
    navigate('/register');
  };

  return (
    <Modal show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Icon icon="lucide:shield-alert" className="text-warning h-5 w-5" />
          <span>{t('common.yeuCauDangNhap', 'Sign in Required')}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-4">
        <p className="text-sm text-muted-foreground leading-relaxed m-0">
          {t('common.banCanDangNhapDeSuDungTinhNang', 'You need to sign in to access this feature.')}
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={handleRegisterClick}>
          {t('common.dangKy', 'Register')}
        </Button>
        <Button size="sm" onClick={handleLoginClick}>
          {t('signIn', 'Sign In')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
