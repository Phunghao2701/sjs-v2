import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import Pagination from '../../../../shared/components/Pagination';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import { Button } from '../../../../shared/ui/button';
import { Alert } from '../../../../shared/ui/alert';
import { PageHeader } from '../../../../shared/ui/page-layout';
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

export default function UserDirectoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminUsers({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: search || undefined,
          role: selectedRole === 'all' ? undefined : selectedRole,
          status: selectedStatus === 'all' ? undefined : selectedStatus.toUpperCase(),
          sortBy: 'email',
          sortOrder: 'asc',
        });
        const payload = response.data?.data;
        const rawUsers = extractUsers(payload);
        if (!isMounted) return;
        setUsers(rawUsers.map(normalizeUser));
        setTotalItems(extractTotal(response.data, rawUsers.length));
      } catch (apiError) {
        if (!isMounted) return;
        setUsers([]);
        setTotalItems(0);
        setError(getApiErrorMessage(apiError, t));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [currentPage, search, selectedRole, selectedStatus, t]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const activePercentage = users.length > 0 ? Math.round((activeUsersCount / users.length) * 100) : 0;

  return (
    <div className="d-flex flex-column gap-4 text-start">
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

      <UserFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        totalCount={totalItems}
      />

      {error ? (
        <Alert variant="destructive" className="mb-3 items-center">
          <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
          <div className="flex-1 text-xs">{error}</div>
        </Alert>
      ) : null}

      <div className="admin-card p-0 overflow-hidden">
        <UserTable users={users} loading={loading} />
      </div>

      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        limit={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
        entityName="users"
      />

      <Row className="g-3 mt-1">
        <Col xs={12} md={6}>
          <Card className="admin-card h-100">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted-custom small fw-semibold">Account State Ratio</span>
                  <span className="badge bg-light text-main border text-xs">{activePercentage}% Active</span>
                </div>
                <h4 className="font-display fw-bold text-main mb-1 text-base">User Activity Distribution</h4>
                <p className="text-muted-custom text-xs mb-3">
                  Ratio of active accounts versus invited or inactive participants currently loaded in the directory.
                </p>
              </div>
              <div>
                <ProgressBar
                  now={activePercentage}
                  style={{ height: '6px' }}
                  className="mb-2 bg-light"
                />
                <div className="d-flex justify-content-between text-xs text-muted-custom">
                  <span>Active: {activeUsersCount}</span>
                  <span>Loaded: {users.length}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="admin-card h-100">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted-custom small fw-semibold">Access Governance</span>
                  <span className="badge bg-light text-main border text-xs">Security Policy</span>
                </div>
                <h4 className="font-display fw-bold text-main mb-1 text-base">Role Privileges</h4>
                <p className="text-muted-custom text-xs mb-0">
                  Role assignments determine workspace abilities, API export limits, and project management scope.
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <span className="badge bg-light text-main border text-xs">Researcher</span>
                <span className="badge bg-light text-main border text-xs">Lecturer</span>
                <span className="badge bg-light text-main border text-xs">Student</span>
                <span className="badge bg-light text-main border text-xs">Administrator</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
