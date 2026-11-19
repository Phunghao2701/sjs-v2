import { useEffect, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import api from '../../../shared/services/api';
import { Alert } from '../../../shared/ui/alert';
import { Button } from '../../../shared/ui/button';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Card } from '../../../shared/ui/card';
import { useScimagoImportStore } from '../../../app/store/scimagoImportStore';

const statusPath = '/admin/integrations/openalex';

export default function AdminDataSourcesPage() {
  const [keyStatus, setKeyStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [clearingKey, setClearingKey] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [showImportSummary, setShowImportSummary] = useState(false);
  const [loadingImportSummary, setLoadingImportSummary] = useState(false);
  const [importSummaryError, setImportSummaryError] = useState('');
  const [importSummaryYears, setImportSummaryYears] = useState([]);
  const [importSummaryNotice, setImportSummaryNotice] = useState('');
  const [deletingImportYear, setDeletingImportYear] = useState(null);

  const {
    isImporting,
    fileName: activeFileName,
    fileSize: activeFileSize,
    year,
    setYear,
    importProgress,
    message: importMessage,
    dismissMessage: dismissImportMessage,
    canResume,
    startImport,
    resumeImport,
    pauseImport,
    clearSession,
    init: initImportStore,
  } = useScimagoImportStore();

  const loadKeyStatus = async () => {
    setLoadingKey(true);
    try {
      const response = await api.get(statusPath);
      setKeyStatus(response.data?.data || response.data);
    } catch (error) {
      if (error.response?.data?.code === 'OPENALEX_KEY_DECRYPT_FAILED') {
        setKeyStatus({ configured: true, source: 'admin', keyUnreadable: true, encryptionReady: false });
        setMessage({ type: 'warning', text: 'The stored key cannot be decrypted. Enter the current OpenAlex key and rotate it; the Worker will confirm that encryption is configured.' });
      } else {
        setKeyStatus(null);
        setMessage({ type: 'danger', text: error.response?.data?.message || 'Could not load OpenAlex key status.' });
      }
    } finally {
      setLoadingKey(false);
    }
  };

  useEffect(() => {
    loadKeyStatus();
    initImportStore();
  }, []);

  const saveKey = async (event) => {
    event.preventDefault();
    if (!apiKey.trim()) return;
    setSavingKey(true); setMessage(null);
    try {
      const response = await api.put(statusPath, { api_key: apiKey.trim() });
      setKeyStatus(response.data?.data || response.data);
      setApiKey('');
      setMessage({ type: 'success', text: 'OpenAlex key validated and rotated.' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Could not rotate the OpenAlex key.' });
    } finally { setSavingKey(false); }
  };

  const clearKey = async () => {
    if (!window.confirm('Remove the admin-managed key and use the Worker environment key, if configured?')) return;
    setClearingKey(true); setMessage(null);
    try {
      const response = await api.delete(statusPath);
      setKeyStatus(response.data?.data || response.data);
      setMessage({ type: 'success', text: 'Admin-managed key removed. The Worker will use its environment key if configured.' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Could not remove the OpenAlex key.' });
    } finally { setClearingKey(false); }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    startImport(file, year);
    setFile(null);
  };

  const toggleImportSummary = async () => {
    if (showImportSummary) {
      setShowImportSummary(false);
      return;
    }
    setShowImportSummary(true);
    setLoadingImportSummary(true);
    setImportSummaryError('');
    try {
      const response = await api.get('/admin/imports/scimago/summary');
      const result = response.data?.data || response.data;
      setImportSummaryYears(result?.years || []);
    } catch (error) {
      setImportSummaryError(error.response?.data?.message || 'Could not load the imported SCImago data summary.');
      setImportSummaryYears([]);
    } finally {
      setLoadingImportSummary(false);
    }
  };

  const deleteImportYear = async (year) => {
    if (!window.confirm(`Delete all SCImago ranking data and import history for ${year}? Journal records and shared metrics will be kept.`)) return;
    setDeletingImportYear(year);
    setImportSummaryError('');
    setImportSummaryNotice('');
    try {
      const response = await api.delete(`/admin/imports/scimago/${year}`);
      const result = response.data?.data || response.data;
      setImportSummaryNotice(`Deleted ${Number(result?.ranking_values_deleted || 0).toLocaleString()} ranking values for ${year}.`);
      const summaryResponse = await api.get('/admin/imports/scimago/summary');
      const summary = summaryResponse.data?.data || summaryResponse.data;
      setImportSummaryYears(summary?.years || []);
    } catch (error) {
      setImportSummaryError(error.response?.data?.message || `Could not delete SCImago data for ${year}.`);
    } finally {
      setDeletingImportYear(null);
    }
  };

  return (
    <div className="admin-page admin-data-sources space-y-6 text-left">
      <PageHeader
        breadcrumbs={[
          { label: 'Management' },
          { label: 'Data Sources' }
        ]}
        title="Data Sources"
        description="Manage the OpenAlex API key and import journal rankings for in-depth analysis."
      />
      {message && <Alert variant={message.type === 'danger' ? 'destructive' : message.type} onDismiss={() => setMessage(null)}>{message.text}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 admin-data-sources__grid">
        <Card className="admin-data-sources__card p-6 bg-surface border border-border rounded-xl shadow-2xs">
          <div>
            <div className="admin-data-sources__title flex items-center gap-3 mb-4">
              <span className="size-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                <Icon icon="lucide:key-round" width="20" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">OpenAlex API key</h2>
                <p className="text-xs text-muted-foreground">Rotate the key used by Worker requests to OpenAlex.</p>
              </div>
            </div>
            {loadingKey ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-9 w-32" />
              </div>
            ) : (
              <>
                <div className="admin-data-sources__status flex items-center gap-2 text-xs font-medium text-foreground mb-4">
                  <span className={`inline-block size-2 rounded-full ${keyStatus?.configured ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                  {keyStatus?.keyUnreadable ? 'An admin key is stored but cannot be decrypted' : keyStatus?.configured ? `Configured via ${keyStatus.source === 'admin' ? 'admin settings' : 'Worker environment'}${keyStatus.maskedSuffix ? ` · ending ${keyStatus.maskedSuffix}` : ''}` : 'No key configured'}
                </div>
                {keyStatus?.keyUnreadable && <Alert variant="warning" className="mb-4">The stored key was encrypted with a different or unavailable Worker secret. Enter a replacement key and rotate it to restore OpenAlex requests.</Alert>}
                {keyStatus && !keyStatus.keyUnreadable && !keyStatus.encryptionReady && <Alert variant="warning" className="mb-4">Worker secret OPENALEX_CONFIG_ENCRYPTION_KEY (at least 32 characters) is required before an admin key can be stored.</Alert>}
                <form onSubmit={saveKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">New OpenAlex key</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={apiKey}
                      onChange={event => setApiKey(event.target.value)}
                      placeholder="Paste the replacement key"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">The key is validated with OpenAlex and stored encrypted. It is never shown after saving.</p>
                  </div>
                  <div className="admin-data-sources__actions flex flex-wrap gap-2 pt-2">
                    <Button type="submit" disabled={!apiKey.trim() || (!keyStatus?.encryptionReady && !keyStatus?.keyUnreadable)} isLoading={savingKey} loadingText="Validating…">
                      Validate and rotate key
                    </Button>
                    {(keyStatus?.source === 'admin' || keyStatus?.keyUnreadable) && <Button variant="outline" onClick={clearKey} isLoading={clearingKey} loadingText="Removing…">Use Worker environment key</Button>}
                    <Button variant="outline" onClick={loadKeyStatus} isLoading={loadingKey} loadingText="Refreshing…">Refresh</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Card>

        <Card className="admin-data-sources__card p-6 bg-surface border border-border rounded-xl shadow-2xs">
          <div>
            <div className="admin-data-sources__title flex items-center gap-3 mb-4">
              <span className="size-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                <Icon icon="lucide:table-properties" width="20" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">SCImago journal rankings</h2>
                <p className="text-xs text-muted-foreground">Import SJR, best quartile, and H-index values used by deep analytics.</p>
              </div>
            </div>
            <Alert variant="info" className="mb-4 text-xs">Choose the SCImago Journal Rank CSV export. The file should include journal title, ISSN, SJR, and SJR Best Quartile. A Year column is used when present; otherwise the selected year is applied. Rankings and import history are stored directly in Cloudflare D1.</Alert>

            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={toggleImportSummary}>
                  <Icon icon="lucide:chart-column-increasing" width="16" />
                  {showImportSummary ? 'Hide import summary' : 'View imported years'}
                </Button>
              </div>
              {showImportSummary && (
                <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface" aria-live="polite">
                  <div className="border-b border-border px-3 py-2">
                    <h4 className="text-sm font-semibold text-foreground">Imported SCImago data by year</h4>
                    <p className="text-xs text-muted-foreground">Counts reflect ranking records currently stored in D1.</p>
                  </div>
                  {loadingImportSummary ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">Loading yearly totals…</p>
                  ) : importSummaryError ? (
                    <Alert variant="destructive" className="m-3 text-xs">{importSummaryError}</Alert>
                  ) : importSummaryYears.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No imported ranking data is available in D1 yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      {importSummaryNotice && <Alert variant="success" className="m-3 text-xs">{importSummaryNotice}</Alert>}
                      <table className="w-full min-w-[680px] text-left text-xs">
                        <thead className="bg-surface-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Year</th>
                            <th className="px-3 py-2 text-right font-semibold">Ranking values</th>
                            <th className="px-3 py-2 text-right font-semibold">Journals</th>
                            <th className="px-3 py-2 text-right font-semibold">Metrics</th>
                            <th className="px-3 py-2 text-right font-semibold">CSV rows</th>
                            <th className="px-3 py-2 text-right font-semibold">Completed batches</th>
                            <th className="px-3 py-2 text-right font-semibold">Status</th>
                            <th className="px-3 py-2 text-right font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importSummaryYears.map(item => (
                            <tr key={item.year} className="border-t border-border">
                              <td className="px-3 py-2 font-semibold text-foreground">{item.year}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{Number(item.ranking_values || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{Number(item.journals || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{Number(item.metrics || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{Number(item.imported_rows || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{Number(item.completed_batches || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-right">{String(item.status || '').replaceAll('_', ' ').toLowerCase()}</td>
                              <td className="px-3 py-2 text-right">
                                <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-destructive" disabled={deletingImportYear !== null} isLoading={deletingImportYear === item.year} loadingText="Deleting…" onClick={() => deleteImportYear(item.year)}>
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {importMessage && (
              <Alert
                variant={importMessage.type === 'danger' ? 'destructive' : importMessage.type}
                className="mb-4 text-xs"
                onDismiss={dismissImportMessage}
              >
                {importMessage.text}
              </Alert>
            )}

            {canResume && !isImporting && (
              <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-foreground space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Icon icon="lucide:alert-circle" width="16" />
                    Unfinished import session detected
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Batch {importProgress?.completed || 0}/{importProgress?.total || 0} ({importProgress?.percent || 0}%)
                  </span>
                </div>
                <p className="text-muted-foreground">
                  File: <strong>{activeFileName}</strong> · Ranking year: {year}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={resumeImport}>
                    Resume import
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSession}>
                    Discard &amp; start new
                  </Button>
                </div>
              </div>
            )}

            {isImporting ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Importing: <strong className="text-foreground">{activeFileName}</strong>
                    {activeFileSize ? ` · ${(activeFileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                  </span>
                  <span className="font-semibold text-primary">{importProgress?.percent || 0}%</span>
                </div>

                <div className="space-y-1.5" aria-live="polite">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{importProgress?.phase || 'Processing batches…'}</span>
                    <span>{importProgress?.total ? `Batch ${importProgress.completed}/${importProgress.total}` : ''}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={importProgress?.percent || 0}>
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${importProgress?.percent || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button disabled isLoading loadingText="Importing in batches…">
                    Importing in batches…
                  </Button>
                  <Button variant="outline" onClick={pauseImport}>
                    Pause import
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">SCImago CSV file</label>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      disabled={isImporting}
                      onChange={event => {
                        const nextFile = event.target.files?.[0] || null;
                        setFile(nextFile);
                        dismissImportMessage();
                      }}
                      className="w-full text-xs text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Ranking year</label>
                    <input
                      type="number"
                      min="1990"
                      max="2100"
                      value={year}
                      onChange={event => setYear(Number(event.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                {file && <div className="text-xs text-muted-foreground">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
                <div className="admin-data-sources__actions pt-2">
                  <Button type="submit" disabled={!file || isImporting}>Import rankings</Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
