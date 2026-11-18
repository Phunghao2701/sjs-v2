import { useTranslation } from "react-i18next";
/**
* File source thuộc hệ thống FE ResearchPulse.
*
* File: features\auth\components\SubmitButton.jsx
*/
import { Button } from '../../../shared/ui/button';
export default function SubmitButton({
  type = 'submit',
  disabled = false,
  isLoading = false,
  loadingText,
  label,
  onClick
}) {
  const {
    t
  } = useTranslation();
  const resolvedLabel = label || t("auth.xacNhan");
  const resolvedLoadingText = loadingText || t("admin.dangXuLy");
  return <Button type={type} disabled={disabled} isLoading={isLoading} loadingText={resolvedLoadingText} onClick={onClick} className="w-100">
      {resolvedLabel}
    </Button>;
}
