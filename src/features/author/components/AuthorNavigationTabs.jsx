import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../../shared/components/Icon';
import { cn } from '../../../lib/utils';

export default function AuthorNavigationTabs({ activeTab, rightContent, children }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();
  const base = `/${lang}`;

  const tabs = [
    { key: 'list', label: t("author.danhSachTacGia", "Authors Directory"), icon: 'lucide:users', path: `${base}/authors` },
    { key: 'leaderboard', label: t("author.bangXepHang", "Leaderboard"), icon: 'lucide:trophy', path: `${base}/authors/leaderboard` },
  ];

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-control transition-colors border cursor-pointer",
                isActive
                  ? "bg-primary-subtle text-primary border-primary/30"
                  : "border-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon icon={tab.icon} width={15} />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
      {(rightContent || children) && (
        <div className="flex items-center gap-2 shrink-0">
          {rightContent || children}
        </div>
      )}
    </div>
  );
}