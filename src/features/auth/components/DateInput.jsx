/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\DateInput.jsx
 */
import { useState } from 'react';
import Icon from '../../../shared/components/Icon';

export default function DateInput({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  ...props
}) {
  const today = new Date().toISOString().split('T')[0];
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-3">
      {label && (
        <label 
          htmlFor={`date-field-${name}`}
          className="text-xs font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wider text-foreground"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}
      
      <div 
        className="flex items-center rounded-lg overflow-hidden border bg-surface transition-colors"
        style={{
          borderColor: error ? 'var(--ds-danger, #ef4444)' : (isFocused ? 'var(--primary, #0071BC)' : 'var(--border, #e2e8f0)'),
        }}
      >
        <div 
          className="bg-transparent border-0 pe-1 text-muted-foreground flex items-center justify-center shrink-0 w-10"
        >
          <Icon icon="lucide:calendar" width="18" className="text-muted-foreground opacity-70" />
        </div>
        
        <input
          id={`date-field-${name}`}
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          max={today}
          disabled={disabled}
          className="flex-1 w-full bg-transparent border-0 text-foreground text-sm py-2.5 ps-2 focus:outline-none focus:ring-0"
          {...props}
        />
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
