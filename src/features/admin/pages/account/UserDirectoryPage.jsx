import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import Pagination from '../../../../shared/components/Pagination';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { Button } from '../../../../shared/ui/button';
import { Alert } from '../../../../shared/ui/alert';
import { PageHeader } from '../../../../shared/ui/page-layout';
import { Card } from '../../../../shared/ui/card';
import UserTable from '../../components/account/UserTable';
import UserFilterBar from '../../components/account/UserFilterBar';
import { getAdminUsers } from '../../api/adminUsers.api';
import ROUTES from '../../../../app/routes/routePaths';

const ITEMS_PER_PAGE = 10;

const getApiErrorMessage = (error, t) => {
  if (error.response?.status === 403) {
    return t("admin.backendTuChoiQuyenAdminTokenHi");
  }
  return error.response?.data?.message || t("admin.khongTheTaiDanhSachNguoiDung");
};

const extractUsers = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const extractTotal = (payload, fallback) => {
  return Number(payload?.total || payload?.totalItems || payload?.pagination?.total || payload?.meta?.total || fallback);
};

const ROLE_LABELS = {
  RESEARCHER: 'Researcher',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
  ADMINISTRATOR: 'Administrator',
};

const toRoleLabel = (role = 'RESEARCHER') => ROLE_LABELS[role] || role;
const toTitleCaseEnum = (value = '') => {
  return String(value).toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

const normalizeUser = (user = {}) => {
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = user.name || [firstName, lastName].filter(Boolean).join(' ').trim();
  return {
    id: user.id || user.user_id || user.uuid,
    name: fullName || user.email || 'Unnamed user',
    email: user.email || 'No email',
    role: user.role || 'RESEARCHER',
    roleLabel: toRoleLabel(user.role || 'RESEARCHER'),
    status: toTitleCaseEnum(user.status || 'INACTIVE'),
    avatar: user.avatar || user.avatar_url || '',
  };
};

/**
 * UserDirectoryPage Component
 * Admin user directory page with API integration, filters, search, and pagination.
 */
export default function UserDirectoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let ignore = false;

    const fetchUsersData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (debouncedSearch.trim()) {
          params.q = debouncedSearch.trim();
        }
        if (selectedRole !== 'all') {
          params.role = selectedRole.toUpperCase();
        }
        if (selectedStatus !== 'all') {
          params.status = selectedStatus.toUpperCase();
        }

        const response = await getAdminUsers(params);
        if (ignore) return;

        const payload = response.data?.data || response.data || {};
        const rawUsers = extractUsers(payload);
        const normalized = rawUsers.map(normalizeUser);
        const total = extractTotal(payload, normalized.length);

        setUsers(normalized);
        setTotalItems(total);
      } catch (err) {
        if (ignore) return;
        setUsers([]);
        setTotalItems(0);
        setError(getApiErrorMessage(err, t));
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUsersData();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearch, selectedRole, selectedStatus, t]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const activePercentage = users.length > 0 ? Math.round((activeUsersCount / users.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 text-left">
      <PageHeader
        breadcrumbs={[
          { label: 'Platform Directory' },
          { label: 'User Accounts' }
        ]}
        title="User Accounts"
        description="Oversee researcher, lecturer, student, and administrator accounts across the trending platform."
        actions={
          <Button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN_USER_CREATE)}
            className="flex items-center gap-1.5"
          >
            <Icon icon="lucide:user-plus" width="16" aria-hidden="true" />
            <span>New User Account</span>
          </Button>
        }
      />

      {error ? (
        <Alert variant="destructive" className="mb-3 items-center">
          <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
          <div className="flex-1 text-xs">{error}</div>
        </Alert>
      ) : null}

      {/* Unified User Section: Integrated Filter Bar + Table Content + Pagination in ONE Card */}
      <Card className="rounded-card border border-border bg-surface shadow-card">
        <UserFilterBar
          search={search}
          onSearchChange={handleSearchChange}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          totalCount={totalItems}
          asCard={false}
        />

        <div className="border-t border-border">
          <UserTable users={users} loading={loading} asCard={false} />
        </div>

        {totalItems > 0 && (
          <div className="border-t border-border px-4 py-3 bg-surface">
            <Pagination
              totalItems={totalItems}
              currentPage={currentPage}
              limit={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
              entityName="users"
              className="pt-0"
            />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <Card className="admin-card p-4 flex flex-col justify-between h-full bg-surface border border-border shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs font-semibold">Account State Ratio</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">{activePercentage}% Active</span>
            </div>
            <h4 className="font-display font-bold text-foreground mb-1 text-base">User Activity Distribution</h4>
            <p className="text-muted-foreground text-xs mb-3">
              Ratio of active accounts versus invited or inactive participants currently loaded in the directory.
            </p>
          </div>
          <div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${activePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Active: {activeUsersCount}</span>
              <span>Loaded: {users.length}</span>
            </div>
          </div>
        </Card>

        <Card className="admin-card p-4 flex flex-col justify-between h-full bg-surface border border-border shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs font-semibold">Access Governance</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">Security Policy</span>
            </div>
            <h4 className="font-display font-bold text-foreground mb-1 text-base">Role Privileges</h4>
            <p className="text-muted-foreground text-xs mb-0">
              Role assignments determine workspace abilities, API export limits, and project management scope.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">Researcher</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">Lecturer</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">Student</span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">Administrator</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
