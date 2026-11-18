import { useState, useEffect } from 'react';
import { Row } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';
import JournalFilterBar from '../components/journals/JournalFilterBar';
import JournalTableAdmin from '../components/journals/JournalTableAdmin';
import JournalCardAdmin from '../components/journals/JournalCardAdmin';
import AddJournalModal from '../components/modals/AddJournalModal';
import Pagination from '../../../shared/components/Pagination';
import { Alert } from '../../../shared/ui/alert';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';

/**
 * JournalDirectoryPage - Màn hình chính quản lý thư mục các Tạp chí dành cho Admin.
 */
export default function JournalDirectoryPage() {
  const { journals, fetchInitialData, loading, error } = useJournalManagement();

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchInitialData({ force: true });
  }, [fetchInitialData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, subjectFilter]);

  const filteredJournals = (journals || []).filter((journal) => {
    const title = journal.title || journal.display_name || '';
    const issn = journal.issn || '';
    const status = journal.status || 'Draft';
    const category = journal.subjectCategory || '';

    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      issn.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || category === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  const totalPages = Math.max(1, Math.ceil(filteredJournals.length / limit));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedJournals = filteredJournals.slice(
    (safePage - 1) * limit,
    safePage * limit
  );

  return (
    <div className="d-flex flex-column gap-4 text-start">
      <PageHeader
        breadcrumbs={[
          { label: 'Portfolio Operations' },
          { label: 'Journal Directory' }
        ]}
        title="Journal Directory"
        description="Manage and monitor the entire publication lifecycle for your academic portfolio."
      />

      {/* Filters and Search toolbar */}
      <JournalFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        subjectFilter={subjectFilter}
        onSubjectChange={setSubjectFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* Display journals */}
      {loading ? (
        <div className="admin-card p-4 space-y-3 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="space-y-1.5 flex-1 max-w-md">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="items-center mb-0">
          <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
          <div className="flex-1 text-xs">{error}</div>
        </Alert>
      ) : filteredJournals.length === 0 ? (
        <StatePanel
          variant="neutral"
          title="No Journals Found"
          description="No journals match the selected filters. Try adjusting your search query or filters."
        />
      ) : viewMode === 'table' ? (
        <div className="admin-card p-0 overflow-hidden">
          <JournalTableAdmin journals={paginatedJournals} />
        </div>
      ) : (
        <Row className="g-3">
          {paginatedJournals.map((j) => (
            <JournalCardAdmin key={j.id || j.journal_id} journal={j} />
          ))}
        </Row>
      )}

      {/* Pagination Controls */}
      {filteredJournals.length > 0 && (
        <Pagination
          totalItems={filteredJournals.length}
          currentPage={safePage}
          limit={limit}
          onPageChange={setCurrentPage}
          entityName="journals"
        />
      )}

      {/* Add Journal Modal */}
      <AddJournalModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={() => fetchInitialData({ force: true })}
      />
    </div>
  );
}
