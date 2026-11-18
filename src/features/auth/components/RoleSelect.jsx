import { useTranslation } from "react-i18next";
import Icon from '../../../shared/components/Icon';

export default function RoleSelect({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) {
  const { t } = useTranslation();

  const roles = [
    {
      key: 'STUDENT',
      label: t("auth.sinhVien"),
      desc: t("auth.dangDiHoc"),
      icon: 'lucide:graduation-cap'
    },
    {
      key: 'LECTURER',
      label: t("auth.giangVien"),
      desc: t("auth.dangGiangDay"),
      icon: 'lucide:user-check'
    },
    {
      key: 'RESEARCHER',
      label: t("auth.nhaNghienCuu"),
      desc: t("auth.dangLamViec"),
      icon: 'lucide:flask-conical'
    }
  ];

  const handleSelect = roleKey => {
    if (disabled) return;
    onChange({
      target: {
        name,
        value: roleKey
      }
    });
  };

  return (
    <div className="mb-4">
      {label && (
        <label 
          className="text-xs font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wider text-foreground"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="grid grid-cols-3 gap-3">
        {roles.map(role => {
          const isSelected = value === role.key;
          return (
            <button
              key={role.key}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(role.key)}
              className={`w-full p-3 rounded-lg text-center flex flex-col items-center justify-center gap-2 select-none border transition-colors min-h-[110px] ${
                isSelected
                  ? 'border-primary bg-primary-subtle/20 shadow-xs'
                  : 'border-border bg-surface hover:border-primary/50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div 
                className={`flex items-center justify-center rounded-full size-8 transition-colors ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon icon={role.icon} width="22" />
              </div>
              <div>
                <div 
                  className={`text-xs ${isSelected ? 'font-bold text-primary' : 'font-semibold text-foreground'}`}
                >
                  {role.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {role.desc}
                </div>
              </div>
            </button>
          );
        })}
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
