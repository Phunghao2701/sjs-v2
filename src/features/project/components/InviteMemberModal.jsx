import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Icon } from '@iconify/react';

const InviteMemberModal = ({ show, onHide, onInvite, actionLoading }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await onInvite(email, role);
    setEmail('');
    setRole('MEMBER');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Icon icon="lucide:user-plus" width="20" className="text-primary" aria-hidden="true" />
          <span>{t("project.moiThanhVienMoi", "Mời thành viên mới")}</span>
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="inviteEmail" className="block text-xs font-medium text-muted-foreground">
              {t("project.diaChiEmail", "Địa chỉ Email")} <span className="text-danger">*</span>
            </label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder={t("project.nhapEmailNguoiMuonMoi", "Nhập email người dùng...")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={actionLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inviteRole" className="block text-xs font-medium text-muted-foreground">
              {t("project.vaiTro", "Quyền hạn")}
            </label>
            <select
              id="inviteRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={actionLoading}
              className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="VIEWER">Viewer ({t("project.nguoiXem", "Người xem")})</option>
              <option value="MEMBER">Member ({t("project.thanhVien", "Thành viên")})</option>
              <option value="ADMIN">Admin ({t("project.quanTriVien", "Quản trị viên")})</option>
              <option value="OWNER">Owner ({t("project.chuSoHuu", "Chủ sở hữu")})</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onHide}
            disabled={actionLoading}
          >
            {t("admin.huy", "Hủy")}
          </Button>
          <Button
            type="submit"
            disabled={!email || actionLoading}
            isLoading={actionLoading}
            loadingText={t("admin.dangXuLy", "Đang xử lý...")}
          >
            {t("project.guiLoiMoi", "Gửi lời mời")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
