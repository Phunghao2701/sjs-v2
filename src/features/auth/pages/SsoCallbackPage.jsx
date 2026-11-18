import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDefaultLang, getAuthenticatedHomePath } from '../../../app/routes/languageRouting';
import { completeHyperdatalabSsoCallback } from '../services/hyperdatalabSso';
import { useAuthStore } from '../../../app/store/authStore';

function getErrorMessage(error) {
  if (error?.message === 'SSO_CONFIGURATION_MISSING' || error?.message === 'SSO_CONFIGURATION_INVALID') return 'auth.ssoChuaCauHinh';
  if (error?.message?.startsWith('SSO_ATTEMPT') || error?.message === 'SSO_STATE_INVALID' || error?.message === 'SSO_CODE_MISSING') return 'auth.ssoPhienKhongHopLe';
  return 'auth.ssoDangNhapThatBai';
}

export default function SsoCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorKey, setErrorKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const callbackHref = window.location.href;
    window.history.replaceState({}, document.title, window.location.pathname);
    completeHyperdatalabSsoCallback(callbackHref)
      .then(({ returnTo }) => {
        if (cancelled) return;
        const user = useAuthStore.getState().user;
        const destination = user?.role === 'ADMINISTRATOR'
          ? getAuthenticatedHomePath(user, getDefaultLang())
          : returnTo;
        navigate(destination, { replace: true });
      })
      .catch((error) => { if (!cancelled) setErrorKey(getErrorMessage(error)); });
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <section className="text-center" style={{ maxWidth: 440 }}>
        {errorKey ? (
          <>
            <h1 className="h4 fw-bold">{t('auth.ssoDangNhapThatBai')}</h1>
            <p className="text-muted">{t(errorKey)}</p>
            <Link to={`/${getDefaultLang()}/login`}>{t('auth.veTrangDangNhap')}</Link>
          </>
        ) : (
          <>
            <div className="spinner-border text-primary" role="status" aria-label={t('auth.ssoDangXuLy')} />
            <p className="text-muted mt-3">{t('auth.ssoDangXuLy')}</p>
          </>
        )}
      </section>
    </main>
  );
}
