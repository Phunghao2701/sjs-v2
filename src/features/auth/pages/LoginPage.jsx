import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import LoginForm from '../components/LoginForm';
import SocialAuthButton from '../components/SocialAuthButton';
import { toast } from '../../../shared/utils/toast';
import ROUTES from '../../../app/routes/routePaths';
import { startHyperdatalabSso } from '../services/hyperdatalabSso';
import { Alert } from '../../../shared/ui/alert';
const DASHBOARD_PAGE = ROUTES.DASHBOARD;
export default function LoginPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
  } = useAuth();

  // State riêng của màn hình login để điều khiển loading và lỗi form.
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nếu người dùng bị redirect tới login từ một trang khác, đăng nhập xong quay lại trang đó.
  const from = location.state?.from 
    ? `${location.state.from.pathname}${location.state.from.search || ''}` 
    : DASHBOARD_PAGE;

  /**
   * Xử lý submit form đăng nhập bằng email/password.
   * Thành công thì điều hướng tới trang trước đó hoặc dashboard.
   */
  const handleLoginSubmit = async payload => {
    setIsLoading(true);
    setError(null);
    try {
      await login(payload.email, payload.password, payload.remember_login);
      navigate(from, {
        replace: true
      });
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || err.message || t("auth.dangNhapKhongThanhCongVuiLongK"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Khởi chạy luồng đăng nhập Google OAuth.
   * Sau khi thành công, hook `useAuth` sẽ tự điều hướng về dashboard.
   */
  const handleLoginWithSso = async () => {
    setSsoLoading(true);
    setError(null);
    try {
      await startHyperdatalabSso(from);
    } catch (ssoError) {
      const message = ssoError.message === 'SSO_CONFIGURATION_MISSING'
        ? t('auth.ssoChuaCauHinh')
        : t('auth.ssoDangNhapThatBai');
      setError(message);
      toast.error(message);
      setSsoLoading(false);
    }
  };
  return (
    <AuthLayout banner={<AuthBanner />}>
      <div className="mb-6 space-y-1">
        <h2 className="font-display font-semibold text-base text-foreground m-0">{t("signIn")}</h2>
        <p className="text-sm text-muted-foreground m-0">{t("auth.chaoMungTroLaiVuiLongNhapThong")}</p>
      </div>

      {/* Single sign-on entry point. */}
      <div className="mb-6">
        <SocialAuthButton onClick={handleLoginWithSso} disabled={isLoading || ssoLoading} label={t('auth.dangNhapBangSso')} />
      </div>

      {error && <Alert variant="destructive" className="mb-4 py-3">{error}</Alert>}

      {/* Đường phân cách giữa SSO và form email/password. */}
      <div className="flex items-center justify-center my-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
        <div className="flex-1 h-px bg-border" />
        <span className="px-3">{t("auth.hoac")}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} apiError={error} />

      {/* Điều hướng sang trang đăng ký nếu người dùng chưa có tài khoản. */}
      <div className="text-center mt-6 text-sm">
        <span className="text-muted-foreground">{t("auth.chuaCoTaiKhoan")}</span>{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
          {t("signUp")}
        </Link>
      </div>
    </AuthLayout>
  );
}
