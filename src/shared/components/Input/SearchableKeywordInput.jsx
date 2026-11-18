import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import keywordApi from '../../../features/keywords/api/keywordApi';

export default function SearchableKeywordInput({
  keywords = [],
  onAddKeyword,
  onRemoveKeyword,
  placeholder,
  disabled = false,
  debounceTime = 300,
  subjectAreaId = null
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.chonTuKhoa", "Select or type a keyword...");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

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
    if (!isOpen) return;
    const fetchSuggestions = async () => {
      const val = searchTerm.trim();
      setIsSearching(true);
      try {
        const queryParams = { search: val, limit: 20 };
        if (subjectAreaId) {
          queryParams.subject_area_id = subjectAreaId;
        }
        const res = await keywordApi.getKeywords(queryParams);
        const items = res?.data?.data?.items || res?.data?.data || [];
        setSuggestions(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error(t("common.loiLayDanhSachKeyword", "Error fetching keywords:"), err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, debounceTime);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, debounceTime, subjectAreaId, t]);

  const handleSelect = kwName => {
    if (kwName && onAddKeyword) {
      onAddKeyword(kwName);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = searchTerm.trim();
      if (val) {
        handleSelect(val);
      }
    }
  };

  const filteredSuggestions = suggestions.filter(s => !keywords.includes(s.display_name || s.name));
  const showCreateOption =
    searchTerm.trim().length > 0 &&
    !suggestions.find(s => (s.display_name || s.name).toLowerCase() === searchTerm.trim().toLowerCase()) &&
    !keywords.includes(searchTerm.trim());

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Main interactive field */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !e.target.closest('button')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full min-h-[44px] px-3 py-1.5 rounded-control border border-border bg-surface text-sm flex flex-wrap items-center gap-1.5 transition-all select-none focus:outline-none focus-visible:outline-none focus:border-primary focus-visible:border-primary ${
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-muted' : 'cursor-pointer hover:border-primary/50'
        } ${isOpen ? 'border-primary' : ''}`}
        onClick={(e) => {
          if (!disabled && !e.target.closest('button')) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {/* Render keyword chips */}
        {keywords.map(kw => (
          <span
            key={kw}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-subtle text-primary border border-primary/20 shadow-2xs"
          >
            <span>{kw}</span>
            <button
              type="button"
              className="p-0 border-0 bg-transparent text-primary/70 hover:text-danger cursor-pointer flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveKeyword?.(kw);
              }}
              aria-label={`Remove keyword ${kw}`}
            >
              <Icon icon="lucide:x" width={13} />
            </button>
          </span>
        ))}

        {/* Placeholder text */}
        {keywords.length === 0 && (
          <span className="text-muted-foreground text-sm flex-1">
            {resolvedPlaceholder}
          </span>
        )}

        {/* Right side indicators */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {isSearching && <Icon icon="lucide:loader-2" width={16} className="animate-spin text-primary" />}
          <Icon icon="lucide:chevron-down" width={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-surface border border-border rounded-control shadow-popover mt-1.5 z-30 flex flex-col overflow-hidden max-h-72">
          {/* Search input inside dropdown */}
          <div className="p-2 border-b border-border bg-surface-muted/30">
            <div className="relative">
              <Icon icon="lucide:search" width={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                className="w-full h-8 pl-8 pr-2.5 rounded-sm border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder={t("common.timKiemTuKhoa", "Type to search or add keyword...")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Results list */}
          <div className="overflow-y-auto py-1 max-h-60">
            {isSearching ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {t("common.dangTimKiem", "Searching keywords...")}
              </div>
            ) : filteredSuggestions.length === 0 && !showCreateOption ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {searchTerm.trim() ? t("common.khongTimThayTuKhoaPhuHop", "No matching keywords") : t("common.nhapTuKhoaDeTimKiem", "Type keyword name and press Enter")}
              </div>
            ) : (
              <>
                {showCreateOption && (
                  <div
                    className="px-3 py-2 text-xs flex items-center gap-2 cursor-pointer text-primary hover:bg-primary-subtle/40 font-semibold border-b border-border/50"
                    onClick={() => handleSelect(searchTerm.trim())}
                  >
                    <Icon icon="lucide:plus-circle" width={14} className="shrink-0" />
                    <span>Add &quot;<strong>{searchTerm.trim()}</strong>&quot; as custom keyword</span>
                  </div>
                )}
                {filteredSuggestions.map(kwObj => {
                  const name = kwObj.display_name || kwObj.name;
                  return (
                    <div
                      key={kwObj.id || kwObj.keyword_id || name}
                      className="px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer text-foreground hover:bg-surface-muted transition-colors"
                      onClick={() => handleSelect(name)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon icon="lucide:hash" width={13} className="text-muted-foreground shrink-0" />
                        <span className="truncate">{name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {kwObj.article_count ? `${kwObj.article_count} papers` : ''}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
