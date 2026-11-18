import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\keywords\components\KeywordSearchBar.jsx
 */
import { useState, useEffect } from 'react';
import { Button } from '../../../shared/ui/button';
import { Icon } from '@iconify/react';

/**
 * Thanh tìm kiếm keyword với nút submit và reset.
 *
 * @param {Object} props
 * @param {string} props.value - Giá trị keyword hiện tại.
 * @param {Function} props.onSearch - Callback khi submit search.
 * @param {Function} props.onClear - Callback khi reset search.
 */
export default function KeywordSearchBar({
  value = '',
  onSearch,
  onClear
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState(value);

  // Sync local input when parent resets via onClear or external value change
  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSubmit = e => {
    e.preventDefault();
    if (onSearch) onSearch(input.trim());
  };

  const handleClear = () => {
    setInput('');
    if (onClear) onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 keyword-search-group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Icon icon="lucide:search" width="18" />
        </span>
        <input
          type="text"
          placeholder={t("keywords.timKeyword")}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="keyword-search-input w-full h-11 pl-10 pr-9 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 transition-colors"
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 border-0 bg-transparent cursor-pointer"
            aria-label="Clear search"
          >
            <Icon icon="lucide:x" width="16" />
          </button>
        )}
      </div>
      <Button type="submit" className="keyword-search-submit h-11 px-5 shrink-0">
        {t("search")}
      </Button>
    </form>
  );
}
