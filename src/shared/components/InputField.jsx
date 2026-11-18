/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\InputField.jsx
 */
import { Form, InputGroup } from 'react-bootstrap';
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
    <Form.Group className="mb-3">
      <FormField id={inputId} label={label} required={required} error={error} associateChild={false} labelClassName="text-xs fw-bold text-uppercase" className="gap-1.5">
      
      <InputGroup 
        className="rounded-3 overflow-hidden border"
        style={{
          borderColor: error ? 'var(--ds-danger)' : (isFocused ? 'var(--primary)' : 'var(--border)'),
          background: '#ffffff',
          transition: 'all 0.2s ease-in-out',
          boxShadow: error 
          ? '0 0 0 3px color-mix(in srgb, var(--ds-danger) 14%, transparent)'
            : (isFocused ? '0 0 0 3px rgba(0, 113, 188, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.02)')
        }}
      >
        {icon && (
          <InputGroup.Text 
            className="bg-transparent border-0 pe-1 text-muted-custom d-flex align-items-center justify-content-center"
            style={{ width: '40px' }}
          >
            <Icon icon={icon} width="18" className="text-muted-custom opacity-70" />
          </InputGroup.Text>
        )}
        
        <Form.Control
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
          className="bg-transparent border-0 text-main text-sm py-2.5 ps-2"
          style={{
            boxShadow: 'none',
            outline: 'none',
            color: 'var(--text-main)'
          }}
          {...props}
        />
      </InputGroup>
      </FormField>
    </Form.Group>
  );
}

