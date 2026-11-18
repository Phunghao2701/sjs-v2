import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { formatCount } from '../../../shared/utils/formatNumber';

export default function RecentProjectsCard({ projects = [], loading, error, onViewAll, onProjectClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const labels = {
    active: t('admin.hoatDong', 'Active'),
    new: 'New',
    paused: t('dashboard.tamDung', 'Paused'),
    archived: t('dashboard.luuTru', 'Archived'),
    deleted: 'Deleted'
  };

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:folder-open" width={16} className="shrink-0 text-primary" />
          <span>{t('dashboard.projectsGanDay', 'Recent Projects')}</span>
        </CardTitle>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-[11px] text-primary hover:text-primary-hover font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('dashboard.xemTatCa', 'See all')}</span>
            <Icon icon="lucide:arrow-right" width={13} />
          </button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        {loading ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-md bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={22} className="mx-auto mb-1.5" />
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center my-auto">
            <div className="size-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-2">
              <Icon icon="lucide:folder-plus" width={18} />
            </div>
            <p className="mb-0.5 text-xs font-semibold text-foreground">
              {t('dashboard.chuaCoProjectNao', 'No projects yet')}
            </p>
            <p className="m-0 text-[11px] text-muted-foreground mb-3 max-w-xs">
              {t('dashboard.taoProjectDauTienDeBatDauTheoD', 'Create your first project to start tracking.')}
            </p>
            <Button size="sm" onClick={() => navigate('/projects/create')} className="gap-1.5 text-xs h-7 px-3">
              <Icon icon="lucide:plus" width={13} />
              <span>{t('dashboard.taoProject', 'Create Project')}</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              {visibleProjects.map((project, i) => {
                const name = project.project_name ?? project.name ?? project.title ?? 'Untitled';
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0].toUpperCase())
                  .join('');
                const status = String(project.status ?? 'active').toLowerCase();
                const journalsCount = project.journal_count ?? project.journals?.length ?? 0;
                const articlesCount = project.article_count ?? 0;

                return (
                  <button
                    key={project.project_id ?? project.id ?? i}
                    type="button"
                    onClick={() => onProjectClick?.(project)}
                    className="flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-border/40 bg-surface px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted/40 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer group"
                  >
                    <span className="flex size-7.5 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[11px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors" title={name}>
                        {name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground mt-0.5">
                        {journalsCount} {t('project.tapChi', 'journals')} · {formatCount(articlesCount)} {t('author.baiBao', 'papers')}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {labels[status] ?? labels.active}
                    </span>
                  </button>
                );
              })}

              {visibleProjects.length < 3 && (
                <button
                  type="button"
                  onClick={() => navigate('/projects/create')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-[11px] font-medium text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary-subtle/20 transition-colors cursor-pointer"
                >
                  <Icon icon="lucide:plus" width={13} />
                  <span>{t('dashboard.taoProjectMoi', 'Create New Project')}</span>
                </button>
              )}
            </div>

            {/* Bottom grounded footer */}
            <div className="pt-2.5 mt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{t('dashboard.tongSoProject', 'Total projects')}</span>
              <span className="font-semibold text-foreground font-mono">{projects.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
