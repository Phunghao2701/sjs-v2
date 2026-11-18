import { useTranslation } from "react-i18next";
import { t } from "i18next";
import RoleBadge from './RoleBadge';
import UserStatusBadge from './UserStatusBadge';
import Icon from '../../../../shared/components/Icon';
import { Skeleton } from '../../../../shared/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../shared/ui/table';

/**
 * UserTable Component
 * Renders the users list in a structured table.
 */
export default function UserTable({
  users = [],
  loading = false,
  onEdit,
  onDelete
}) {
  const { t: _t } = useTranslation();

  if (loading) {
    return (
      <div className="p-4 space-y-3 bg-surface rounded-lg border border-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 border border-border rounded-lg bg-surface">
        <Icon icon="lucide:users" width="48" className="text-muted-foreground mx-auto mb-2 opacity-50" />
        <h6 className="text-foreground font-bold text-base">No Users Found</h6>
        <p className="text-muted-foreground text-xs mb-0">Try adjusting your search query or role/status filters.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface shadow-2xs">
      <Table className="w-full text-left">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase w-[45%]">User Profile</TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[20%]">Role</TableHead>
            <TableHead className="py-3 px-3 text-xs font-semibold text-muted-foreground uppercase w-[15%]">Status</TableHead>
            <TableHead className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right w-[20%]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
              {/* Profile details column */}
              <TableCell className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="size-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm bg-gradient-to-br from-primary to-primary-hover shadow-xs"
                    aria-label={`Avatar chữ cái đầu của ${user.name || user.email || t("admin.nguoiDung")}`}
                  >
                    {String(user.name || user.email || 'U').trim().charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{user.name}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                  </div>
                </div>
              </TableCell>

              {/* Role badge column */}
              <TableCell className="py-3 px-3">
                <RoleBadge role={user.role} />
              </TableCell>

              {/* Status bullet column */}
              <TableCell className="py-3 px-3">
                <UserStatusBadge status={user.status} />
              </TableCell>

              {/* Action operations column */}
              <TableCell className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit?.(user.id)}
                    className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border-0 bg-transparent cursor-pointer"
                    title="Edit User"
                  >
                    <Icon icon="lucide:edit-2" width="16" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete contributor "${user.name}"?`)) {
                        onDelete?.(user.id);
                      }
                    }}
                    className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors border-0 bg-transparent cursor-pointer"
                    title="Delete User"
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
