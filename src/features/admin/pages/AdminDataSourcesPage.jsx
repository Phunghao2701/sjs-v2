import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
import api from '../../../shared/services/api';

const statusPath = '/admin/integrations/openalex';
const importPath = '/admin/imports/scimago';

export default function AdminDataSourcesPage() {
  const [keyStatus, setKeyStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [clearingKey, setClearingKey] = useState(false);
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [importing, setImporting] = useState(false);
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
    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'danger', text: 'The SCImago CSV must be 8 MB or smaller.' });
      return;
    }
    setImporting(true); setMessage(null);
    try {
      const csv = await file.text();
      const response = await api.post(importPath, { file_name: file.name, csv, year: Number(year) });
      const result = response.data?.data || response.data;
      setMessage({ type: 'success', text: `Import complete: ${result.imported || 0} journal records processed; ${result.unmatched || 0} ISSNs did not match the journal catalog.` });
      setFile(null);
      form.reset();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Could not import the SCImago file.' });
    } finally { setImporting(false); }
  };

  return (
    <div className="admin-page admin-data-sources">
      <div className="admin-page__header">
        <div>
          <div className="admin-page__breadcrumb">Management <span>/</span> Data Sources</div>
          <h1>Data Sources</h1>
          <p>Manage the OpenAlex API key and import journal rankings for in-depth analysis.</p>
        </div>
      </div>
      {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

      <div className="admin-data-sources__grid">
        <Card className="admin-data-sources__card">
          <Card.Body>
            <div className="admin-data-sources__title"><span className="admin-data-sources__icon"><Icon icon="lucide:key-round" /></span><div><h2>OpenAlex API key</h2><p>Rotate the key used by Worker requests to OpenAlex.</p></div></div>
            {loadingKey ? <div className="admin-data-sources__loading"><Spinner size="sm" /> Loading key status…</div> : (
              <>
                <div className="admin-data-sources__status"><span className={`admin-data-sources__dot ${keyStatus?.configured ? 'is-on' : ''}`} />
                  {keyStatus?.keyUnreadable ? 'An admin key is stored but cannot be decrypted' : keyStatus?.configured ? `Configured via ${keyStatus.source === 'admin' ? 'admin settings' : 'Worker environment'}${keyStatus.maskedSuffix ? ` · ending ${keyStatus.maskedSuffix}` : ''}` : 'No key configured'}
                </div>
                {keyStatus?.keyUnreadable && <Alert variant="warning">The stored key was encrypted with a different or unavailable Worker secret. Enter a replacement key and rotate it to restore OpenAlex requests.</Alert>}
                {keyStatus && !keyStatus.keyUnreadable && !keyStatus.encryptionReady && <Alert variant="warning">Worker secret OPENALEX_CONFIG_ENCRYPTION_KEY (at least 32 characters) is required before an admin key can be stored.</Alert>}
                <Form onSubmit={saveKey}>
                  <Form.Group className="mb-3">
                    <Form.Label>New OpenAlex key</Form.Label>
                    <Form.Control type="password" autoComplete="new-password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="Paste the replacement key" />
                    <Form.Text>The key is validated with OpenAlex and stored encrypted. It is never shown after saving.</Form.Text>
                  </Form.Group>
                  <div className="admin-data-sources__actions">
                    <Button type="submit" disabled={savingKey || !apiKey.trim() || (!keyStatus?.encryptionReady && !keyStatus?.keyUnreadable)}>
                      {savingKey ? <><Spinner size="sm" /> Validating…</> : 'Validate and rotate key'}
                    </Button>
                    {(keyStatus?.source === 'admin' || keyStatus?.keyUnreadable) && <Button variant="outline-secondary" onClick={clearKey} disabled={clearingKey}>{clearingKey ? 'Removing…' : 'Use Worker environment key'}</Button>}
                    <Button variant="outline-secondary" onClick={loadKeyStatus} disabled={loadingKey}>Refresh</Button>
                  </div>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>

        <Card className="admin-data-sources__card">
          <Card.Body>
            <div className="admin-data-sources__title"><span className="admin-data-sources__icon"><Icon icon="lucide:table-properties" /></span><div><h2>SCImago journal rankings</h2><p>Import SJR, best quartile, and H-index values used by deep analytics.</p></div></div>
            <Alert variant="info" className="admin-data-sources__hint">Choose the SCImago Journal Rank CSV export. The file should include journal title, ISSN, SJR, and SJR Best Quartile. A Year column is used when present; otherwise the selected year is applied.</Alert>
            <Form onSubmit={importScimago}>
              <div className="admin-data-sources__form-row">
                <Form.Group className="flex-grow-1"><Form.Label>SCImago CSV file</Form.Label><Form.Control type="file" accept=".csv,text/csv" onChange={event => { setFile(event.target.files?.[0] || null); setMessage(null); }} /></Form.Group>
                <Form.Group className="admin-data-sources__year"><Form.Label>Ranking year</Form.Label><Form.Control type="number" min="1990" max="2100" value={year} onChange={event => setYear(event.target.value)} /></Form.Group>
              </div>
              {file && <div className="admin-data-sources__file">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
              <div className="admin-data-sources__actions"><Button type="submit" disabled={importing || !file}>{importing ? <><Spinner size="sm" /> Importing…</> : 'Import rankings'}</Button></div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
