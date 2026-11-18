import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';
import Pagination from '../../../shared/components/Pagination';
import SwitchJournalModal from '../components/modals/SwitchJournalModal';
import { PageHeader } from '../../../shared/ui/page-layout';

/**
 * VolumeArchivePage - Màn hình Lưu trữ các Tập (Volume Archive) của Tạp chí đang chọn (Figma Screen Page 10).
 */
export default function VolumeArchivePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentJournal,
    volumes,
    setSelectedVolume,
    fetchInitialData
  } = useJournalManagement();

  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  // State filters & sort
  const [search, setSearch] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, frequencyFilter, sortBy]);

  const currentVolumes = (volumes || []).filter(v => v.journalId === currentJournal?.id);

  const filteredVolumes = currentVolumes.filter(vol => {
    const volNum = vol.volumeNumber || '';
    const freq = vol.frequency || '';
    const matchesSearch = volNum.toLowerCase().includes(search.toLowerCase());
    const matchesFreq = frequencyFilter === 'All' || freq === frequencyFilter;
    return matchesSearch && matchesFreq;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return b.publicationYear - a.publicationYear;
    } else {
      return a.publicationYear - b.publicationYear;
    }
  });

  const paginatedVolumes = filteredVolumes.slice((currentPage - 1) * limit, currentPage * limit);

  const handleViewDetails = volumeId => {
    setSelectedVolume(volumeId);
    navigate(`${basePath}/journals/repository`);
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <PageHeader
        breadcrumbs={[
          { label: 'Repository', to: `${basePath}/journals/repository` },
          { label: 'Volume Archive' }
        ]}
        title="Volume Archive"
        description={`Explore the historical collection of published volumes and issue logs for ${currentJournal?.title || 'the selected journal'}.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-display"
            onClick={() => setShowSwitchModal(true)}
          >
            <Icon icon="lucide:refresh-cw" width="14" />
            <span>Change Journal</span>
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border mb-2 mt-2 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
          {/* Search by Volume number */}
          <div className="md:col-span-5">
            <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
              Search Volumes
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground pointer-events-none">
                <Icon icon="lucide:search" width="16" />
              </span>
              <input
                type="text"
                placeholder={t("admin.searchByVolumeNumberEgVolume1")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Filter by Frequency */}
          <div className="md:col-span-3.5">
            <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
              Publication Period
            </label>
            <select
              value={frequencyFilter}
              onChange={e => setFrequencyFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Periods</option>
              <option value="Quarterly">{t("admin.quarterlyHangQuy")}</option>
              <option value="Bi-annual">{t("admin.biannualNuaNam")}</option>
              <option value="Annual">{t("admin.annualHangNam")}</option>
            </select>
          </div>

          {/* Sort by Year */}
          <div className="md:col-span-3.5">
            <label className="font-semibold text-xs text-foreground uppercase tracking-wider block mb-2">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volumes Grid */}
      {filteredVolumes.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-xl border border-border">
          <Icon icon="lucide:archive-x" width="48" className="text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm mb-0">No volumes found matching the search criteria.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {paginatedVolumes.map(vol => (
              <Card key={vol.id} className="bg-surface h-full border border-border rounded-xl shadow-2xs flex flex-col p-5">
                {/* Top row: Status & Page badge */}
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-muted text-muted-foreground border border-border px-2.5 py-0.5 uppercase text-[10px] font-semibold rounded">
                    ARCHIVED
                  </span>
                  <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono text-xs border border-border">
                    <Icon icon="lucide:book-open" width="12" />
                    <span>V{vol.volumeNumber ? vol.volumeNumber.replace(/\D/g, '') : '13'}</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-display font-bold text-foreground mb-4 text-base">
                  {vol.volumeNumber} ({vol.publicationYear})
                </h4>

                {/* Detail list rows */}
                <div className="flex flex-col gap-2 mb-4 mt-auto">
                  <div className="flex justify-between items-center border-b border-border pb-2 text-xs">
                    <span className="text-muted-foreground">Total Issues</span>
                    <span className="font-bold text-foreground font-mono">0{vol.totalIssues || 4}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2 text-xs">
                    <span className="text-muted-foreground">Total Articles</span>
                    <span className="font-bold text-foreground font-mono">{vol.totalArticles || 128}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 text-xs">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-bold text-foreground font-display">{vol.period || `Jan — Dec ${vol.publicationYear}`}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full mt-auto pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full font-display font-semibold flex items-center justify-center gap-1.5" onClick={() => handleViewDetails(vol.id)}>
                    <span>View Details</span>
                  </Button>
                  <Button variant="outline" size="sm" className="size-9 p-0 flex items-center justify-center shrink-0" title="Restore/History" onClick={() => alert(`Showing history for ${vol.volumeNumber}...`)}>
                    <Icon icon="lucide:history" width="16" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination totalItems={filteredVolumes.length} currentPage={currentPage} limit={limit} onPageChange={setCurrentPage} entityName="volumes" />
        </div>
      )}

      {/* Switch Journal Modal */}
      <SwitchJournalModal show={showSwitchModal} handleClose={() => setShowSwitchModal(false)} />
    </div>
  );
}
