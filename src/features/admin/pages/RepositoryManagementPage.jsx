import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';
import { getJournalArticlesApi } from '../../journal/api/journalApi';
import { getAdminJournalRepositorySummary } from '../api/adminDashboard.api';
import VolumeList from '../components/repository/VolumeList';
import IssueTable from '../components/repository/IssueTable';
import SwitchJournalModal from '../components/modals/SwitchJournalModal';
import CreateVolumeModal from '../components/modals/CreateVolumeModal';
import CreateIssueModal from '../components/modals/CreateIssueModal';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { Alert } from '../../../shared/ui/alert';
import { PageHeader } from '../../../shared/ui/page-layout';

/**
 * RepositoryManagementPage - Admin repository coordinator for selected journal volumes and issues.
 */
export default function RepositoryManagementPage() {
  const { t: _t } = useTranslation();
  const {
    currentJournal,
    volumes,
    issues,
    selectedVolume,
    setSelectedVolume,
    fetchInitialData
  } = useJournalManagement();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [repositorySummary, setRepositorySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [articleCountsByIssueId, setArticleCountsByIssueId] = useState({});
  const [volumeStatsById, setVolumeStatsById] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    let isMounted = true;
    const fetchRepositorySummary = async () => {
      if (!currentJournal?.id) {
        setRepositorySummary(null);
        setSummaryError('');
        return;
      }
      try {
        setSummaryLoading(true);
        setSummaryError('');
        const response = await getAdminJournalRepositorySummary(currentJournal.id);
        if (!isMounted) return;
        setRepositorySummary(response.data?.data || null);
      } catch (error) {
        if (!isMounted) return;
        setRepositorySummary(null);
        setSummaryError(error.response?.status === 403 ? t("admin.backendTuChoiQuyenAdminTokenHi") : t("admin.khongTheTaiThongKeRepositoryTu"));
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };
    fetchRepositorySummary();
    return () => {
      isMounted = false;
    };
  }, [currentJournal?.id]);

  const currentVolumes = useMemo(
    () => (volumes || []).filter(v => v.journalId === currentJournal?.id),
    [volumes, currentJournal?.id]
  );

  useEffect(() => {
    if (currentVolumes.length > 0 && !selectedVolume) {
      setSelectedVolume(currentVolumes[0].id);
    }
  }, [currentVolumes, selectedVolume, setSelectedVolume]);

  const currentIssues = useMemo(
    () => (issues || []).filter(i => i.volumeId === selectedVolume),
    [issues, selectedVolume]
  );

  useEffect(() => {
    let isMounted = true;
    const missingIssueIds = currentIssues
      .map(issue => issue.issue_id || issue.id)
      .filter(id => id && articleCountsByIssueId[id] === undefined);

    if (missingIssueIds.length === 0) return;

    const fetchIssueArticleCounts = async () => {
      const results = await Promise.allSettled(
        missingIssueIds.map(async issueId => {
          const res = await getJournalArticlesApi({ issue_id: issueId, limit: 1 });
          const total = res.data?.data?.total || res.data?.data?.total_items || res.data?.total || 0;
          return { issueId, total };
        })
      );

      if (!isMounted) return;

      const newCounts = {};
      results.forEach(item => {
        if (item.status === 'fulfilled' && item.value) {
          newCounts[item.value.issueId] = item.value.total;
        }
      });

      if (Object.keys(newCounts).length > 0) {
        setArticleCountsByIssueId(prev => ({ ...prev, ...newCounts }));
      }
    };

    fetchIssueArticleCounts();

    return () => {
      isMounted = false;
    };
  }, [currentIssues, articleCountsByIssueId]);

  useEffect(() => {
    const stats = {};
    currentVolumes.forEach(vol => {
      const volIssues = (issues || []).filter(i => i.volumeId === vol.id);
      const volIssueIds = volIssues.map(i => i.issue_id || i.id).filter(Boolean);
      const allResolved = volIssueIds.every(id => typeof articleCountsByIssueId[id] === 'number');
      const articleCount = allResolved
        ? volIssueIds.reduce((sum, id) => sum + (articleCountsByIssueId[id] || 0), 0)
        : null;

      stats[vol.id] = {
        issueCount: volIssues.length,
        articleCount
      };
    });
    setVolumeStatsById(stats);
  }, [currentVolumes, issues, articleCountsByIssueId]);

  const activeVolObj = currentVolumes.find(v => v.id === selectedVolume);

  const fallbackTotalPublications = currentVolumes.reduce((sum, vol) => {
    const volStats = volumeStatsById[vol.id];
    return typeof volStats?.articleCount === 'number' ? sum + volStats.articleCount : sum;
  }, 0);

  const totalVolumes = repositorySummary?.total_volumes ?? currentVolumes.length;
  const activeIssues = repositorySummary?.active_issues ?? issues.filter(i => currentVolumes.map(v => v.id).includes(i.volumeId)).length;
  const totalPublications = repositorySummary?.total_publications ?? fallbackTotalPublications;
  const nextRelease = repositorySummary?.next_release || t("admin.q22026Scheduled");

  return (
    <div className="flex flex-col gap-4 text-left">
      <PageHeader
        breadcrumbs={[
          { label: 'Portfolio Operations' },
          { label: 'Repository Management' }
        ]}
        title="Repository Management"
        description="Manage volumes and publication issues for your active journals."
        actions={
          <Button size="sm" onClick={() => setShowVolumeModal(true)} className="flex items-center gap-1.5">
            <Icon icon="lucide:plus" width="16" />
            <span>New Volume</span>
          </Button>
        }
      />

      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col md:flex-row justify-between md:items-center gap-3 mb-2 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary-subtle text-primary hidden sm:flex items-center justify-center shrink-0">
            <Icon icon="lucide:book-open" width="22" />
          </div>
          <div>
            <div className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
              Select Journal Repository
            </div>
            <h5 className="font-display font-bold text-foreground text-base m-0 flex items-center gap-2">
              {currentJournal ? currentJournal.title : 'No active journal selected'}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                ACTIVE
              </span>
            </h5>
            <small className="text-muted-foreground font-mono text-xs">
              ISSN: {currentJournal?.issn} • Publisher: {currentJournal?.publisher || 'N/A'}
            </small>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSwitchModal(true)} className="gap-1.5 shrink-0">
          <Icon icon="lucide:refresh-cw" width="14" />
          <span>Switch Journal</span>
        </Button>
      </div>

      {summaryError && (
        <Alert variant="destructive" className="mb-2">
          {summaryError}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <Card className="border border-border p-4 bg-surface rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground text-xs uppercase font-semibold">Total Volumes</div>
            <div className="text-muted-foreground bg-muted p-1.5 rounded-md flex"><Icon icon="lucide:layers" width="16" /></div>
          </div>
          <h3 className="font-bold text-foreground text-2xl m-0 font-mono">{summaryLoading ? '...' : totalVolumes}</h3>
        </Card>
        <Card className="border border-border p-4 bg-surface rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground text-xs uppercase font-semibold">Active Issues</div>
            <div className="text-muted-foreground bg-muted p-1.5 rounded-md flex"><Icon icon="lucide:book-marked" width="16" /></div>
          </div>
          <h3 className="font-bold text-foreground text-2xl m-0 font-mono">{summaryLoading ? '...' : activeIssues}</h3>
        </Card>
        <Card className="border border-border p-4 bg-surface rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground text-xs uppercase font-semibold">Total Articles</div>
            <div className="text-muted-foreground bg-muted p-1.5 rounded-md flex"><Icon icon="lucide:file-text" width="16" /></div>
          </div>
          <h3 className="font-bold text-foreground text-2xl m-0 font-mono">{summaryLoading ? '...' : totalPublications}</h3>
        </Card>
        <Card className="border border-border p-4 bg-surface rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="text-muted-foreground text-xs uppercase font-semibold">Next Release</div>
            <div className="text-muted-foreground bg-muted p-1.5 rounded-md flex"><Icon icon="lucide:calendar" width="16" /></div>
          </div>
          <h3 className="font-bold text-foreground text-base m-0 font-mono truncate">
            {summaryLoading ? '...' : nextRelease}
          </h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-display font-bold text-foreground text-base mb-0 flex items-center gap-2">
              Volumes Repository
              <Icon icon="lucide:sliders-horizontal" className="text-muted-foreground" width="16" />
            </h5>
          </div>
          <VolumeList volumes={currentVolumes} selectedVolumeId={selectedVolume} onSelectVolume={setSelectedVolume} volumeStatsById={volumeStatsById} />
        </div>

        <div className="lg:col-span-8">
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h5 className="font-display font-bold text-foreground text-base mb-1">
                  {activeVolObj ? `${activeVolObj.volumeNumber} Overview` : 'Volume Overview'}
                </h5>
                <small className="text-muted-foreground text-xs">
                  Published: {activeVolObj?.frequency || 'Quarterly'} • Frequency: Q1, Q2, Q3, Q4
                </small>
              </div>
              <Button size="sm" disabled={!selectedVolume} onClick={() => setShowIssueModal(true)} className="gap-1.5">
                <Icon icon="lucide:plus-circle" width="14" />
                <span>Add Issue</span>
              </Button>
            </div>

            <IssueTable issues={currentIssues} articleCountsByIssueId={articleCountsByIssueId} />
          </div>
        </div>
      </div>

      <SwitchJournalModal show={showSwitchModal} handleClose={() => setShowSwitchModal(false)} />
      <CreateVolumeModal show={showVolumeModal} handleClose={() => setShowVolumeModal(false)} />
      <CreateIssueModal show={showIssueModal} handleClose={() => setShowIssueModal(false)} />
    </div>
  );
}
