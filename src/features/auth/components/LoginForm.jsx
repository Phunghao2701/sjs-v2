import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import InputField from '../../../shared/components/InputField';
import PasswordInput from './PasswordInput';
import CheckboxField from './CheckboxField';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';

export default function LoginForm({
  onSubmit,
  isLoading,
  apiError
}) {
  const { t } = useTranslation();
  const devAccounts = import.meta.env.DEV
    ? [
        {
          label: 'Login as User',
          email: import.meta.env.VITE_DEV_USER_EMAIL,
          password: import.meta.env.VITE_DEV_USER_PASSWORD,
        },
        {
          label: 'Login as Admin',
          email: import.meta.env.VITE_DEV_ADMIN_EMAIL,
          password: import.meta.env.VITE_DEV_ADMIN_PASSWORD,
        },
      ].filter(({ email, password }) => email && password)
    : [];
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_login: true
  });
  const [errors, setErrors] = useState({});

  // Pre-fill email if remember_login was active in previous sessions
  useEffect(() => {
    const savedEmail = localStorage.getItem('researchpulse_remembered_email');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        remember_login: true
      }));
    }
  }, []);

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'email':
        if (!value.trim()) {
          errorMsg = t("auth.emailKhongDuocDeTrong");
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMsg = t("auth.emailKhongDungDinhDang");
        }
        break;
      case 'password':
        if (!value) {
          errorMsg = t("auth.matKhauKhongDuocDeTrong");
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
    return !errorMsg;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleBlur = e => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    validateField(name, val);
  };

  const handleSubmit = e => {
    e.preventDefault();

    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    if (!emailValid || !passwordValid) return;
    onSubmit({
      email: formData.email.trim(),
      password: formData.password,
      remember_login: formData.remember_login
    });
  };

  const handleQuickLogin = account => {
    if (isLoading) return;
    onSubmit({
      email: account.email,
      password: account.password,
      remember_login: true,
    });
  };

  const rememberLabel = (
    <span className="text-xs font-semibold select-none text-foreground">
      {t("auth.ghiNhoDangNhap")}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Email Input */}
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={t("auth.nameemailcom")}
        error={errors.email}
        icon="lucide:mail"
        required
        disabled={isLoading}
      />

      {/* Password Input */}
      <div className="relative mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-bold mb-0 flex items-center gap-1 uppercase tracking-wider text-foreground">
            {t("auth.matKhau")}<span className="text-destructive">*</span>
          </label>
          <a
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={e => {
              e.preventDefault();
              window.location.href = '/forgot-password';
            }}
          >
            {t("auth.quenMatKhau")}
          </a>
        </div>
        <PasswordInput
          label={null}
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("admin.key")}
          error={errors.password}
          required
          disabled={isLoading}
        />
      </div>

      {/* Remember Login Checkbox */}
      <CheckboxField
        name="remember_login"
        checked={formData.remember_login}
        onChange={handleChange}
        labelMarkup={rememberLabel}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <SubmitButton isLoading={isLoading} loadingText={t("auth.dangDangNhap")} label={t("signIn")} />

      {devAccounts.length > 0 && (
        <div className="flex gap-2 mt-2">
          {devAccounts.map(account => (
            <Button
              key={account.label}
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleQuickLogin(account)}
              disabled={isLoading}
            >
              {account.label}
            </Button>
          ))}
        </div>
      )}
    </form>
  );
}
