import { useTranslation } from 'react-i18next';

export default function ChartRangeDropdown({ value, onChange }) {
  const { t } = useTranslation();
  return <label className="inline-flex items-center">
    <span className="sr-only">{t('dashboard.khoangThoiGian')}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-7 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-foreground font-medium transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
    >
      <option value="5">{t('dashboard.5NamGanNhat')}</option>
      <option value="10">{t('dashboard.10NamGanNhat')}</option>
      <option value="all">{t('dashboard.tatCa')}</option>
    </select>
  </label>;
}
