import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';

export default function QuickAccessGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();

  const items = [
    {
      icon: 'lucide:search',
      label: t('search', 'Search & Discover'),
      desc: t('dashboard.khamPhaBaiBaoDeTai', 'Search papers & journals'),
      path: `/${lang}/search`,
      iconBg: 'bg-primary-subtle text-primary'
    },
    {
      icon: 'lucide:file-text',
      label: t('articles', 'Articles Directory'),
      desc: t('dashboard.xepHangQ1q4KhoaHoc', 'Browse indexed publications'),
      path: `/${lang}/articles`,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      icon: 'lucide:globe',
      label: t('geography', 'Geographic Distribution'),
      desc: t('dashboard.banDoPhanBoTacGia', 'Global research output map'),
      path: `/${lang}/geography`,
      iconBg: 'bg-success-subtle text-success'
    },
    {
      icon: 'lucide:trophy',
      label: 'Leaderboard',
      desc: t('dashboard.xepHangTacGiaNoiBat', 'Top contributing researchers'),
      path: `/${lang}/authors`,
      iconBg: 'bg-warning-subtle text-warning'
    },
  ];

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:zap" width={16} className="text-primary" />
          <span>{t('dashboard.truyCapNhanh', 'Quick Access')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.icon}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border/50 bg-surface p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-surface-muted/40 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer group"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                  <Icon icon={item.icon} width={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-[11px] leading-snug text-muted-foreground truncate">
                    {item.desc}
                  </span>
                </span>
              </div>
              <Icon icon="lucide:chevron-right" width={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>

        {/* Bottom grounded footer */}
        <div className="pt-2.5 mt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{t('dashboard.phimTatHeThong', 'Navigation Shortcuts')}</span>
          <span className="font-semibold text-foreground font-mono">4 {t('dashboard.chucNang', 'modules')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
