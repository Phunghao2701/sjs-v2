import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Dropdown } from 'react-bootstrap';
import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';

const ProjectMembersList = ({ 
  project,
  members, 
  loading, 
  onInviteClick, 
  onChangeRole, 
  onRemoveMember, 
  actionLoading,
  currentUser,
}) => {
  const { t } = useTranslation();

  const getRoleBadgeVariant = (role) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return 'destructive';
      case 'ADMIN': return 'default';
      case 'MEMBER': return 'success';
      case 'VIEWER': return 'secondary';
      default: return 'secondary';
    }
  };

  const translateRole = (role) => {
    switch (role?.toUpperCase()) {
      case 'OWNER': return t('project.chuSoHuu', 'Chủ sở hữu');
      case 'ADMIN': return t('project.quanTriVien', 'Quản trị viên');
      case 'MEMBER': return t('project.thanhVien', 'Thành viên');
      case 'VIEWER': return t('project.nguoiXem', 'Người xem');
      default: return role || 'MEMBER';
    }
  };

  const authStateUser = useAuthStore.getState()?.user;
  const userStoreEmail = useUserStore.getState()?.email;

  const currentUserId = currentUser?.user_id || currentUser?.id || authStateUser?.user_id || authStateUser?.id;
  const currentEmail = (currentUser?.email || authStateUser?.email || userStoreEmail || '').trim().toLowerCase();

  const projectUserRole = (project?.user_role || '').toUpperCase();

  const matchedMember = members?.find((m) => {
    const mUserId = m.user_id || m.id;
    const mEmail = (m.email || '').trim().toLowerCase();
    if (mUserId && currentUserId && String(mUserId) === String(currentUserId)) return true;
    if (mEmail && currentEmail && mEmail === currentEmail) return true;
    return false;
  });

  const memberRole = matchedMember?.role?.toUpperCase();

  const isOwner = Boolean(
    projectUserRole === 'OWNER' ||
    memberRole === 'OWNER' ||
    (project?.user_id && currentUserId && String(project.user_id) === String(currentUserId)) ||
    (currentEmail && members?.some((m) => m.role?.toUpperCase() === 'OWNER' && (m.email || '').trim().toLowerCase() === currentEmail)) ||
    (members?.length === 1 && members[0]?.role?.toUpperCase() === 'OWNER') ||
    (!projectUserRole || projectUserRole === 'OWNER')
  );

  const canManageOthers = Boolean(
    isOwner ||
    projectUserRole === 'ADMIN' ||
    memberRole === 'ADMIN' ||
    currentUser?.role === 'ADMINISTRATOR' ||
    authStateUser?.role === 'ADMINISTRATOR' ||
    (projectUserRole !== 'VIEWER' && projectUserRole !== 'MEMBER' && memberRole !== 'VIEWER' && memberRole !== 'MEMBER')
  );

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="m-0 text-base font-semibold text-foreground">
            {t("project.thanhVienDuAn", "Project Members")}
          </h3>
          <p className="mt-1 mb-0 text-xs text-muted-foreground">
            {t("project.quanLyNhungNguoiCoQuyen", "Manage people with access to this project.")}
          </p>
        </div>
        {canManageOthers && (
          <Button 
            id="btn-invite-member"
            size="sm"
            onClick={onInviteClick}
            className="self-start sm:self-auto"
          >
            <Icon icon="lucide:user-plus" width="16" aria-hidden="true" />
            <span>{t("project.themThanhVien", "Add Member")}</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10" aria-live="polite">
          <Icon icon="lucide:loader-2" className="animate-spin text-primary" width="32" />
        </div>
      ) : members?.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          <Icon icon="lucide:users" width="40" className="mx-auto mb-2.5 opacity-40" aria-hidden="true" />
          <p className="m-0 text-xs">{t("project.duAnNayChuaCoThanhVien")}</p>
        </div>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {members?.map((member) => {
            const roleVariant = getRoleBadgeVariant(member.role);
            const isInvited = member.status?.toUpperCase() === 'INVITED';
            
            return (
              <div
                key={member.id || member.user_id}
                className="flex items-center justify-between gap-3 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary font-bold text-sm">
                    {((member.first_name?.[0] || member.last_name?.[0] || member.user?.full_name?.[0] || member.email?.[0] || 'U')).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {(member.first_name || member.last_name)
                          ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                          : (member.user?.full_name || member.name || member.email || t("project.nguoiDung"))}
                      </span>
                      {isInvited ? (
                        <Badge variant="warning" className="text-xs">
                          {t("project.daMoi", "Đã mời")}
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-xs">
                          {t("project.dangHoatDong", "Đang hoạt động")}
                        </Badge>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground mt-0.5">
                      {member.email || member.user?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={roleVariant} className="text-xs">
                    {translateRole(member.role)}
                  </Badge>
                  {(() => {
                    const memberUserId = member.user_id || member.id;
                    const isSelf = Boolean(
                      (memberUserId && currentUserId && String(memberUserId) === String(currentUserId)) ||
                      (member.email && currentUser?.email && member.email.toLowerCase() === currentUser.email.toLowerCase())
                    );
                    
                    const isMemberOwner = member.role?.toUpperCase() === 'OWNER';
                    
                    if (isMemberOwner) return null;
                    
                    if (isSelf) {
                      return (
                        <Dropdown align="end">
                          <Dropdown.Toggle 
                            variant="ghost" 
                            className="size-8 p-0 border-0 bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground inline-flex items-center justify-center rounded-control" 
                            id={`dropdown-${member.id || member.user_id}`}
                            disabled={actionLoading}
                            aria-label="Member options"
                          >
                            <Icon icon="lucide:more-vertical" width="16" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="border border-border bg-surface shadow-popover rounded-card p-1 text-xs">
                            <Dropdown.Item 
                              onClick={() => onRemoveMember(member.user_id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs text-danger hover:bg-danger-subtle"
                            >
                              <Icon icon="lucide:log-out" width="14" /> 
                              <span>{t("project.roiKhoiDuAn", "Rời khỏi dự án")}</span>
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      );
                    }

                    if (canManageOthers) {
                      return (
                        <Dropdown align="end">
                          <Dropdown.Toggle 
                            variant="ghost" 
                            className="size-8 p-0 border-0 bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground inline-flex items-center justify-center rounded-control" 
                            id={`dropdown-${member.id || member.user_id}`}
                            disabled={actionLoading}
                            aria-label="Manage member options"
                          >
                            <Icon icon="lucide:more-vertical" width="16" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="border border-border bg-surface shadow-popover rounded-card p-1 text-xs">
                            <Dropdown.Item 
                              onClick={() => onChangeRole(member.user_id, 'ADMIN')}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs text-foreground hover:bg-surface-muted"
                            >
                              <Icon icon="lucide:shield" width="14" /> 
                              <span>{t("project.datLamAdmin")}</span>
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => onChangeRole(member.user_id, 'MEMBER')}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs text-foreground hover:bg-surface-muted"
                            >
                              <Icon icon="lucide:user" width="14" /> 
                              <span>{t("project.datLamMember")}</span>
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => onChangeRole(member.user_id, 'VIEWER')}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs text-foreground hover:bg-surface-muted"
                            >
                              <Icon icon="lucide:eye" width="14" /> 
                              <span>{t("project.datLamViewer")}</span>
                            </Dropdown.Item>
                            <Dropdown.Divider className="my-1 border-border" />
                            <Dropdown.Item 
                              onClick={() => onRemoveMember(member.user_id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-control text-xs text-danger hover:bg-danger-subtle"
                            >
                              <Icon icon="lucide:user-x" width="14" /> 
                              <span>{member.status?.toUpperCase() === 'INVITED' ? t("project.huyLoiMoi") : t("project.xoaThanhVien")}</span>
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      );
                    }

                    return null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectMembersList;
