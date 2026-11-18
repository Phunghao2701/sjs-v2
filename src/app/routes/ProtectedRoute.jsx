import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated as checkAuthStatus } from "../../shared/utils/auth";
import { getDefaultLang, getAuthenticatedHomePath } from "./languageRouting";
const ProtectedRoute = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const sessionExpiredModalVisible = useAuthStore((s) => s.sessionExpiredModalVisible);
  const [loading, setLoading] = useState(!isAuthenticated);
  
  const location = useLocation();
  const lang = getDefaultLang();

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated]);
  
  // Nếu modal thông báo hết hạn phiên đang mở -> vẫn render Outlet để modal hiển thị đè lên màn hình
  if (sessionExpiredModalVisible) {
    return <Outlet />;
  }

  if (loading) return <div>{t("common.dangKiemTraQuyenTruyCap")}</div>;
  
  if (!isAuthenticated) {
    return <Navigate to={{pathname: '/' + lang + '/login'}} state={{ from: location }} replace />;
  }

  // The researcher dashboard is not part of the admin workspace. Keep this
  // guard route-specific so admins can still use shared pages and analytics.
  if (user?.role === 'ADMINISTRATOR' && location.pathname === `/${lang}/dashboard`) {
    return <Navigate to={getAuthenticatedHomePath(user, lang)} replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
