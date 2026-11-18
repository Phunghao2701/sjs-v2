import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ROUTES from '../../../app/routes/routePaths';
import projectService from '../services/projectService';
import { Button } from '../../../shared/ui/button';
import { PageContainer } from '../../../shared/ui/page-layout';
import { StatePanel } from '../../../shared/ui/state-panel';

const AcceptInvitePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage(t("project.loiXacNhan", "Token xác nhận không hợp lệ hoặc đã hết hạn."));
      return;
    }

    const confirmInvite = async () => {
      try {
        await projectService.acceptProjectInvite(token);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || t("project.daXayRaLoiKhiXacNhan", "Có lỗi xảy ra khi xác nhận lời mời."));
      }
    };

    confirmInvite();
  }, [searchParams, t]);

  return (
    <PageContainer className="flex min-h-[60vh] items-center justify-center py-10 max-w-xl">
      {status === 'loading' && (
        <StatePanel
          variant="info"
          icon={<Icon icon="lucide:loader-2" className="animate-spin text-primary" width="32" />}
          title={t("project.dangXuLy", "Đang xử lý lời mời...")}
          description={t("project.vuiLongChoTrongGiayLat", "Vui lòng chờ trong giây lát.")}
          className="w-full"
        />
      )}

      {status === 'success' && (
        <StatePanel
          variant="neutral"
          icon={
            <span className="flex size-12 items-center justify-center rounded-full bg-success-subtle text-success">
              <Icon icon="lucide:check-circle" width="28" />
            </span>
          }
          title={t("project.xacNhanThanhCong", "Xác nhận thành công!")}
          description={t("project.banDaDuocThemVaoDuAnThanhCong", "Bạn đã được thêm vào dự án thành công. Bây giờ bạn có thể truy cập dự án.")}
          className="w-full"
          actions={
            <Button onClick={() => navigate(ROUTES.PROJECTS)}>
              {t("project.chuyenDenDanhSachDuAn", "Chuyển đến danh sách dự án")}
            </Button>
          }
        />
      )}

      {status === 'error' && (
        <StatePanel
          variant="error"
          icon={
            <span className="flex size-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
              <Icon icon="lucide:alert-circle" width="28" />
            </span>
          }
          title={t("project.xacNhanThatBai", "Xác nhận thất bại")}
          description={errorMessage}
          className="w-full"
          actions={
            <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
              {t("project.troVeTrangChu", "Trở về trang tổng quan")}
            </Button>
          }
        />
      )}
    </PageContainer>
  );
};

export default AcceptInvitePage;
