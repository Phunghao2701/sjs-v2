import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import UserAccountForm from '../../components/account/UserAccountForm';
import { createAdminUser } from '../../api/adminUsers.api';
import ROUTES from '../../../../app/routes/routePaths';
import { Alert } from '../../../../shared/ui/alert';
import { PageHeader } from '../../../../shared/ui/page-layout';
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

  /**
   * Gọi API tạo tài khoản thay vì lưu mock trong Zustand.
   */
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
    <div className="container-fluid py-2 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Platform Directory', to: ROUTES.ADMIN_USERS },
          { label: 'User Directory', to: ROUTES.ADMIN_USERS },
          { label: 'New Account' }
        ]}
        title={t("admin.themTaiKhoanMoi")}
        description={t("admin.vuiLongDienDayDuCacThongTinBen")}
      />

      <div className="mx-auto" style={{
      maxWidth: '820px'
    }}>
        {/* Core Account Form card */}
        <Card className="p-4 p-md-5 rounded-4 border bg-white shadow-sm mb-4">
          {submitError && <Alert variant="destructive" className="mb-4">
              {submitError}
            </Alert>}

          <UserAccountForm isEdit={false} onSubmit={handleFormSubmit} onCancel={() => navigate(ROUTES.ADMIN_USERS)} submitting={submitting} />
        </Card>

        {/* Informational Feature Highlights (Page 17 bottom cards) */}
        <Row className="g-3 mb-5">
          <Col xs={12} md={4}>
            <Card className="p-4 border h-100 rounded-3" style={{
            backgroundColor: '#fef2f2',
            borderColor: '#fee2e2',
            boxShadow: 'none'
          }}>
              <div className="d-flex flex-column align-items-start gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fee2e2',
                color: '#ef4444'
              }}>
                  <Icon icon="lucide:mail" width="16" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1.5" style={{
                  fontSize: '14px',
                  color: '#7f1d1d'
                }}>{t("admin.thongBaoTuDong")}</h6>
                  <p className="small mb-0 lh-sm" style={{
                  fontSize: '13px',
                  color: '#991b1b',
                  opacity: 0.95
                }}>{t("admin.heThongSeTuDongGuiEmailKichHoa")}</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card className="p-4 border h-100 rounded-3" style={{
            backgroundColor: '#E6F3FA',
            borderColor: '#fed7aa',
            boxShadow: 'none'
          }}>
              <div className="d-flex flex-column align-items-start gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#E6F3FA',
                color: '#005A96'
              }}>
                  <Icon icon="lucide:shield-check" width="16" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1.5" style={{
                  fontSize: '14px',
                  color: '#9a3412'
                }}>{t("admin.phanQuyenThongMinh")}</h6>
                  <p className="small mb-0 lh-sm" style={{
                  fontSize: '13px',
                  color: '#9a3412',
                  opacity: 0.95
                }}>{t("admin.vaiTroXacDinhCacQuyenTruyCapVa")}</p>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card className="p-4 border h-100 rounded-3" style={{
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
            boxShadow: 'none'
          }}>
              <div className="d-flex flex-column align-items-start gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e2e8f0',
                color: '#64748b'
              }}>
                  <Icon icon="lucide:clock" width="16" />
                </div>
                <div>
                  <h6 className="fw-bold mb-1.5" style={{
                  fontSize: '14px',
                  color: '#1e293b'
                }}>{t("admin.lichSuThaoTac")}</h6>
                  <p className="small mb-0 lh-sm" style={{
                  fontSize: '13px',
                  color: '#475569',
                  opacity: 0.95
                }}>{t("admin.moiHanhDongTaoTaiKhoanDeuDuocG")}</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}