import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\GenderSelect.jsx
 */
import Icon from '../../../shared/components/Icon';

export default function GenderSelect({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) {
  const { t } = useTranslation();

  const handleSelect = val => {
    if (disabled) return;
    onChange({
      target: {
        name,
        value: val
      }
    });
  };

  return (
    <div className="mb-3">
      {label && (
        <label 
          className="text-xs font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wider text-foreground"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div 
        className="p-1 rounded-lg flex items-center w-full h-11 border border-border bg-muted/40"
      >
        {/* Option: Male */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(true)}
          className={`gender-option flex-1 h-full flex items-center justify-center gap-2 rounded-md select-none text-sm transition-all border ${
            value === true
              ? 'bg-surface text-primary font-semibold border-primary/20 shadow-xs'
              : 'bg-transparent text-muted-foreground font-medium border-transparent hover:text-foreground'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Icon
            icon="lucide:check-circle"
            width="16"
            className={value === true ? 'opacity-100' : 'opacity-0'}
          />
          <span>{t("auth.nam")}</span>
        </button>

        {/* Option: Female */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(false)}
          className={`gender-option flex-1 h-full flex items-center justify-center gap-2 rounded-md select-none text-sm transition-all border ${
            value === false
              ? 'bg-surface text-primary font-semibold border-primary/20 shadow-xs'
              : 'bg-transparent text-muted-foreground font-medium border-transparent hover:text-foreground'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Icon
            icon="lucide:check-circle"
            width="16"
            className={value === false ? 'opacity-100' : 'opacity-0'}
          />
          <span>{t("auth.nu")}</span>
        </button>
      </div>

      {error && (
        <div 
          className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium animate-fade-in"
        >
          <Icon icon="lucide:alert-circle" width="12" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
