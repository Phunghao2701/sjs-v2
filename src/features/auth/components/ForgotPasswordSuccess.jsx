import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ROUTES from '../../../app/routes/routePaths';

export default function ForgotPasswordSuccess({
  onResend,
  isLoading
}) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendClick = () => {
    if (countdown > 0 || isLoading) return;
    onResend();
    setCountdown(60);
  };

  return (
    <div className="text-center py-4 animate-fade-in">
      <div 
        className="inline-flex items-center justify-center rounded-full mb-4 size-16 bg-primary-subtle text-primary"
      >
        <Icon icon="lucide:check-circle" width="36" height="36" />
      </div>

      <h3 className="font-display font-semibold text-base mb-3 text-foreground">{t("auth.kiemTraEmailCuaBan")}</h3>
      
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {t("auth.neuEmailTonTaiTrongHeThongLien")}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleResendClick}
          disabled={countdown > 0 || isLoading}
          className={`text-sm font-semibold p-0 border-0 bg-transparent transition-colors ${
            countdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline cursor-pointer'
          }`}
        >
          {countdown > 0 ? `Gửi lại email (${countdown}s)` : t("auth.guiLaiEmail")}
        </button>

        <div className="w-full h-px bg-border" />

        <Link
          to={ROUTES.LOGIN}
          className="text-sm font-semibold py-2 inline-flex items-center justify-center gap-1.5 text-foreground hover:text-primary transition-colors"
        >
          <Icon icon="lucide:arrow-left" width="16" />
          <span>{t("auth.quayLaiDangNhap")}</span>
        </Link>
      </div>
    </div>
  );
}
