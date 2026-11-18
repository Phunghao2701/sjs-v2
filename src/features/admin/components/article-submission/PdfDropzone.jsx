import { useTranslation } from "react-i18next";
import { useState, useRef } from 'react';
import { Button } from '../../../../shared/ui/button';
import Icon from '../../../../shared/components/Icon';

/**
 * PdfDropzone Component
 * Interactive drag-and-drop zone for uploading PDF manuscripts.
 */
export default function PdfDropzone({
  selectedFile,
  onFileSelect,
  onFileRemove
}) {
  const { t } = useTranslation();
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Maximum allowed file size: 25MB
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

  const validateAndProcessFile = file => {
    setError('');
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF manuscripts are accepted.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File size exceeds the 25MB limit. Please upload a compressed version.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatBytes = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {error && (
        <div className="py-2.5 px-3.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 mb-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Hidden native input file */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,application/pdf" className="hidden" />

      {!selectedFile ? (
        // Dropzone Area
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center ${
            isDragActive ? 'border-primary bg-primary-subtle/10' : 'border-border bg-surface hover:bg-muted/30'
          }`}
        >
          <div className="size-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-3">
            <Icon icon="lucide:cloud-upload" width="26" />
          </div>

          <h5 className="font-bold text-foreground mb-1 text-base font-display">
            Click to upload or drag and drop
          </h5>
          <p className="text-muted-foreground text-xs mb-4">PDF files only (max. 25MB)</p>

          <Button
            type="button"
            className="px-5 py-2 rounded-full"
            onClick={e => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            Browse Files
          </Button>
        </div>
      ) : (
        // Selected File Display panel
        <div className="p-4 rounded-xl border border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Icon icon="lucide:file-text" width="24" />
              </div>
              <div>
                <div className="font-bold text-foreground truncate max-w-[280px] text-sm">
                  {selectedFile.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatBytes(selectedFile.size)} {t("admin.aPdfDocument")}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors border-0 bg-transparent rounded-full cursor-pointer"
              title="Remove File"
            >
              <Icon icon="lucide:trash" width="18" />
            </button>
          </div>

          {/* Submission status */}
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{t("admin.chuaCoApiUploadPdfArticleDaXoa")}</span>
              <span className="font-semibold text-primary">N/A</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="bg-primary h-full w-0 transition-all duration-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
