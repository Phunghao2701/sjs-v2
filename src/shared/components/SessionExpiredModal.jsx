/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared/components/SessionExpiredModal.jsx
 * Modal thông báo đẹp mắt khi phiên đăng nhập hết hạn (do không tick Remember-me hoặc token hết hiệu lực).
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useAuthStore } from '../../app/store/authStore';
import { useUserStore } from '../../app/store/userStore';
import { logoutSession } from '../../features/auth/services/authService';
import { API_BASE_URL } from '../services/apiBase';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

export default function SessionExpiredModal() {
  const navigate = useNavigate();
  const show = useAuthStore((state) => state.sessionExpiredModalVisible);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setSessionExpiredModalVisible = useAuthStore((state) => state.setSessionExpiredModalVisible);
  const logout = useAuthStore((state) => state.logout);
  const clearEmail = useUserStore((state) => state.clearEmail);

  // Giám sát thời hạn thực tế của Token theo thời gian thực (kể cả khi user đứng yên không thao tác)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let timeoutId = null;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp) {
        const expiresInMs = decoded.exp * 1000 - Date.now();

        const trySilentRefresh = async () => {
          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            const refreshHeaders = {};
            if (refreshToken) {
              refreshHeaders['x-refresh-token'] = refreshToken;
            }

            const res = await axios.get(`${API_BASE_URL}/auth/refresh`, {
              withCredentials: true,
              headers: refreshHeaders,
            });

            if (res.status === 200 && res.data?.success !== false) {
              const newToken = res.data?.data?.token || res.data?.token;
              const newRefreshToken = res.data?.data?.refresh_token || res.data?.refresh_token || refreshToken;

              if (newToken) {
                const currentRemember = useAuthStore.getState().remember;
                useAuthStore.getState().loginSuccess(newToken, null, currentRemember, newRefreshToken);
                return;
              }
            }
            throw new Error('Refresh failed');
          } catch {
            // Chỉ hiện modal khi refresh thực sự thất bại hoặc hết hạn hoàn toàn
            setSessionExpiredModalVisible(true);
          }
        };

        if (expiresInMs <= 0) {
          // Token đã hết hạn ngay lúc này -> Thử refresh trước
          trySilentRefresh();
        } else {
          // Thử refresh tự động khi token sắp hết hạn (trước 1 phút)
          const refreshDelay = Math.max(expiresInMs - 60000, 1000);
          timeoutId = setTimeout(() => {
            trySilentRefresh();
          }, refreshDelay);
        }
      }
    } catch {
      // Bỏ qua lỗi decode nếu token không phải jwt hợp lệ
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, isAuthenticated, setSessionExpiredModalVisible]);

  const handleConfirm = async () => {
    // Đóng modal trước
    setSessionExpiredModalVisible(false);

    // Xóa session ở BE (nếu cookie còn) và dọn sạch state ở client
    try {
      await logoutSession();
    } catch {
      // Bỏ qua lỗi mạng nếu có khi gọi logout
    }

    logout();
    clearEmail?.();

    // Điều hướng người dùng về trang đăng nhập
    navigate('/login', { replace: true });
  };

  return (
    <Modal
      show={show}
      onHide={() => {}}
      size="md"
      className="text-center p-6 sm:p-8"
    >
      {/* Glowing Icon Wrapper */}
      <div className="flex justify-center mb-4">
        <div
          className="flex items-center justify-center rounded-full size-16"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)',
            border: '2px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <Icon
            icon="lucide:clock-alert"
            width="32"
            height="32"
            style={{ color: '#d97706' }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground mb-2">
        Phiên đăng nhập đã hết hạn
      </h3>

      {/* Message */}
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
        Phiên làm việc của bạn đã kết thúc vì bạn không chọn ghi nhớ đăng nhập (hoặc phiên làm việc đã quá hạn bảo mật). Vui lòng đăng nhập lại để tiếp tục làm việc.
      </p>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleConfirm}
          className="w-full max-w-[260px] flex items-center justify-center gap-2 py-2.5 font-semibold"
        >
          <Icon icon="lucide:log-in" width="16" height="16" />
          <span>Đăng nhập lại (OK)</span>
        </Button>
      </div>
    </Modal>
  );
}
