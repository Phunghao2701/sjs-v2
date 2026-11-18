import Icon from '../../../../shared/components/Icon';

/**
 * SubmissionTabs Component
 * Toggles between Manual Entry and PDF Upload submission modes.
 */
export default function SubmissionTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-6 mb-6 border-b border-border px-4">
      {/* Manual Entry Tab */}
      <button 
        type="button"
        className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
          activeTab === 'manual' 
            ? 'border-primary text-primary font-semibold' 
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => onTabChange('manual')}
      >
        <Icon icon="lucide:edit-3" width="18" />
        <span>Manual Entry</span>
      </button>

      {/* PDF Upload Tab */}
      <button 
        type="button"
        className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors cursor-pointer bg-transparent ${
          activeTab === 'pdf' 
            ? 'border-primary text-primary font-semibold' 
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => onTabChange('pdf')}
      >
        <Icon icon="lucide:file-text" width="18" />
        <span>PDF Upload</span>
      </button>
    </div>
  );
}
