import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { cn } from '../../../lib/utils';

export default function JournalTabs({ activeTab, onTabChange }) {
  const { t } = useTranslation();

  const tabs = [
    { key: 'ranking', label: t("journal.hoatDongOpenAlex", "OpenAlex activity"), icon: 'lucide:bar-chart-3' },
    { key: 'volumes', label: 'Volumes & Issues', icon: 'lucide:book-open' },
    { key: 'articles', label: t("journal.baiBaoGanDay", "Bài báo gần đây"), icon: 'lucide:file-text' },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border mb-6 overflow-x-auto pb-px" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap',
              isActive
                ? 'border-primary text-primary bg-primary-subtle/30 rounded-t-lg'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon icon={tab.icon} width="16" height="16" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
