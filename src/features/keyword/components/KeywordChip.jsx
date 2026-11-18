import Icon from '../../../shared/components/Icon';

const KeywordChip = ({ keyword, count, icon, onClick, isTrending = false, onRemove }) => {
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        isTrending 
          ? 'bg-surface-muted/60 text-foreground border-border hover:border-primary/40' 
          : 'bg-primary-subtle text-primary border-primary/30 shadow-2xs'
      }`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Icon icon="lucide:sparkles" width={13} className="text-primary shrink-0" />
      <span>{keyword}</span>
      {count && (
        <span className="text-[10px] font-mono font-bold bg-primary/10 px-1.5 py-0.2 rounded-full">
          +{count}
        </span>
      )}
      {icon && <span className="text-amber-500 shrink-0">{icon}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(keyword);
          }}
          className="ml-1 text-muted-foreground hover:text-foreground p-0.5 border-0 bg-transparent cursor-pointer inline-flex items-center"
          title="Remove"
          aria-label="Remove keyword"
        >
          <Icon icon="lucide:x" width={12} />
        </button>
      )}
    </div>
  );
};

export default KeywordChip;
