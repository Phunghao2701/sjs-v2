import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { formatCount } from '../../../shared/utils/formatNumber';

const ProjectCard = ({
  project,
  onDelete,
  onRestore,
  currentUser = null,
  areas = [],
  viewMode = 'grid',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const projectId = project.project_id || project.id;
  const title = project.title || 'Untitled Project';
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  const keywordCount = project.keywords_count || project.watch_keywords?.length || 0;
  const articleCount = project.articles_count ?? project.article_count ?? project.total_articles ?? 0;
  const isDeleted = project.status === 'DELETED';
  const isActive = project.status === 'ACTIVE' || (!isDeleted && project.status !== 'INACTIVE');

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  // Resolve Area Name
  const resolveAreaName = () => {
    if (project.subject_area && typeof project.subject_area === 'object') {
      return project.subject_area.name || project.subject_area.display_name || t('project.chuaXacDinhLinhVuc', 'General Science');
    }
    const rawVal = project.subject_area || project.subject_area_id;
    if (!rawVal) return t('project.chuaXacDinhLinhVuc', 'General Science');
    if (areas?.length) {
      const found = areas.find((a) => String(a.id || a.subject_area_id) === String(rawVal));
      if (found) return found.name || found.display_name;
    }
    if (!isNaN(rawVal)) return `${t('project.linhVuc', 'Field')} #${rawVal}`;
    return String(rawVal);
  };

  const areaName = resolveAreaName();

  const handleCardClick = (e) => {
    // If clicked on an interactive control inside (menu button, member avatars), do not navigate
    if (e?.target?.closest('button') || e?.target?.closest('a') || e?.target?.closest('[role="menu"]')) {
      return;
    }
    try {
      const storageKey = 'recently_viewed_projects';
      const raw = localStorage.getItem(storageKey);
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((id) => String(id) !== String(projectId));
      list.unshift(projectId);
      list = list.slice(0, 5);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (err) {
      console.error(t('project.loiLuuDuAnXemGanDay'), err);
    }
    navigate(`/projects/${projectId}`);
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const renderAvatarGroup = () => {
    const owner = project.owner;
    const members = project.members || [];
    const allUsers = [];
    if (owner) allUsers.push({ ...owner, isOwner: true });
    members.forEach((m) => allUsers.push(m));

    if (allUsers.length === 0) return null;

    const maxDisplay = 3;
    const displayUsers = allUsers.slice(0, maxDisplay);
    const extraCount = allUsers.length - maxDisplay;

    const handleMembersClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCardClick();
      navigate(`/projects/${projectId}?tab=members`);
    };

    return (
      <button
        type="button"
        className="inline-flex items-center border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary rounded-full shrink-0"
        onClick={handleMembersClick}
        title={t('project.quanLyThanhVien', 'Manage Members')}
        aria-label={t('project.quanLyThanhVien', 'Manage Members')}
      >
        <span className="flex items-center -space-x-1.5">
          {displayUsers.map((u, idx) => (
            <span
              key={idx}
              className={`inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-surface text-white shadow-xs ${
                u.isOwner ? 'bg-primary' : 'bg-muted-foreground'
              }`}
              title={`${u.first_name || ''} ${u.last_name || ''} ${u.isOwner ? '(Owner)' : ''}`}
            >
              {getInitials(u.first_name, u.last_name, u.email)}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-muted text-[10px] font-medium text-muted-foreground ring-2 ring-surface shadow-xs">
              +{extraCount}
            </span>
          )}
        </span>
      </button>
    );
  };

  // Ownership check
  const currentUserId = currentUser?.user_id || currentUser?.id;
  const isOwner =
    project.user_role === 'OWNER' ||
    (currentUser &&
      ((project.user_id && project.user_id === currentUserId) ||
        (project.owner && project.owner.user_id === currentUserId) ||
        (project.owner_id && project.owner_id === currentUserId)));

  const ownerName = project.owner?.first_name || project.owner?.last_name || project.owner?.email?.split('@')[0] || 'Admin';

  // 1. LIST VIEW CARD (Clean, Clickable Card Container, No Links Underlines)
  if (viewMode === 'list') {
    return (
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(e);
          }
        }}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-4 transition-colors hover:border-primary/50 hover:bg-surface-muted/20 shadow-xs cursor-pointer border border-border bg-surface rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none"
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary">
            <Icon icon="lucide:folder-kanban" width="18" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="m-0 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Field:</span>
                <span className="text-foreground font-medium">{areaName}</span>
              </span>
              {isDeleted ? (
                <Badge variant="destructive" className="text-[11px] py-0">
                  {t('project.daXoa', 'Deleted')}
                </Badge>
              ) : isActive ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  {t('project.dangHoatDong', 'Active')}
                </span>
              ) : (
                <Badge variant="secondary" className="text-[11px] py-0">
                  {t('project.chuaKichHoat', 'Inactive')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Icon icon="lucide:file-text" width="13" className="text-primary" /> {formatCount(articleCount)} Articles
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="lucide:key" width="13" className="text-amber-600" /> {formatCount(keywordCount)} Keywords
              </span>
              <span>•</span>
              <span>Updated {createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {renderAvatarGroup()}
          <span className="text-xs font-semibold text-primary flex items-center gap-1 pl-2">
            {t('common.details', 'Open')} <Icon icon="lucide:arrow-right" width="14" />
          </span>
        </div>
      </Card>
    );
  }

  // 2. GRID CARD - STRICTLY MATCHING DESIGN SYSTEM (Clean, Clickable Card Container, No Accidental Underlines)
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e);
        }
      }}
      className="group flex h-full flex-col justify-between p-3.5 transition-colors hover:border-primary/50 shadow-xs border border-border bg-surface rounded-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none"
    >
      <div>
        {/* Top Row: [Icon] title [● Active] [⋮] */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary">
              <Icon icon="lucide:folder-kanban" width="16" aria-hidden="true" />
            </div>
            <h3 className="m-0 text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isDeleted ? (
              <Badge variant="destructive" className="text-[11px] font-medium py-0">
                {t('project.daXoa', 'Deleted')}
              </Badge>
            ) : isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-success-subtle text-success border border-success/20">
                <span className="size-1.5 rounded-full bg-success" />
                {t('project.dangHoatDong', 'Active')}
              </span>
            ) : null}

            {/* Action Menu [⋮] */}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="flex size-7 items-center justify-center rounded-control border-0 bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Actions"
                  aria-label="Actions"
                >
                  <Icon icon="lucide:more-vertical" width="16" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-control border border-border bg-surface py-1 shadow-popover">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        navigate(`/projects/${projectId}/edit`);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-foreground hover:bg-surface-muted cursor-pointer"
                    >
                      <Icon icon="lucide:edit-3" width="13" />
                      <span>Edit Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        navigate(`/projects/${projectId}?tab=members`);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-foreground hover:bg-surface-muted cursor-pointer"
                    >
                      <Icon icon="lucide:users" width="13" />
                      <span>Members</span>
                    </button>
                    <div className="my-1 border-t border-border" />
                    {isDeleted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(false);
                          if (onRestore) onRestore(projectId);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-success hover:bg-success-subtle cursor-pointer"
                      >
                        <Icon icon="lucide:refresh-cw" width="13" />
                        <span>Restore</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(false);
                          onDelete(projectId);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-danger hover:bg-danger-subtle cursor-pointer"
                      >
                        <Icon icon="lucide:trash-2" width="13" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Second Line: Field: AreaName */}
        <p className="m-0 mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Field:</span>
          <span className="font-semibold text-foreground">{areaName}</span>
        </p>

        {/* Divider line ─────────────────────────────── */}
        <div className="border-t border-border my-3" />

        {/* Third Line: 📊 X Articles   🔑 X Keywords */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Icon icon="lucide:file-text" width="15" className="text-primary shrink-0" />
            <span>
              <strong className="font-bold text-foreground">{formatCount(articleCount)}</strong> {t('dashboard.articles', 'Articles')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="lucide:key" width="15" className="text-amber-600 shrink-0" />
            <span>
              <strong className="font-bold text-foreground">{formatCount(keywordCount)}</strong> {t('project.keywords', 'Keywords')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Line: 👥 [Avatar Group]   Updated 17/11/2026 */}
      <div className="mt-3.5 flex items-center justify-between gap-2 pt-2.5 border-t border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          {renderAvatarGroup()}
          <span className="truncate text-xs text-muted-foreground">
            By <strong className="font-medium text-foreground">{ownerName}</strong>
          </span>
        </div>

        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
          <Icon icon="lucide:calendar" width="12" /> {createdAt}
        </span>
      </div>
    </Card>
  );
};

export default ProjectCard;