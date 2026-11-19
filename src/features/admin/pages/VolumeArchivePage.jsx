import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFilterOpen]);

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

      {/* Integrated Filter Bar */}
      <div className="bg-surface p-3 sm:p-3.5 rounded-card border border-border mb-3 shadow-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search + Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Icon
                icon="lucide:search"
                width={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder={t("admin.searchByVolumeNumberEgVolume1", "Search by volume number...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded border-0 bg-transparent cursor-pointer"
                  aria-label="Clear search"
                >
                  <Icon icon="lucide:x" width={13} />
                </button>
              )}
            </div>

            {/* Filter Button with Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`h-9 px-3 text-xs rounded-control border transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs font-medium whitespace-nowrap ${
                  (frequencyFilter !== 'All' || sortBy !== 'newest') || isFilterOpen
                    ? 'border-primary text-primary bg-primary-subtle font-semibold ring-1 ring-primary/20'
                    : 'border-border bg-surface text-foreground hover:bg-surface-muted hover:border-foreground/30'
                }`}
                aria-expanded={isFilterOpen}
                aria-label="Filter options"
              >
                <Icon
                  icon="lucide:sliders-horizontal"
                  width={14}
                  className={(frequencyFilter !== 'All' || sortBy !== 'newest') ? "text-primary" : "text-muted-foreground"}
                />
                <span>{t("filter", "Filter")}</span>
                {(frequencyFilter !== 'All' || sortBy !== 'newest') && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-primary text-white">
                    {(frequencyFilter !== 'All' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)}
                  </span>
                )}
                <Icon
                  icon="lucide:chevron-down"
                  width={12}
                  className={`transition-transform duration-200 text-muted-foreground ${isFilterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Floating Dropdown */}
              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px] sm:bg-transparent"
                    onClick={() => setIsFilterOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[340px] bg-surface border border-border rounded-xl shadow-2xl z-50 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
                    style={{ zIndex: 60 }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                          <Icon icon="lucide:sliders-horizontal" width={14} />
                        </div>
                        <h4 className="text-xs font-bold text-foreground">Archive Filters</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-muted inline-flex items-center justify-center border-0 bg-transparent cursor-pointer"
                        aria-label="Close"
                      >
                        <Icon icon="lucide:x" width={14} />
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Period Filter */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Icon icon="lucide:calendar" width={13} />
                          <span>Publication Period</span>
                        </label>
                        <select
                          value={frequencyFilter}
                          onChange={(e) => setFrequencyFilter(e.target.value)}
                          className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                          <option value="All">All Periods</option>
                          <option value="Quarterly">{t("admin.quarterlyHangQuy")}</option>
                          <option value="Bi-annual">{t("admin.biannualNuaNam")}</option>
                          <option value="Annual">{t("admin.annualHangNam")}</option>
                        </select>
                      </div>

                      {/* Sort Order */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Icon icon="lucide:arrow-up-down" width={13} />
                          <span>Sort Order</span>
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full h-9 px-3 rounded-control border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                        >
                          <option value="newest">Newest to Oldest</option>
                          <option value="oldest">Oldest to Newest</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-muted/30">
                      <button
                        type="button"
                        onClick={() => {
                          setFrequencyFilter('All');
                          setSortBy('newest');
                        }}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground border-0 bg-transparent cursor-pointer inline-flex items-center gap-1"
                      >
                        <Icon icon="lucide:rotate-ccw" width={12} />
                        <span>{t("article.xoaBoLoc", "Clear all")}</span>
                      </button>
                      <Button
                        size="sm"
                        onClick={() => setIsFilterOpen(false)}
                        className="h-8 px-4 text-xs font-semibold"
                      >
                        {t("apply", "Done")}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Chips */}
        {(frequencyFilter !== 'All' || sortBy !== 'newest') && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border/50">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">Active filters:</span>
            {frequencyFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal">
                <span>Period: {frequencyFilter}</span>
                <button
                  type="button"
                  onClick={() => setFrequencyFilter('All')}
                  className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer"
                >
                  <Icon icon="lucide:x" width={11} />
                </button>
              </Badge>
            )}
            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 font-normal">
                <span>Sort: Oldest first</span>
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className="hover:text-foreground border-0 bg-transparent p-0 cursor-pointer"
                >
                  <Icon icon="lucide:x" width={11} />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={() => {
                setFrequencyFilter('All');
                setSortBy('newest');
              }}
              className="text-[11px] text-primary hover:underline font-semibold ml-1 border-0 bg-transparent cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
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
