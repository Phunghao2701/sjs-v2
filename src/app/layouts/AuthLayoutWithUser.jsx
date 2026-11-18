import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { isAuthenticated } from "../../shared/utils/auth";
import { useAuthStore } from "../store/authStore";
import { useLocation } from "react-router-dom";
import DashboardShell from "../../shared/components/DashboardShell";

/**
 * AuthLayoutWithUser
 * - Check token/session once on route entry
 * - Hydrate Zustand (useAuthStore + userStore) via isAuthenticated()
 * - Use catch to avoid unhandled promise rejections / minimize server calls
 */
export default function AuthLayoutWithUser() {
  const [booting, setBooting] = useState(true);
  const hasAuth = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();


  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Luôn chạy isAuthenticated để hydrate đúng user khi reload
      // (zustand có thể chưa kịp có dữ liệu hoặc bị reset khi refresh).
      await isAuthenticated()
        .catch(() => {
          // isAuthenticated đã logout/clear state khi fail; ở đây chỉ nuốt lỗi để tránh crash
        })
        .finally(() => {
          if (!cancelled) setBooting(false);
        });

    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hasAuth]);

  if (booting) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600" aria-live="polite"><span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0071BC]" />Loading workspace…</div>;

  // AdminLayout owns its own navigation and spacing. Keep the shared shell for
  // the user-facing and analytics surfaces only.
  const isAdminSurface = location.pathname.includes('/admin/') || location.pathname.includes('/admin-preview');
  if (isAdminSurface) return <Outlet />;
  return <DashboardShell><Outlet /></DashboardShell>;
}

