import { useState } from 'react';
import { Badge } from '../../../../shared/ui/badge';
import Icon from '../../../../shared/components/Icon';

/**
 * KeywordInput Component
 * Allows users to add and manage keywords as a tag-list/chip-list.
 */
export default function KeywordInput({
  keywords = [],
  onChange,
  placeholder = "Separate by commas or press Enter..."
}) {
  const [inputValue, setInputValue] = useState('');

  const addKeyword = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (!keywords.includes(trimmed)) {
      const updated = [...keywords, trimmed];
      onChange(updated);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      addKeyword(val.slice(0, -1));
    } else {
      setInputValue(val);
    }
  };

  const removeKeyword = (idxToRemove) => {
    const updated = keywords.filter((_, idx) => idx !== idxToRemove);
    onChange(updated);
  };

  return (
    <div 
      className="flex flex-wrap gap-2 items-center p-2 rounded-lg bg-muted/40 border border-border min-h-[46px]"
    >
      {/* Render tags */}
      {keywords.map((kw, index) => (
        <Badge 
          key={index} 
          variant="secondary"
          className="rounded-full flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal bg-surface border border-border text-foreground"
        >
          <span>{kw}</span>
          <Icon 
            icon="lucide:x" 
            width="13" 
            className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => removeKeyword(index)} 
          />
        </Badge>
      ))}

      {/* Text Input */}
      <input 
        type="text" 
        placeholder={keywords.length === 0 ? placeholder : ''}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => addKeyword(inputValue)}
        className="border-0 bg-transparent flex-1 text-sm text-foreground focus:outline-none focus:ring-0 min-w-[120px] p-1"
      />
    </div>
  );
}
