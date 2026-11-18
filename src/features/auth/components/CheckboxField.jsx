/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\CheckboxField.jsx
 */
import Icon from '../../../shared/components/Icon';

export default function CheckboxField({
  name,
  checked,
  onChange,
  error,
  disabled = false,
  labelMarkup
}) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          id={`checkbox-${name}`}
          className="mt-0.5 rounded border border-border text-primary focus:ring-0 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            borderColor: error ? 'var(--ds-danger, #ef4444)' : undefined,
          }}
        />
        <label
          htmlFor={`checkbox-${name}`}
          className="text-muted-foreground text-xs font-normal mb-0 select-none leading-relaxed cursor-pointer"
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {labelMarkup}
        </label>
      </div>

      {error && (
        <div 
          className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium animate-fade-in"
        >
          <Icon icon="lucide:alert-circle" width="12" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
