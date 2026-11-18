import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { cn } from '../../../lib/utils';

export default function AuthorNavigationTabs({ activeTab }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();
  const base = `/${lang}`;

  const tabs = [
    { key: 'list', label: t("author.danhSachTacGia", "Authors Directory"), icon: 'lucide:users', path: `${base}/authors` },
    { key: 'leaderboard', label: t("author.bangXepHang", "Leaderboard"), icon: 'lucide:trophy', path: `${base}/authors/leaderboard` },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border pb-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-control transition-colors border",
              isActive
                ? "bg-primary-subtle text-primary border-primary/30"
                : "border-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            )}
          >
            <Icon icon={tab.icon} width={15} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}