import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import UserAccountForm from '../../components/account/UserAccountForm';
import { createAdminUser } from '../../api/adminUsers.api';
import ROUTES from '../../../../app/routes/routePaths';
import { Alert } from '../../../../shared/ui/alert';
import { PageHeader } from '../../../../shared/ui/page-layout';
import { Card } from '../../../../shared/ui/card';

const getApiErrorMessage = error => {
  if (error.response?.status === 403) {
    return t("admin.backendTuChoiQuyenAdminTokenHi");
  }
  return error.response?.data?.message || t("admin.khongTheTaoTaiKhoanMoi");
};
const toApiEnum = (value = '') => String(value).trim().toUpperCase().replace(/\s+/g, '_');
const buildCreateUserPayload = payload => ({
  ...payload,
  role: toApiEnum(payload.role),
  status: toApiEnum(payload.status)
});

/**
 * AddNewAccountPage Component
 * Trang thêm tài khoản người dùng mới trên hệ thống ResearchPulse (Page 17).
 */
export default function AddNewAccountPage() {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleFormSubmit = async payload => {
    try {
      setSubmitting(true);
      setSubmitError('');
      await createAdminUser(buildCreateUserPayload(payload));
      alert(t("admin.themTaiKhoanMoiThanhCong"));
      navigate(ROUTES.ADMIN_USERS);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Platform Directory', to: ROUTES.ADMIN_USERS },
          { label: 'User Directory', to: ROUTES.ADMIN_USERS },
          { label: 'New Account' }
        ]}
        title={t("admin.themTaiKhoanMoi")}
        description={t("admin.vuiLongDienDayDuCacThongTinBen")}
      />

      <div className="mx-auto max-w-[820px]">
        {/* Core Account Form card */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-2xs mb-6">
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              {submitError}
            </Alert>
          )}

          <UserAccountForm isEdit={false} onSubmit={handleFormSubmit} onCancel={() => navigate(ROUTES.ADMIN_USERS)} submitting={submitting} />
        </Card>

        {/* Informational Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-xl shadow-2xs">
            <div className="flex flex-col items-start gap-3">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                <Icon icon="lucide:mail" width="16" />
              </div>
              <div>
                <h6 className="font-bold mb-1 text-sm text-red-900 dark:text-red-200">{t("admin.thongBaoTuDong")}</h6>
                <p className="text-xs mb-0 text-red-800 dark:text-red-300/80 leading-relaxed">{t("admin.heThongSeTuDongGuiEmailKichHoa")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-sky-200 bg-sky-50 dark:bg-sky-950/20 rounded-xl shadow-2xs">
            <div className="flex flex-col items-start gap-3">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                <Icon icon="lucide:shield-check" width="16" />
              </div>
              <div>
                <h6 className="font-bold mb-1 text-sm text-sky-900 dark:text-sky-200">{t("admin.phanQuyenThongMinh")}</h6>
                <p className="text-xs mb-0 text-sky-800 dark:text-sky-300/80 leading-relaxed">{t("admin.vaiTroXacDinhCacQuyenTruyCapVa")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border bg-muted/40 rounded-xl shadow-2xs">
            <div className="flex flex-col items-start gap-3">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
                <Icon icon="lucide:clock" width="16" />
              </div>
              <div>
                <h6 className="font-bold mb-1 text-sm text-foreground">{t("admin.lichSuThaoTac")}</h6>
                <p className="text-xs mb-0 text-muted-foreground leading-relaxed">{t("admin.moiHanhDongTaoTaiKhoanDeuDuocG")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
