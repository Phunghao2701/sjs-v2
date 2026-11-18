import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\RegisterForm.jsx
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import InputField from '../../../shared/components/InputField';
import PasswordInput from './PasswordInput';
import DateInput from './DateInput';
import GenderSelect from './GenderSelect';
import RoleSelect from './RoleSelect';
import CheckboxField from './CheckboxField';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';

export default function RegisterForm({
  onSubmit,
  isLoading,
  apiError
}) {
  const { t: _t } = useTranslation();
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: true,
    role: 'STUDENT',
    terms: false
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'last_name':
        if (!value.trim()) {
          errorMsg = t("auth.hoKhongDuocDeTrong");
        }
        break;
      case 'first_name':
        if (!value.trim()) {
          errorMsg = t("auth.tenKhongDuocDeTrong");
        }
        break;
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
        } else if (value.length < 8) {
          errorMsg = t("auth.matKhauPhaiToiThieu8KyTu");
        }
        break;
      case 'date_of_birth':
        if (!value) {
          errorMsg = t("auth.ngaySinhKhongDuocDeTrong");
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          if (selectedDate > today) {
            errorMsg = t("auth.ngaySinhKhongHopLe");
          }
        }
        break;
      case 'terms':
        if (!value) {
          errorMsg = t("auth.vuiLongDongYYeuCau");
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

    const fieldsToValidate = ['last_name', 'first_name', 'email', 'password', 'date_of_birth', 'terms'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    });
    if (!isValid) return;

    const payload = {
      ...formData
    };
    delete payload.terms;
    onSubmit({
      ...payload,
      last_name: payload.last_name.trim(),
      first_name: payload.first_name.trim()
    });
  };

  const termsLabel = (
    <span className="inline-flex flex-wrap items-center gap-1">
      {t("auth.toiDongYVoi")}{' '}
      <a href="#" className="text-primary hover:underline font-medium" onClick={e => e.preventDefault()}>
        {t("auth.dieuKhoanDichVu")}
      </a>{' '}
      {t("article.va")}{' '}
      <a href="#" className="text-primary hover:underline font-medium" onClick={e => e.preventDefault()}>
        {t("auth.chinhSachBaoMat")}
      </a>
    </span>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Row: Last Name & First Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <InputField label={t("auth.ho", "Last Name")} name="last_name" value={formData.last_name} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nguyen")} error={errors.last_name} required disabled={isLoading} />
        </div>
        <div>
          <InputField label={t("auth.ten", "First Name")} name="first_name" value={formData.first_name} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.vanA")} error={errors.first_name} required disabled={isLoading} />
        </div>
      </div>

      {/* Email */}
      <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nameemailcom")} error={errors.email} icon="lucide:mail" required disabled={isLoading} />

      {/* Password */}
      <PasswordInput label={t("auth.matKhau")} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.toiThieu8KyTu")} error={errors.password} required disabled={isLoading} />

      {/* Row: Date of Birth & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <DateInput label={t("auth.ngaySinh")} name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} onBlur={handleBlur} error={errors.date_of_birth} required disabled={isLoading} />
        </div>
        <div>
          <GenderSelect label={t("auth.gioiTinh")} name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} required disabled={isLoading} />
        </div>
      </div>

      {/* Role Selector */}
      <RoleSelect label={t("auth.vaiTro")} name="role" value={formData.role} onChange={handleChange} error={errors.role} required disabled={isLoading} />

      {/* Terms Checkbox */}
      <CheckboxField name="terms" checked={formData.terms} onChange={handleChange} error={errors.terms} labelMarkup={termsLabel} disabled={isLoading} />

      {/* Submit Button */}
      <SubmitButton isLoading={isLoading} loadingText={t("auth.dangTaoTaiKhoan")} label={t("auth.taoTaiKhoan")} />

      {/* Link Redirect to Login */}
      <div className="text-center mt-4 text-sm font-medium">
        <span className="text-muted-foreground">{t("auth.daCoTaiKhoan")}</span>{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline font-semibold">{t("signIn")}</Link>
      </div>
    </form>
  );
}
