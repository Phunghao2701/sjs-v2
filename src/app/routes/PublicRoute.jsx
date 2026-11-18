import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { isAuthenticated as checkAuthStatus } from "../../shared/utils/auth";
import { getAuthenticatedHomePath } from "./languageRouting";
const PublicRoute = () => {
  const {
    t
  } = useTranslation();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await checkAuthStatus();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  if (loading) return <div>{t("common.dangTai")}</div>;

  // 🔥 Nếu đã đăng nhập thành công -> Đá ngược về dashboard, không cho xem trang login nữa
  return isAuthenticated ? <Navigate to={getAuthenticatedHomePath(user, lang)} replace /> : <Outlet />;
};
export default PublicRoute;
