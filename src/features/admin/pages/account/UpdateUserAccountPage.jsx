import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserAccountForm from '../../components/account/UserAccountForm';
import { getAdminUserById, updateAdminUser } from '../../api/adminUsers.api';
import ROUTES from '../../../../app/routes/routePaths';
import { Alert } from '../../../../shared/ui/alert';
import { PageHeader } from '../../../../shared/ui/page-layout';
import { Skeleton } from '../../../../shared/ui/skeleton';
import { StatePanel } from '../../../../shared/ui/state-panel';
import { Card } from '../../../../shared/ui/card';

const getApiErrorMessage = (error, fallback) => {
  if (error.response?.status === 403) {
    return t("admin.backendTuChoiQuyenAdminTokenHi");
  }
  return error.response?.data?.message || fallback;
};
const toApiEnum = (value = '') => String(value).trim().toUpperCase().replace(/\s+/g, '_');
const toTitleCaseEnum = (value = '') => {
  return String(value).toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};
const buildUpdateUserPayload = payload => ({
  ...payload,
  role: toApiEnum(payload.role),
  status: toApiEnum(payload.status)
});
const normalizeUser = (user = {}) => ({
  id: user.id || user.user_id || user.uuid,
  first_name: user.first_name || user.firstName || '',
  last_name: user.last_name || user.lastName || '',
  name: user.name || [user.first_name || user.firstName || '', user.last_name || user.lastName || ''].filter(Boolean).join(' ').trim(),
  email: user.email || '',
  phone: user.phone || '',
  institution: user.institution || '',
  role: toTitleCaseEnum(user.role || 'RESEARCHER'),
  status: toTitleCaseEnum(user.status || 'ACTIVE'),
  avatar: user.avatar || user.avatar_url || ''
});

/**
 * UpdateUserAccountPage Component
 * Trang cập nhật thông tin tài khoản người dùng có sẵn trên hệ thống (Page 13).
 */
export default function UpdateUserAccountPage() {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [userItem, setUserItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        setLoading(true);
        setLoadingError('');
        const response = await getAdminUserById(id);
        if (!isMounted) return;
        setUserItem(normalizeUser(response.data?.data || {}));
      } catch (error) {
        if (!isMounted) return;
        setUserItem(null);
        setLoadingError(getApiErrorMessage(error, t("admin.khongTheTaiThongTinNguoiDung")));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleFormSubmit = async payload => {
    try {
      setSubmitting(true);
      setSubmitError('');
      await updateAdminUser(id, buildUpdateUserPayload(payload));
      alert(t("admin.capNhatThongTinNguoiDungThanhC"));
      navigate(ROUTES.ADMIN_USERS);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, t("admin.khongTheCapNhatThongTinNguoiDu")));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[800px] mx-auto py-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Card className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  if (!userItem) {
    return (
      <div className="w-full max-w-[600px] mx-auto py-6">
        <StatePanel
          variant="error"
          title={t("admin.khongTimThayNguoiDung")}
          description={loadingError || t("admin.taiKhoanNayCoTheDaBiXoaHoacKho")}
          action={{
            label: t("admin.quayLaiDanhSach"),
            onClick: () => navigate(ROUTES.ADMIN_USERS),
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Platform Directory', to: ROUTES.ADMIN_USERS },
          { label: 'User Directory', to: ROUTES.ADMIN_USERS },
          { label: 'Update User' }
        ]}
        title={t("admin.capNhatThongTinNguoiDung")}
        description="Modify profile settings, adjust organizational roles, and update security credentials for this platform contributor."
      />

      <div className="mx-auto max-w-[800px]">
        <Card className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-2xs mb-6">
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              {submitError}
            </Alert>
          )}

          <UserAccountForm
            isEdit={true}
            initialData={userItem}
            onSubmit={handleFormSubmit}
            onCancel={() => navigate(ROUTES.ADMIN_USERS)}
            submitting={submitting}
          />
        </Card>
      </div>
    </div>
  );
}
