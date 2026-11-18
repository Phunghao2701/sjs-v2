import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

// Generates a consistent, pleasant pastel avatar color based on name
const getAvatarTheme = (name = '') => {
  const themes = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-amber-100', text: 'text-amber-800' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return themes[Math.abs(hash) % themes.length];
};

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatNum = (val) => {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '0';
  return Number(val).toLocaleString();
};

const cleanStr = (val) => String(val ?? '').replace(/[\t\r\n]+/g, ' ').trim();

export default function AuthorTableRow({
  author,
  index
}) {
  const navigate = useNavigate();

  if (!author) return null;

  const id = String(author.author_id ?? author.id ?? author.openalex_id ?? '');
  const rawName = cleanStr(author.display_name || author.full_name || author.name || author.author_name || '');
  const name = rawName || (author.openalex_id ? `Author ${author.openalex_id}` : (id ? `Author #${id}` : 'Unknown Author'));

  const rawInst1 = cleanStr(author.institution_1 ?? author.last_known_institution ?? author.affiliation ?? author.institution ?? '');
  const rawInst2 = cleanStr(author.institution_2 ?? author.department ?? '');
  const institutionText = rawInst2 ? `${rawInst1} - ${rawInst2}` : rawInst1;
  const hasInstitution = Boolean(institutionText && institutionText !== '-' && institutionText !== '—');

  const hIndex = author.h_index ?? author.hindex ?? 0;
  const citations = author.citation_count ?? author.cited_by_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.works_count ?? author.papers ?? 0;
  const avatarTheme = getAvatarTheme(name);

  const handleRowClick = () => {
    if (id) navigate(`/authors/${id}`);
  };

  return (
    <motion.tr
      onClick={handleRowClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="group border-b border-border transition-colors hover:bg-surface-muted/60 cursor-pointer"
    >
      {/* 1. # Rank (Clean plain number, no circle) */}
      <td className="py-3 px-4 w-12 text-center text-xs font-semibold text-muted-foreground tabular-nums">
        {index}
      </td>

      {/* 2. Author (Initials Avatar + Bold Name) */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-xs border border-border/40 ${avatarTheme.bg} ${avatarTheme.text}`}>
            {getInitials(name)}
          </div>
          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            {name}
          </span>
        </div>
      </td>

      {/* 3. Affiliation */}
      <td className="py-3 px-4">
        {hasInstitution ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[280px]">
            <Icon icon="lucide:landmark" className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate" title={institutionText}>
              {institutionText}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )}
      </td>

      {/* 4. Publications */}
      <td className="py-3 px-4 text-xs font-bold text-foreground tabular-nums">
        {formatNum(articlesCount)}
      </td>

      {/* 5. Citations */}
      <td className="py-3 px-4 text-xs font-medium text-foreground/80 tabular-nums">
        {formatNum(citations)}
      </td>

      {/* 6. H-index */}
      <td className="py-3 px-4 text-xs font-medium text-foreground/80 tabular-nums">
        {hIndex}
      </td>
    </motion.tr>
  );
}
