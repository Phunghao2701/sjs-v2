import { useTranslation } from "react-i18next";

/**
 * PasswordFields Component
 * Renders current password, new password, and confirmation password input boxes.
 */
export default function PasswordFields({
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  isEdit = true
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className={`grid grid-cols-1 md:grid-cols-${isEdit ? '3' : '2'} gap-4`}>
        {/* Current Password - Only required for updating existing profile */}
        {isEdit && (
          <div>
            <label htmlFor="currentPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              placeholder={t("admin.key")}
              value={currentPassword}
              onChange={e => onCurrentPasswordChange(e.target.value)}
              className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* New Password field */}
        <div>
          <label htmlFor="newPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            {isEdit ? 'New Password' : 'Password *'}
          </label>
          <input
            id="newPassword"
            type="password"
            placeholder={isEdit ? 'Min. 12 chars' : 'Create a strong password'}
            value={newPassword}
            onChange={e => onNewPasswordChange(e.target.value)}
            required={!isEdit}
            className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            {isEdit ? 'Confirm New Password' : 'Confirm Password *'}
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder={isEdit ? 'Repeat new password' : 'Confirm password'}
            value={confirmPassword}
            onChange={e => onConfirmPasswordChange(e.target.value)}
            required={!isEdit}
            className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
