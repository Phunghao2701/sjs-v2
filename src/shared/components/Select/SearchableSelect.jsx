import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  limit = 20,
  fetchOptions = null,
  debounceTime = 300
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.chon", "Select...");
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;
    const calculatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    };
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    if (!fetchOptions) return;
    const fetchItems = async () => {
      const val = searchTerm.trim();
      setIsSearching(true);
      try {
        const results = await fetchOptions(val);
        setAsyncOptions(results || []);
      } catch (err) {
        console.error(t("common.loiFetchOptions", "Error fetching options:"), err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchItems, debounceTime);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchOptions, debounceTime, t]);

  const displayOptions = fetchOptions ? asyncOptions : options;
  const allFiltered = fetchOptions ? displayOptions : displayOptions.filter(opt => (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOptions = fetchOptions ? allFiltered : allFiltered.slice(0, limit);
  const selectedOption = options.find(opt => String(opt.value) === String(value)) || asyncOptions.find(opt => String(opt.value) === String(value));

  const selectOption = optionValue => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = e => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full h-11 px-3.5 rounded-control border border-border bg-surface text-sm flex items-center justify-between gap-2 transition-all select-none focus:outline-none focus-visible:outline-none focus:border-primary focus-visible:border-primary ${
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-muted' : 'cursor-pointer'
        } ${isOpen ? 'border-primary' : ''}`}
        onClick={() => {
          if (!disabled) {
            const willOpen = !isOpen;
            if (willOpen && wrapperRef.current) {
              const rect = wrapperRef.current.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;
              setOpenUpward(spaceBelow < 300 && spaceAbove > spaceBelow);
            }
            setIsOpen(willOpen);
          }
        }}
      >
        <span className={`truncate flex-1 ${selectedOption ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          {(loading || isSearching) && <Icon icon="lucide:loader-2" width={16} className="animate-spin text-primary" />}
          {selectedOption && !disabled && (
            <button
              type="button"
              className="p-0.5 border-0 bg-transparent text-muted-foreground hover:text-foreground cursor-pointer rounded flex items-center justify-center"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <Icon icon="lucide:x" width={14} />
            </button>
          )}
          <Icon icon="lucide:chevron-down" width={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute left-0 w-full bg-surface border border-border rounded-control shadow-popover z-50 flex flex-col overflow-hidden max-h-64 ${
          openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        }`}>
          <div className="p-2 border-b border-border bg-surface-muted/30">
            <div className="relative">
              <Icon icon="lucide:search" width={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                className="w-full h-8 pl-8 pr-2.5 rounded-sm border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder={t("common.timKiem", "Search...")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto py-1 max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {isSearching ? t("common.dangTimKiem", "Searching...") : t("common.khongTimThayKetQuaPhuHop1", "No matching options found")}
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    String(opt.value) === String(value)
                      ? 'bg-primary-subtle text-primary font-semibold'
                      : 'text-foreground hover:bg-surface-muted'
                  }`}
                  onClick={() => selectOption(opt.value)}
                >
                  <span className="truncate" title={opt.label || ''}>{opt.label || ''}</span>
                  {String(opt.value) === String(value) && <Icon icon="lucide:check" width={14} className="shrink-0 text-primary" />}
                </div>
              ))
            )}
            {!fetchOptions && allFiltered.length > limit && (
              <div className="px-3 py-1.5 text-[11px] text-muted-foreground italic text-center bg-surface-muted/50 border-t border-border">
                {t("common.dangHienThi", "Showing")} {limit} {t("common.ketQuaHayNhapThemDeLoc", "results. Type to filter...")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
