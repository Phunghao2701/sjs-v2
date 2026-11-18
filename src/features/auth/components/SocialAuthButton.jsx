import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\SocialAuthButton.jsx
 */
import { Button } from '../../../shared/ui/button';
import Icon from '../../../shared/components/Icon';

export default function SocialAuthButton({
  onClick,
  disabled = false,
  label
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("auth.dangNhapBangSso");

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-surface text-foreground hover:bg-muted/50 text-sm font-semibold transition-colors"
    >
      <Icon icon="lucide:shield-check" width="18" />
      <span>{resolvedLabel}</span>
    </Button>
  );
}
