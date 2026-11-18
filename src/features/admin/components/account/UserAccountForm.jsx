import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import PrimaryButton from '../../../../shared/components/Button/PrimaryButton';
import { SYSTEM_ROLES } from '../../../../shared/constants/systemConstants';

const getUserInitial = (name = '', email = '') => {
  const source = String(name || email || 'U').trim();
  return source.charAt(0).toUpperCase() || 'U';
};

/**
 * UserAccountForm Component
 * Unified form for adding new user accounts or updating profile details.
 */
export default function UserAccountForm({
  initialData = {},
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false
}) {
  const { t: _t } = useTranslation();
  // Form fields states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState(isEdit ? 'RESEARCHER' : '');
  const [status, setStatus] = useState('Active');

  // Passwords states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation / status feedback
  const [error, setError] = useState('');

  // Load initialData if editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFirstName(initialData.first_name || '');
      setLastName(initialData.last_name || '');
      setFullName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setInstitution(initialData.institution || '');
      setRole(initialData.role || 'RESEARCHER');
      setStatus(initialData.status || 'Active');
    }
  }, [isEdit, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isEdit) {
      if (!fullName.trim()) {
        setError(t("admin.vuiLongNhapDayDuHoVaTen"));
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setError(t("admin.vuiLongNhapDayDuHoVaTen"));
        return;
      }
    }

    if (!email.trim()) {
      setError(t("admin.vuiLongNhapDiaChiEmail"));
      return;
    }

    if (!role) {
      setError(t("admin.vuiLongChonVaiTro"));
      return;
    }

    if (!isEdit) {
      if (!newPassword) {
        setError(t("admin.vuiLongNhapMatKhau"));
        return;
      }
      if (newPassword.length < 8) {
        setError(t("admin.matKhauPhaiCoItNhat8KyTu"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t("admin.xacNhanMatKhauKhongKhop"));
        return;
      }
    } else if (newPassword) {
      if (newPassword.length < 8) {
        setError(t("admin.matKhauMoiPhaiCoItNhat8KyTu"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t("admin.xacNhanMatKhauMoiKhongKhop"));
        return;
      }
    }

    const payload = {
      email: email.trim(),
      phone: phone.trim(),
      institution: institution.trim(),
      role,
      status
    };

    if (isEdit) {
      payload.name = fullName.trim();
      const parts = fullName.trim().split(' ');
      payload.first_name = parts[0] || '';
      payload.last_name = parts.slice(1).join(' ') || '';
      if (newPassword) {
        payload.password = newPassword;
      }
    } else {
      payload.first_name = firstName.trim();
      payload.last_name = lastName.trim();
      payload.name = `${firstName.trim()} ${lastName.trim()}`;
      payload.password = newPassword;
    }

    onSubmit(payload);
  };

  const displayName = isEdit ? fullName : `${firstName} ${lastName}`.trim();
  const avatarInitial = getUserInitial(displayName, email);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 py-2.5 px-3.5 text-xs rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Profile identity section */}
      {isEdit && (
        <div className="flex items-center gap-4 py-3 border-b border-border">
          <div 
            className="size-20 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 text-xl shadow-md bg-gradient-to-br from-primary to-primary-hover"
            aria-label={`Avatar chữ cái đầu của ${displayName || email || t("admin.nguoiDung")}`}
          >
            {avatarInitial}
          </div>
          <div>
            <div className="font-bold text-foreground text-base mb-1">{fullName || t("admin.chuaCoTenNguoiDung")}</div>
            <div className="text-muted-foreground text-xs">{t("admin.hienThiAvatarBangChuCaiDauCuaN")}</div>
          </div>
        </div>
      )}

      {/* Section 1: Personal Information */}
      <div>
        <h6 className="font-bold flex items-center gap-2 mb-4 tracking-wider uppercase text-xs text-primary">
          <Icon icon="lucide:user" width="16" />
          {t("admin.thongTinCaNhan")}
        </h6>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isEdit ? (
            <div>
              <label htmlFor="fullName" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                {t("admin.hoVaTen")}<span className="text-destructive">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder={t("admin.viDuNguyenVanA")}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="firstName" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  {t("admin.ho")}<span className="text-destructive">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder={t("admin.viDuNguyen")}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  {t("admin.ten")}<span className="text-destructive">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder={t("admin.viDuVanA")}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="emailAddress" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              {t("admin.diaChiEmail")}<span className="text-destructive">*</span>
            </label>
            <input
              id="emailAddress"
              type="email"
              placeholder={t("admin.nameuniversityeduvn")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Phone field */}
          <div>
            <label htmlFor="phoneNumber" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              {t("admin.soDienThoai")}
            </label>
            <input
              id="phoneNumber"
              type="text"
              placeholder={t("admin.0901234567")}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Institution field */}
          {isEdit && (
            <div>
              <label htmlFor="institution" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                {t("admin.donViTruongDaiHoc")}
              </label>
              <input
                id="institution"
                type="text"
                placeholder={t("admin.oxfordUniversityPress")}
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Role & Status */}
      <div className="pt-4 border-t border-border">
        <h6 className="font-bold flex items-center gap-2 mb-4 tracking-wider uppercase text-xs text-primary">
          <Icon icon="lucide:shield" width="16" />
          {t("admin.vaiTroTrangThai")}
        </h6>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Role select */}
          <div>
            <label htmlFor="platformRole" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              {t("admin.vaiTroTrenNenTang")}<span className="text-destructive">*</span>
            </label>
            <select
              id="platformRole"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              required
            >
              <option value="" disabled hidden>{t("admin.chonVaiTro")}</option>
              {SYSTEM_ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status switch toggle container */}
          <div>
            <label className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5 opacity-0 pointer-events-none md:block hidden">
              Status
            </label>
            <div className="flex items-center justify-between px-3 rounded-lg h-10 bg-muted/40 border border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t("admin.trangThaiTaiKhoan")}</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status-toggle"
                  checked={status === 'Active'}
                  onChange={e => setStatus(e.target.checked ? 'Active' : 'Inactive')}
                  className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="status-toggle" className="text-xs font-bold text-foreground cursor-pointer select-none">
                  {status === 'Active' ? t("admin.hoatDong") : t("admin.voHieuHoa")}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Identity & Password */}
      <div className="pt-4 border-t border-border">
        <h6 className="font-bold flex items-center gap-2 mb-4 tracking-wider uppercase text-xs text-primary">
          <Icon icon="lucide:lock" width="16" />
          {t("admin.thongTinDangNhap")}
        </h6>
        
        <div className={`grid grid-cols-1 md:grid-cols-${isEdit ? '3' : '2'} gap-4`}>
          {/* Current Password */}
          {isEdit && (
            <div>
              <label htmlFor="currentPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                {t("admin.matKhauHienTai")}
              </label>
              <input
                id="currentPassword"
                type="password"
                placeholder={t("admin.key")}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* New Password field */}
          <div>
            <label htmlFor="newPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              {isEdit ? t("admin.matKhauMoi") : t("admin.matKhauMoi1")}
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder={t("admin.key1")}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required={!isEdit}
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              {isEdit ? t("admin.xacNhanMatKhau") : t("admin.xacNhanMatKhau1")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder={t("admin.key1")}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required={!isEdit}
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="text-muted-foreground mt-2 text-xs">
          {t("admin.matKhauPhaiChuaItNhat8KyTuBaoG")}
        </div>
      </div>

      {/* Form Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <PrimaryButton type="button" variant="outline" onClick={onCancel} className="px-5 py-2">
          {t("admin.huy")}
        </PrimaryButton>
        
        <PrimaryButton type="submit" className="px-5 py-2" disabled={submitting}>
          {submitting ? (
            <>
              <Icon icon="lucide:loader-2" width="16" />
              <span>{t("admin.dangXuLy")}</span>
            </>
          ) : isEdit ? (
            <>
              <Icon icon="lucide:save" width="16" />
              <span>{t("admin.luuThayDoi")}</span>
            </>
          ) : (
            <>
              <Icon icon="lucide:user-plus" width="16" />
              <span>{t("admin.themTaiKhoan")}</span>
            </>
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}
