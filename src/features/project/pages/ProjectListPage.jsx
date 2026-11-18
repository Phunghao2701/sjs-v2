import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { Icon } from '@iconify/react';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Card } from '../../../shared/ui/card';
import useAuth from '../../auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { MotionPage, MotionGrid, MotionItem, fadeUp } from '../../../shared/ui/motion';
import { getSubjectAreasApi } from '../../catalog/api/catalogApi';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    isLoading,
    error,
    deleteProject,
    restoreProject,
    refetch,
  } = useProjects();
  const [areas, setAreas] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELETED'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'keywords'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [confirmModal, setConfirmModal] = useState({ show: false, projectId: null, action: null });
  const { t } = useTranslation();
  const auth = useAuth();
  const currentUser = auth?.user;

  // Preload subject areas catalogue for clean label mapping
  useEffect(() => {
    let isMounted = true;
    getSubjectAreasApi({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.data?.items || res?.data?.data || res?.data || [];
        if (Array.isArray(list)) setAreas(list);
      })
      .catch((err) => {
        console.warn('Could not preload subject areas catalogue:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Read recently viewed project IDs from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recently_viewed_projects');
      if (raw) {
        setRecentIds(JSON.parse(raw));
      }
    } catch (e) {
      console.error(t("project.loiDocDuAnXemGanDay"), e);
    }
  }, [t]);

  const handleDelete = (id) => {
    setConfirmModal({ show: true, projectId: id, action: 'delete' });
  };

  const executeDelete = async () => {
    if (!confirmModal.projectId) return;
    const id = confirmModal.projectId;
    setConfirmModal({ show: false, projectId: null, action: null });
    try {
      await deleteProject(id);
      const storageKey = 'recently_viewed_projects';
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const list = JSON.parse(raw).filter((recentId) => String(recentId) !== String(id));
        localStorage.setItem(storageKey, JSON.stringify(list));
        setRecentIds(list);
      }
    } catch (err) {
      alert(err.message || t("project.khongTheXoaDuAn"));
    }
  };

  const handleRestore = (id) => {
    setConfirmModal({ show: true, projectId: id, action: 'restore' });
  };

  const executeRestore = async () => {
    if (!confirmModal.projectId) return;
    const id = confirmModal.projectId;
    setConfirmModal({ show: false, projectId: null, action: null });
    try {
      await restoreProject(id);
    } catch (err) {
      alert(err.message || "Không thể khôi phục dự án");
    }
  };

  // Helper to resolve area name for chips
  const resolveAreaNameFor = (p) => {
    if (p.subject_area && typeof p.subject_area === 'object') {
      return p.subject_area.name || p.subject_area.display_name || 'General Science';
    }
    const rawVal = p.subject_area || p.subject_area_id;
    if (!rawVal) return 'General Science';
    if (areas?.length) {
      const found = areas.find((a) => String(a.id || a.subject_area_id) === String(rawVal));
      if (found) return found.name || found.display_name;
    }
    if (!isNaN(rawVal)) return `Area #${rawVal}`;
    return String(rawVal);
  };

  // KPI Calculations
  const nonDeletedProjects = useMemo(() => projects.filter((p) => p.status !== 'DELETED'), [projects]);
  const deletedProjects = useMemo(() => projects.filter((p) => p.status === 'DELETED'), [projects]);
  const activeProjectsCount = useMemo(
    () => nonDeletedProjects.filter((p) => p.status === 'ACTIVE' || (!p.status && p.status !== 'INACTIVE')).length,
    [nonDeletedProjects]
  );
  const totalKeywordsMonitored = useMemo(() => {
    return nonDeletedProjects.reduce((sum, p) => {
      const count = p.keywords_count || p.watch_keywords?.length || 0;
      return sum + count;
    }, 0);
  }, [nonDeletedProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (statusFilter === 'ACTIVE') {
          return p.status === 'ACTIVE' || (p.status !== 'DELETED' && p.status !== 'INACTIVE');
        }
        if (statusFilter === 'DELETED') {
          return p.status === 'DELETED';
        }
        return p.status !== 'DELETED';
      })
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(term);
        const areaStr =
          (typeof p.subject_area === 'object' ? p.subject_area?.name || p.subject_area?.display_name : p.subject_area) || '';
        const areaMatch = String(areaStr).toLowerCase().includes(term);
        const keywordMatch = (p.watch_keywords || []).some((kw) => (kw.keyword || kw || '').toLowerCase().includes(term));
        return titleMatch || areaMatch || keywordMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'keywords') {
          const countA = a.keywords_count || a.watch_keywords?.length || 0;
          const countB = b.keywords_count || b.watch_keywords?.length || 0;
          return countB - countA;
        }
        return 0;
      });
  }, [projects, statusFilter, searchTerm, sortBy]);

  // Recent projects
  const recentProjects = useMemo(() => {
    return recentIds
      .map((id) => nonDeletedProjects.find((p) => String(p.project_id || p.id) === String(id)))
      .filter(Boolean);
  }, [recentIds, nonDeletedProjects]);

  return (
    <PageContainer>
      <MotionPage className="space-y-6">
        {/* 1. Header with Breadcrumb & Primary Action Button */}
        <PageHeader
          breadcrumbs={[
            { label: 'Workspace', to: ROUTES.DASHBOARD },
            { label: 'Research Projects' }
          ]}
          title={t("project.duAnNghienCuuCuaToi", "My Research Projects")}
          description={t("project.quanLyCacKeywordWatchlistsPhan", "Manage keyword watch-lists, analyze publishing trends and monitor scientific articles.")}
          actions={
            <Button onClick={() => navigate(ROUTES.PROJECT_CREATE)} size="default" className="gap-2 shrink-0">
              <Icon icon="lucide:plus" width={16} aria-hidden="true" />
              <span>{t("project.taoDuAnMoi", "Create Project")}</span>
            </Button>
          }
        />

        {/* 2. Exactly 3 KPI Metric Cards (as in proposed wireframe) */}
        <MotionGrid staggerDelay={0.04} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* KPI 1: Total Projects */}
          <MotionItem>
            <Card className="p-3 sm:p-3.5 border-border bg-surface shadow-xs h-full">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0">
                  Total Projects
                </p>
                <p className="text-xl font-bold tracking-tight text-foreground m-0 leading-none">
                  {nonDeletedProjects.length}
                </p>
                <p className="text-[11px] text-muted-foreground m-0">
                  In your workspace
                </p>
              </div>
            </Card>
          </MotionItem>

          {/* KPI 2: Active Monitoring */}
          <MotionItem>
            <Card className="p-3 sm:p-3.5 border-border bg-surface shadow-xs h-full">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0">
                  Active Monitoring
                </p>
                <p className="text-xl font-bold tracking-tight text-success m-0 leading-none">
                  {activeProjectsCount}
                </p>
                <p className="text-[11px] text-muted-foreground m-0">
                  Live feeds enabled
                </p>
              </div>
            </Card>
          </MotionItem>

          {/* KPI 3: Keywords */}
          <MotionItem>
            <Card className="p-3 sm:p-3.5 border-border bg-surface shadow-xs h-full">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0">
                  Keywords
                </p>
                <p className="text-xl font-bold tracking-tight text-foreground m-0 leading-none">
                  {totalKeywordsMonitored}
                </p>
                <p className="text-[11px] text-muted-foreground m-0">
                  Across all watchlists
                </p>
              </div>
            </Card>
          </MotionItem>
        </MotionGrid>

      {/* 3. Toolbar: [ 🔍 Search projects... ] [ Filter: Status ▾ ] [ Sort ▾ ] [ ⊞ ☰ ] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Left: Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon="lucide:search"
            width="16"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 transition-colors"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <Icon icon="lucide:x" width="14" />
            </button>
          )}
        </div>

        {/* Right: Status Filter + Sort + View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-control border border-border bg-surface text-xs font-medium text-foreground focus-visible:outline-none focus-visible:border-primary cursor-pointer shadow-xs"
              aria-label="Filter status"
            >
              <option value="ALL">Status: All ({nonDeletedProjects.length})</option>
              <option value="ACTIVE">Status: Active ({activeProjectsCount})</option>
              {deletedProjects.length > 0 && (
                <option value="DELETED">Status: Deleted ({deletedProjects.length})</option>
              )}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-control border border-border bg-surface text-xs font-medium text-foreground focus-visible:outline-none focus-visible:border-primary cursor-pointer shadow-xs"
              aria-label="Sort order"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="title">Sort: Name (A-Z)</option>
              <option value="keywords">Sort: Most Keywords</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-control bg-surface-muted p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-control transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <Icon icon="lucide:layout-grid" width="16" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-control transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List view"
              aria-label="List view"
            >
              <Icon icon="lucide:list" width="16" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENTLY ACCESSED (Quick Chips / Mini Bento Cards as in wireframe) */}
      {recentProjects.length > 0 && !searchTerm && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground m-0 flex items-center gap-1.5">
            <Icon icon="lucide:clock-4" width="14" className="text-primary" />
            <span>RECENTLY ACCESSED</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {recentProjects.map((p) => (
              <Link
                key={`recent-chip-${p.project_id || p.id}`}
                to={`/projects/${p.project_id || p.id}`}
                className="group inline-flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 shadow-2xs no-underline !no-underline"
              >
                <div className="size-5 rounded bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <Icon icon="lucide:folder" width={12} />
                </div>
                <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">
                  {p.title}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground bg-surface-muted px-1.5 py-0.5 rounded truncate max-w-[130px]">
                  {resolveAreaNameFor(p)}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : 'Recently'}
                </span>
                <Icon icon="lucide:arrow-right" width={12} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. ALL PROJECTS (Grid / List) */}
      <div className="space-y-4">
        <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Icon icon="lucide:folder-kanban" width="16" className="text-primary" />
          <span>
            {statusFilter === 'DELETED' ? 'DELETED PROJECTS' : 'ALL PROJECTS'} ({filteredAndSortedProjects.length})
          </span>
        </h3>

        {error ? (
          <StatePanel
            variant="error"
            title="Error Loading Projects"
            description={error}
            action={{
              label: "Try again",
              onClick: () => refetch(),
            }}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="border-t border-border pt-3">
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <StatePanel
            variant="neutral"
            icon={<Icon icon="lucide:search-x" width="36" className="text-muted-foreground" />}
            title="No projects found"
            description="Try adjusting your search query or filters."
            action={
              searchTerm
                ? {
                    label: "Clear search",
                    onClick: () => setSearchTerm(''),
                  }
                : undefined
            }
          />
        ) : viewMode === 'grid' ? (
          <MotionGrid staggerDelay={0.03} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedProjects.map((project) => (
              <MotionItem key={project.project_id || project.id}>
                <ProjectCard
                  project={project}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  currentUser={currentUser}
                  areas={areas}
                  viewMode="grid"
                />
              </MotionItem>
            ))}
          </MotionGrid>
        ) : (
          <MotionGrid staggerDelay={0.03} className="flex flex-col gap-3">
            {filteredAndSortedProjects.map((project) => (
              <MotionItem key={project.project_id || project.id}>
                <ProjectCard
                  project={project}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  currentUser={currentUser}
                  areas={areas}
                  viewMode="list"
                />
              </MotionItem>
            ))}
          </MotionGrid>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, projectId: null, action: null })}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-base font-semibold text-foreground">
            {confirmModal.action === 'delete' ? 'Confirm Project Deletion' : 'Confirm Project Restoration'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-sm text-muted-foreground m-0">
            {confirmModal.action === 'delete'
              ? 'Are you sure you want to delete this project? You can restore it later from the deleted filter.'
              : 'Are you sure you want to restore this project?'}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModal({ show: false, projectId: null, action: null })}
          >
            Cancel
          </Button>
          <Button
            variant={confirmModal.action === 'delete' ? 'destructive' : 'default'}
            onClick={confirmModal.action === 'delete' ? executeDelete : executeRestore}
          >
            {confirmModal.action === 'delete' ? 'Delete Project' : 'Restore'}
          </Button>
        </Modal.Footer>
      </Modal>
      </MotionPage>
    </PageContainer>
  );
};

export default ProjectListPage;