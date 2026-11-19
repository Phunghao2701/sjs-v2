import { create } from 'zustand';
import api from '../../shared/services/api';
import {
  saveImportSessionToDb,
  loadImportSessionFromDb,
  clearImportSessionFromDb,
} from '../../features/admin/services/scimagoImportStorage';

const importPath = '/admin/imports/scimago';
const IMPORT_SESSION_STORAGE_KEY = 'admin.scimagoImportSession';
const MAX_IMPORT_BYTES = 50 * 1024 * 1024;
const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
const MAX_CHUNK_ROWS = 250;
const MAX_CHUNK_ATTEMPTS = 8;
const MAX_RETRY_DELAY_MS = 30000;

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

function handleBeforeUnload(e) {
  e.preventDefault();
  e.returnValue = 'SCImago import is in progress. Are you sure you want to leave?';
  return e.returnValue;
}

function setBeforeUnloadGuard(enable) {
  if (typeof window === 'undefined') return;
  if (enable) {
    window.addEventListener('beforeunload', handleBeforeUnload);
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }
}

async function postChunkWithRetry(url, body, onRetry, signal) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt += 1) {
    if (signal?.aborted) {
      throw new Error('Import aborted by user.');
    }
    try {
      return await api.post(url, body, { signal });
    } catch (error) {
      if (signal?.aborted || error.name === 'CanceledError' || error.name === 'AbortError') {
        throw new Error('Import aborted by user.');
      }
      lastError = error;
      const status = error.response?.status;
      const transient = !status || status === 408 || status === 429 || status >= 500;
      if (!transient) throw error;
      if (attempt < MAX_CHUNK_ATTEMPTS) {
        const delay = Math.min(2000 * (2 ** (attempt - 1)), MAX_RETRY_DELAY_MS);
        const jitter = Math.floor(Math.random() * 500);
        onRetry?.({ attempt: attempt + 1, error, delay: delay + jitter });
        await new Promise((resolve) => window.setTimeout(resolve, delay + jitter));
      }
    }
  }
  throw lastError;
}

export const useScimagoImportStore = create((set, get) => ({
  status: 'idle', // 'idle' | 'reading' | 'importing' | 'paused' | 'completed' | 'failed'
  isImporting: false,
  fileName: null,
  fileSize: null,
  fileLastModified: null,
  year: new Date().getFullYear() - 1,
  importId: null,
  batches: [],
  uploadedIndexes: [],
  importProgress: null,
  message: null,
  abortController: null,
  canResume: false,

  setYear: (year) => set({ year }),
  setMessage: (message) => set({ message }),
  dismissMessage: () => set({ message: null }),

  /**
   * Initializes store on startup or page mount. Checks for any interrupted session in IndexedDB.
   */
  init: async () => {
    const currentStatus = get().status;
    if (currentStatus === 'importing' || currentStatus === 'reading') return;

    try {
      const stored = await loadImportSessionFromDb();
      if (stored?.importId && Array.isArray(stored.batches) && stored.batches.length > 0) {
        const uploaded = new Set(stored.uploadedIndexes || []);
        const total = stored.batches.length;
        const completed = uploaded.size;
        const canResume = completed < total;

        set({
          importId: stored.importId,
          fileName: stored.fileName,
          fileSize: stored.fileSize,
          fileLastModified: stored.fileLastModified,
          year: stored.year || new Date().getFullYear() - 1,
          batches: stored.batches,
          uploadedIndexes: stored.uploadedIndexes || [],
          canResume,
          status: canResume ? 'paused' : 'idle',
          importProgress: canResume
            ? {
                percent: Math.round((completed / total) * 95),
                completed,
                total,
                phase: `Paused at batch ${completed}/${total}`,
              }
            : null,
        });
      }
    } catch (err) {
      console.warn('Failed to restore import session from IndexedDB:', err);
    }
  },

  /**
   * Starts a brand new import session with a selected file.
   */
  startImport: async (file, yearValue) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      set({ message: { type: 'danger', text: 'The SCImago CSV must be 50 MB or smaller.' } });
      return;
    }

    const abortController = new AbortController();
    setBeforeUnloadGuard(true);

    set({
      status: 'reading',
      isImporting: true,
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
      year: Number(yearValue),
      abortController,
      message: null,
      importProgress: { percent: 0, completed: 0, total: 0, phase: 'Reading and parsing CSV...' },
    });

    try {
      const text = await file.text();
      const records = splitCsvRecords(text);
      if (records.length < 2) {
        throw new Error('The SCImago CSV must contain a header and at least one data row.');
      }
      const header = records.shift();
      const batches = makeCsvBatches(records);

      set({
        importProgress: { percent: 0, completed: 0, total: batches.length, phase: 'Registering import session...' },
      });

      const startResponse = await api.post(importPath, {
        file_name: file.name,
        header,
        year: Number(yearValue),
      });
      const started = startResponse.data?.data || startResponse.data;
      if (!started?.import_id) {
        throw new Error('The server did not return an import ID.');
      }

      const sessionData = {
        importId: started.import_id,
        fileName: file.name,
        fileSize: file.size,
        fileLastModified: file.lastModified,
        year: Number(yearValue),
        batches,
        uploadedIndexes: [],
      };

      await saveImportSessionToDb(sessionData);

      try {
        window.sessionStorage.setItem(
          IMPORT_SESSION_STORAGE_KEY,
          JSON.stringify({
            importId: started.import_id,
            fileName: file.name,
            fileSize: file.size,
            fileLastModified: file.lastModified,
            year: Number(yearValue),
            uploadedIndexes: [],
          })
        );
      } catch {
        // Continue if sessionStorage is full
      }

      set({
        importId: started.import_id,
        batches,
        uploadedIndexes: [],
        canResume: false,
      });

      await get().runUploadLoop(started.import_id, batches, new Set(), abortController.signal);
    } catch (error) {
      setBeforeUnloadGuard(false);
      if (abortController.signal.aborted) {
        set({
          status: 'paused',
          isImporting: false,
          canResume: true,
          message: { type: 'warning', text: 'Import paused by user. You can resume at any time.' },
        });
        return;
      }

      const errMsg =
        error.response?.data?.message ||
        (!error.response && error.message === 'Network Error'
          ? 'Worker connection failed without a readable response (network or CORS issue).'
          : error.message) ||
        'Could not import the SCImago file.';

      set({
        status: 'failed',
        isImporting: false,
        canResume: get().batches.length > 0,
        message: {
          type: 'danger',
          text: get().uploadedIndexes.length > 0
            ? `${errMsg} Completed batches are saved. Click "Resume import" to continue safely.`
            : errMsg,
        },
      });
    }
  },

  /**
   * Resumes an existing paused import session.
   */
  resumeImport: async () => {
    const { importId, batches, uploadedIndexes, isImporting } = get();
    if (isImporting || !importId || !batches?.length) return;

    const abortController = new AbortController();
    setBeforeUnloadGuard(true);

    set({
      status: 'importing',
      isImporting: true,
      abortController,
      message: null,
    });

    const uploadedSet = new Set(uploadedIndexes);
    try {
      await get().runUploadLoop(importId, batches, uploadedSet, abortController.signal);
    } catch (error) {
      setBeforeUnloadGuard(false);
      if (abortController.signal.aborted) {
        set({
          status: 'paused',
          isImporting: false,
          canResume: true,
          message: { type: 'warning', text: 'Import paused. You can resume at any time.' },
        });
        return;
      }

      const errMsg =
        error.response?.data?.message ||
        (!error.response && error.message === 'Network Error'
          ? 'Worker connection failed without a readable response.'
          : error.message) ||
        'Could not resume import.';

      set({
        status: 'failed',
        isImporting: false,
        canResume: true,
        message: { type: 'danger', text: `${errMsg} You can click "Resume import" to retry.` },
      });
    }
  },

  /**
   * Main chunk upload loop. Runs in the background independently of page mounting.
   */
  runUploadLoop: async (importId, batches, uploadedBatches, signal) => {
    set({ status: 'importing', isImporting: true });
    let completed = uploadedBatches.size;
    const totalBatches = batches.length;
    const CONCURRENCY = 4;

    const pendingIndexes = [];
    for (let i = 0; i < totalBatches; i += 1) {
      if (!uploadedBatches.has(i)) pendingIndexes.push(i);
    }

    let cursor = 0;
    const worker = async () => {
      while (cursor < pendingIndexes.length) {
        if (signal?.aborted) throw new Error('Import aborted by user.');
        const batchIndex = pendingIndexes[cursor++];
        if (batchIndex === undefined) break;

        await postChunkWithRetry(
          `${importPath}/${importId}/chunks`,
          {
            batch_index: batchIndex,
            csv: batches[batchIndex],
          },
          ({ attempt, delay }) => {
            set({
              importProgress: {
                percent: Math.round((completed / totalBatches) * 95),
                completed,
                total: totalBatches,
                phase: `Connection retry ${attempt}/${MAX_CHUNK_ATTEMPTS} for batch ${batchIndex + 1} in ${Math.ceil(delay / 1000)}s...`,
              },
            });
          },
          signal
        );

        uploadedBatches.add(batchIndex);
        completed += 1;

        const nextUploadedIndexes = [...uploadedBatches];
        set({
          uploadedIndexes: nextUploadedIndexes,
          importProgress: {
            percent: Math.round((completed / totalBatches) * 95),
            completed,
            total: totalBatches,
            phase: `Importing batch ${completed} of ${totalBatches}...`,
          },
        });

        if (completed % 10 === 0 || completed === totalBatches) {
          const { fileName, fileSize, fileLastModified, year } = get();
          saveImportSessionToDb({
            importId,
            fileName,
            fileSize,
            fileLastModified,
            year,
            batches,
            uploadedIndexes: nextUploadedIndexes,
          });

          try {
            window.sessionStorage.setItem(
              IMPORT_SESSION_STORAGE_KEY,
              JSON.stringify({
                importId,
                fileName,
                fileSize,
                fileLastModified,
                year,
                uploadedIndexes: nextUploadedIndexes,
              })
            );
          } catch {}
        }
      }
    };

    const workers = Array.from(
      { length: Math.min(CONCURRENCY, pendingIndexes.length) },
      () => worker()
    );
    await Promise.all(workers);

    // Complete import
    set({
      importProgress: {
        percent: 98,
        completed: batches.length,
        total: batches.length,
        phase: 'Finalizing import on server...',
      },
    });

    const completeResponse = await api.post(`${importPath}/${importId}/complete`, {
      total_chunks: batches.length,
    });
    const result = completeResponse.data?.data || completeResponse.data;

    setBeforeUnloadGuard(false);
    await clearImportSessionFromDb();
    try {
      window.sessionStorage.removeItem(IMPORT_SESSION_STORAGE_KEY);
    } catch {}

    set({
      status: 'completed',
      isImporting: false,
      canResume: false,
      importProgress: {
        percent: 100,
        completed: batches.length,
        total: batches.length,
        phase: 'Import complete',
      },
      message: {
        type: 'success',
        text: `Import complete: ${result?.imported || 0} journal records processed; ${result?.unmatched || 0} ISSNs did not match the journal catalog.`,
      },
    });
  },

  /**
   * Pauses the active import gracefully.
   */
  pauseImport: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    setBeforeUnloadGuard(false);
    set({
      status: 'paused',
      isImporting: false,
      canResume: true,
      message: { type: 'warning', text: 'Import paused. You can resume whenever you are ready.' },
    });
  },

  /**
   * Clears the current session and resets back to idle.
   */
  clearSession: async () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    setBeforeUnloadGuard(false);
    await clearImportSessionFromDb();
    try {
      window.sessionStorage.removeItem(IMPORT_SESSION_STORAGE_KEY);
    } catch {}

    set({
      status: 'idle',
      isImporting: false,
      fileName: null,
      fileSize: null,
      fileLastModified: null,
      importId: null,
      batches: [],
      uploadedIndexes: [],
      importProgress: null,
      message: null,
      abortController: null,
      canResume: false,
    });
  },
}));
