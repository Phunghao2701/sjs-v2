import { useEffect, useState } from 'react';
import Icon from '../../../shared/components/Icon';
import api from '../../../shared/services/api';
import { Alert } from '../../../shared/ui/alert';
import { Button } from '../../../shared/ui/button';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Card } from '../../../shared/ui/card';

const statusPath = '/admin/integrations/openalex';
const importPath = '/admin/imports/scimago';
const MAX_IMPORT_BYTES = 50 * 1024 * 1024;
const MAX_CHUNK_BYTES = 256 * 1024;
const MAX_CHUNK_ROWS = 50;

function splitCsvRecords(text) {
  const input = String(text || '').replace(/^\uFEFF/, '');
  const records = [];
  let start = 0;
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') index += 1;
      else quoted = !quoted;
      continue;
    }
    if (!quoted && (char === '\n' || char === '\r')) {
      const end = char === '\r' && input[index + 1] === '\n' ? ++index + 1 : index + 1;
      const record = input.slice(start, end);
      if (record.trim()) records.push(record);
      start = end;
    }
  }
  if (quoted) throw new Error('The SCImago CSV contains an unclosed quoted field.');
  const lastRecord = input.slice(start);
  if (lastRecord.trim()) records.push(lastRecord);
  if (!records.length) throw new Error('The SCImago CSV is empty.');
  return records;
}

function makeCsvBatches(records) {
  const batches = [];
  let rows = [];
  let size = 0;
  for (const record of records) {
    const bytes = new TextEncoder().encode(record).byteLength;
    if (bytes > MAX_CHUNK_BYTES) throw new Error('A single SCImago row exceeds the 256 KB batch limit.');
    if (rows.length && (rows.length >= MAX_CHUNK_ROWS || size + bytes > MAX_CHUNK_BYTES)) {
      batches.push(rows.join(''));
      rows = [];
      size = 0;
    }
    rows.push(record);
    size += bytes;
  }
  if (rows.length) batches.push(rows.join(''));
  return batches;
}

async function postChunkWithRetry(url, body) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await api.post(url, body);
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const transient = !status || status === 408 || status === 429 || status >= 500;
      if (!transient) throw error;
      if (attempt < 2) await new Promise(resolve => window.setTimeout(resolve, 500 * (2 ** attempt)));
    }
  }
  throw lastError;
}

export default function AdminDataSourcesPage() {
  const [keyStatus, setKeyStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [clearingKey, setClearingKey] = useState(false);
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [message, setMessage] = useState(null);

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

  useEffect(() => { loadKeyStatus(); }, []);

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

  const importScimago = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage({ type: 'danger', text: 'The SCImago CSV must be 50 MB or smaller.' });
      return;
    }
    setImporting(true); setMessage(null); setImportProgress({ percent: 0, completed: 0, total: 0, phase: 'Reading CSV...' });
    try {
      const records = splitCsvRecords(await file.text());
      if (records.length < 2) throw new Error('The SCImago CSV must contain a header and at least one data row.');
      const header = records.shift();
      const batches = makeCsvBatches(records);
      setImportProgress({ percent: 0, completed: 0, total: batches.length, phase: 'Starting import...' });

      const startResponse = await api.post(importPath, { file_name: file.name, header, year: Number(year) });
      const started = startResponse.data?.data || startResponse.data;
      if (!started?.import_id) throw new Error('The Worker did not return an import ID.');
      for (let index = 0; index < batches.length; index += 1) {
        await postChunkWithRetry(`${importPath}/${started.import_id}/chunks`, { batch_index: index, csv: batches[index] });
        setImportProgress({ percent: Math.round(((index + 1) / batches.length) * 95), completed: index + 1, total: batches.length, phase: 'Importing journal rankings...' });
      }
      const completeResponse = await api.post(`${importPath}/${started.import_id}/complete`, { total_chunks: batches.length });
      const result = completeResponse.data?.data || completeResponse.data;
      setImportProgress({ percent: 100, completed: batches.length, total: batches.length, phase: 'Import complete' });
      setMessage({ type: 'success', text: `Import complete: ${result.imported || 0} journal records processed; ${result.unmatched || 0} ISSNs did not match the journal catalog.` });
      setFile(null);
      form.reset();
    } catch (error) {
      setImportProgress(progress => progress ? { ...progress, phase: 'Import failed' } : null);
      setMessage({ type: 'danger', text: error.response?.data?.message || error.message || 'Could not import the SCImago file.' });
    } finally { setImporting(false); }
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
            <Alert variant="info" className="mb-4 text-xs">Choose the SCImago Journal Rank CSV export. The file should include journal title, ISSN, SJR, and SJR Best Quartile. A Year column is used when present; otherwise the selected year is applied.</Alert>
            <form onSubmit={importScimago} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">SCImago CSV file</label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    disabled={importing}
                    onChange={event => { setFile(event.target.files?.[0] || null); setMessage(null); setImportProgress(null); }}
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
                    onChange={event => setYear(event.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              {file && <div className="text-xs text-muted-foreground">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
              {importProgress && <div className="space-y-1" aria-live="polite"><div className="flex justify-between text-xs text-muted-foreground"><span>{importProgress.phase}</span><span>{importProgress.percent}%{importProgress.total ? ` · Batch ${importProgress.completed}/${importProgress.total}` : ''}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={importProgress.percent} aria-label="SCImago import progress"><div className="h-full bg-primary transition-all" style={{ width: `${importProgress.percent}%` }} /></div></div>}
              <div className="admin-data-sources__actions pt-2">
                <Button type="submit" disabled={!file || importing} isLoading={importing} loadingText="Importing in batches…">Import rankings</Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
