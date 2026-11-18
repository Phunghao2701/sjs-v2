import { cn } from '../../../lib/utils';

/**
 * Shared component cho ô Dropdown (Select) trong các Filter Card.
 * 
 * @param {Array} options - Mảng các { value, label, title }
 */
export default function FilterSelect({ 
  value, 
  onChange, 
  options = [], 
  disabled = false, 
  className = '', 
  style = {} 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "h-9 rounded-md border border-border bg-surface px-3 py-1 text-sm text-text-main shadow-none transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={style}
    >
      {options.map((opt, idx) => (
        <option 
          key={opt.value || idx} 
          value={opt.value} 
          title={opt.title || opt.label}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
