import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import ResetPasswordForm from '../components/ResetPasswordForm';
import ResetPasswordSuccess from '../components/ResetPasswordSuccess';
import { resetPasswordApi } from '../api/auth.api';
import Icon from '../../../shared/components/Icon';
import ROUTES from '../../../app/routes/routePaths';
import { Alert } from '../../../shared/ui/alert';
export default function ResetPasswordPage() {
  const { t: _t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleResetPasswordSubmit = async password => {
    if (!token) {
      setError(t("auth.thieuMaXacThucKhoiPhucMatKhauV"));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // API call with token and new_password (backend format is new_password)
      await resetPasswordApi({
        token: token,
        new_password: password
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Reset password API failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || err.message || t("auth.thayDoiMatKhauThatBaiVuiLongTh"));
    } finally {
      setIsLoading(false);
    }
  };
  return <AuthLayout banner={<AuthBanner />}>
      {isSubmitted ? <ResetPasswordSuccess /> : <>
          {/* Logo on mobile only */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <div className="d-flex align-items-center justify-content-center" style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'var(--btn-dark)',
          boxShadow: '0 4px 10px rgba(7, 26, 28, 0.15)'
        }}>
              <img src="/Cyan_folded-ribbon_T_favicon.png" alt="" width="36" height="36" style={{ objectFit: 'contain' }} />
            </div>
            <span className="fs-5 fw-bold font-display" style={{
          letterSpacing: '0.03em',
          color: 'var(--text-main)'
        }}>
              Trending System
            </span>
          </div>

          <div className="mb-6 space-y-1">
            <h2 className="font-display font-semibold text-base text-foreground m-0">{t("auth.datLaiMatKhau")}</h2>
            <p className="text-sm text-muted-foreground m-0">{t("auth.vuiLongNhapMatKhauMoiCuaBanBen")}</p>
          </div>

          {!token ? (
            <Alert variant="destructive" className="items-center mb-4">
              <Icon icon="lucide:alert-triangle" width="18" className="shrink-0" />
              <div className="flex-1 text-xs">
                {t("auth.lienKetKhoiPhucMatKhauKhongHop")}
                <div className="mt-2">
                  <Link to={ROUTES.FORGOT_PASSWORD} className="text-primary font-semibold hover:underline">
                    {t("auth.yeuCauLienKetMoi")}
                  </Link>
                </div>
              </div>
            </Alert>
          ) : (
            <ResetPasswordForm onSubmit={handleResetPasswordSubmit} isLoading={isLoading} apiError={error} />
          )}

          {/* Link back to Login */}
          {!isSubmitted && (
            <div className="text-center mt-6 text-sm">
              <span className="text-muted-foreground">{t("auth.quayLai")}</span>{' '}
              <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
                {t("signIn")}
              </Link>
            </div>
          )}
        </>
      }
    </AuthLayout>;
}
