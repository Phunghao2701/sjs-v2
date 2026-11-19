const KEYWORD_LIST_FIELDS = [
  'watch_keywords',
  'watched_keywords',
  'project_keywords',
  'keyword_ids',
  'keywords',
];

const getListLength = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item != null && String(item).trim()).length;
  if (typeof value === 'string') return value.split(',').filter((item) => item.trim()).length;
  return 0;
};

export const getProjectKeywordCount = (project = {}) => {
  const reportedCount = Math.max(
    Number(project.keywords_count) || 0,
    Number(project.keyword_count) || 0
  );
  const storedCount = KEYWORD_LIST_FIELDS.reduce(
    (maxCount, field) => Math.max(maxCount, getListLength(project[field])),
    0
  );

  return Math.max(reportedCount, storedCount);
};
