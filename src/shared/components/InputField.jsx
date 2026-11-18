/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\InputField.jsx
 */
import Icon from './Icon';
import { useState } from 'react';
import { FormField } from '../ui/form-field';

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon,
  required = false,
  disabled = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const inputId = props.id || `auth-field-${name}`;
  return (
    <div className="mb-3">
      <FormField id={inputId} label={label} required={required} error={error} associateChild={false} labelClassName="text-xs font-bold uppercase tracking-wider" className="gap-1.5">
        <div 
          className="flex items-center rounded-lg border overflow-hidden bg-surface transition-colors"
          style={{
            borderColor: error ? 'var(--ds-danger, #ef4444)' : (isFocused ? 'var(--primary, #0071BC)' : 'var(--border, #e2e8f0)'),
          }}
        >
          {icon && (
            <div 
              className="bg-transparent border-0 pe-1 text-muted-foreground flex items-center justify-center shrink-0 w-10"
            >
              <Icon icon={icon} width="18" className="text-muted-foreground opacity-70" />
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
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
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="flex-1 w-full bg-transparent border-0 text-foreground text-sm py-2.5 ps-2 placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            {...props}
          />
        </div>
      </FormField>
    </div>
  );
}
