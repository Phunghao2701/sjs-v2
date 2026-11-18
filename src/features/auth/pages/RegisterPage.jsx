import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * Trang đăng ký tài khoản mới.
 *
 * File: features/auth/pages/RegisterPage.jsx
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import RegisterForm from '../components/RegisterForm';
import Icon from '../../../shared/components/Icon';
import { Button } from '../../../shared/ui/button';
import { StatePanel } from '../../../shared/ui/state-panel';
export default function RegisterPage() {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const {
    register
  } = useAuth();

  // State phục vụ UI đăng ký: loading, lỗi API, màn hình thành công.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  /**
   * Gửi form đăng ký lên backend.
   * Nếu API không ném lỗi, hiển thị màn hình thông báo xác thực email.
   */
  const handleRegisterSubmit = async payload => {
    setIsLoading(true);
    setError(null);
    try {
      setRegisteredEmail(payload.email);
      await register(payload);
      setIsSuccess(true);
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || err.message || t("auth.dangKyKhongThanhCongVuiLongThu"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Placeholder cho Google OAuth ở trang đăng ký.
   * Hiện chức năng này chưa bật trực tiếp tại màn hình register.
   */
  const handleGoogleAuth = () => {
    alert(t("auth.dangNhapdangKyBangGoogleOauthD"));
  };
  return (
    <AuthLayout banner={<AuthBanner />}>
      {isSuccess ? (
        <StatePanel
          variant="neutral"
          icon={
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Icon icon="lucide:check-circle" width="32" height="32" />
            </span>
          }
          title={t("auth.dangKyThanhCong")}
          description={
            <span>
              {t("auth.motEmailXacThucDaDuocGuiToiDia")}{' '}
              <strong className="text-foreground">{registeredEmail}</strong>.{' '}
              {t("auth.vuiLongKiemTraHopThuHoacThuRac")}
            </span>
          }
          actions={
            <Button onClick={() => navigate('/login')} className="w-full">
              {t("auth.diDenDangNhap")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 space-y-1">
            <h2 className="font-display font-semibold text-base text-foreground m-0">{t("auth.taoTaiKhoan")}</h2>
            <p className="text-sm text-muted-foreground m-0">{t("auth.dangKyMienPhiKhongCanTheTinDun")}</p>
          </div>

          <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} apiError={error} onGoogleAuth={handleGoogleAuth} />
        </>
      )}
    </AuthLayout>
  );
}