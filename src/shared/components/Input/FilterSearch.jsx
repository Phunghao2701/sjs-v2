import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '../../../lib/utils';

/**
 * Shared component cho ô tìm kiếm trong các Filter Card.
 * Hỗ trợ 2 chế độ:
 * 1. Debounced: dùng `initialValue` + `onSearchChange` (Tự động trigger sau 400ms)
 * 2. Controlled: dùng `value` + `onChange` (Chế độ form thường)
 */
export default function FilterSearch({
  value,
  onChange,
  initialValue,
  onSearchChange,
  placeholder,
  className = '',
  actionButton = null,
  style = {}
}) {
  const {
    t
  } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.timKiem");
  const isControlled = value !== undefined;
  const [internalVal, setInternalVal] = useState(initialValue || '');

  // Cập nhật giá trị nội bộ nếu initialValue bên ngoài thay đổi
  useEffect(() => {
    if (!isControlled && initialValue !== undefined) {
      setInternalVal(initialValue);
    }
  }, [initialValue, isControlled]);
  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  // Xử lý debounce
  useEffect(() => {
    if (isControlled) return;
    const timer = setTimeout(() => {
      onSearchChangeRef.current && onSearchChangeRef.current(internalVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [internalVal, isControlled]);
  const handleChange = e => {
    if (isControlled) {
      onChange && onChange(e);
    } else {
      setInternalVal(e.target.value);
    }
  };
  const handleClear = () => {
    if (isControlled) {
      onChange && onChange({
        target: {
          value: ''
        }
      });
    } else {
      setInternalVal('');
    }
  };
  const displayValue = isControlled ? value : internalVal;
  return (
    <div
      className={cn(
        "flex items-stretch rounded-full border border-border bg-surface overflow-hidden min-h-[44px] w-full transition-colors focus-within:border-border",
        className
      )}
      style={style}
    >
      <div className="bg-transparent border-0 text-text-muted flex items-center justify-center px-3.5">
        <Icon icon="lucide:search" width="18" height="18" />
      </div>
      
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        className="bg-transparent border-0 text-text-main font-display text-sm py-2 px-1 w-full flex-1 min-w-0 focus:outline-none placeholder:text-text-muted"
      />
      
      {displayValue && (
        <button
          type="button"
          className="bg-transparent border-0 text-text-muted hover:text-text-main flex items-center justify-center px-3.5 cursor-pointer transition-colors"
          onClick={handleClear}
          title={t("common.xoaTimKiem")}
        >
          <Icon icon="lucide:x" width="16" height="16" />
        </button>
      )}

      {actionButton && (
        <div className="flex items-stretch [&_button]:rounded-none [&_button]:border-y-0 [&_button]:border-r-0 [&_button]:m-0 [&_button]:min-h-full">
          {actionButton}
        </div>
      )}
    </div>
  );
}