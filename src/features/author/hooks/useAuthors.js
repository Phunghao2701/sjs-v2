/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\author\hooks\useAuthors.js
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getAuthorsApi,
  getAuthorDetailApi,
  getAuthorAreasBreakdownApi,
  getAuthorArticlesApi,
  getAuthorLeaderboardApi,
  getSubjectAreasApi,
} from '../api/author.api';

const normalizeAuthorRecord = (author) => {
  if (!author || typeof author !== 'object') return author;
  const cleanStr = (val) => String(val ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  const rawName = cleanStr(author.display_name || author.full_name || author.name || author.author_name || '');
  const cleanedName = rawName || (author.openalex_id ? `Author ${author.openalex_id}` : (author.author_id ? `Author #${author.author_id}` : 'Tác giả'));
  const rawInst1 = cleanStr(author.institution_1 ?? author.last_known_institution ?? author.affiliation ?? author.institution ?? '');
  const rawInst2 = cleanStr(author.institution_2 ?? author.department ?? '');
  return {
    ...author,
    full_name: cleanedName,
    name: cleanedName,
    display_name: cleanedName,
    institution_1: rawInst1,
    institution_2: rawInst2,
    article_count: author.article_count ?? author.works_count ?? 0,
    works_count: author.works_count ?? author.article_count ?? 0,
    citation_count: author.citation_count ?? author.cited_by_count ?? 0,
    cited_by_count: author.cited_by_count ?? author.citation_count ?? 0,
    h_index: author.h_index ?? author.hindex ?? 0,
    homepage: author.homepage ?? author.homepage_url ?? '',
    bio: author.bio ?? author.description ?? '',
    orcid: author.orcid ?? '',
    subject_areas: Array.isArray(author.subject_areas)
      ? author.subject_areas
      : (author.subject_area ? [author.subject_area] : (author.primary_subject_area ? [author.primary_subject_area] : [])),
  };
};

const getAuthorMetric = (author, keys = []) => {
  for (const key of keys) {
    const value = Number(author?.[key]);
    if (!Number.isNaN(value)) return value;
  }
  return 0;
};

const sortAuthorsByImpact = (list = []) => {
  return [...list].sort((a, b) => {
    const hIndexDiff = getAuthorMetric(b, ['h_index', 'hindex']) - getAuthorMetric(a, ['h_index', 'hindex']);
    if (hIndexDiff !== 0) return hIndexDiff;
    const citationDiff = getAuthorMetric(b, ['citation_count', 'cited_by_count', 'citations']) - getAuthorMetric(a, ['citation_count', 'cited_by_count', 'citations']);
    if (citationDiff !== 0) return citationDiff;
    return getAuthorMetric(b, ['article_count', 'works_count', 'papers']) - getAuthorMetric(a, ['article_count', 'works_count', 'papers']);
  });
};

const normalizeAreasBreakdown = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.breakdown)) return data.breakdown;
  if (Array.isArray(data?.data)) return data.data;
  if (typeof data === 'object') {
    const ignoredKeys = new Set(['author_id', 'orcid', 'display_name', 'full_name', 'name', 'success', 'message']);
    const keys = Object.keys(data).filter((key) => !ignoredKeys.has(key));
    if (keys.length > 0) {
      const items = keys.map((key) => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          return { subject_area: value.category_name ?? value.subject_area_name ?? value.subject_area ?? value.display_name ?? value.name ?? key, percentage: value.percentage ?? value.percent ?? 0, count: value.count ?? value.article_count ?? 0, ...value };
        }
        return { subject_area: key, percentage: Number(value) || 0, count: 0 };
      });
      if (items.some((item) => item.subject_area || item.percentage || item.count)) return items;
    }
    return [{ subject_area: data.subject_area ?? data.name ?? 'Lĩnh vực khác', percentage: data.percentage ?? data.percent ?? 0, count: data.count ?? data.article_count ?? 0 }];
  }
  return [];
};

const getPrimarySubjectAreaFromBreakdown = (breakdown = []) => {
  if (!Array.isArray(breakdown) || breakdown.length === 0) return '';
  const first = [...breakdown].sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))[0];
  return first?.category_name ?? first?.subject_area ?? first?.subject_area_name ?? first?.name ?? first?.display_name ?? '';
};

const enrichLeaderboardAuthors = (authors = [], breakdownMap = {}) => {
  return authors.map((author) => {
    const id = author.author_id ?? author.id;
    const breakdown = breakdownMap[id] || [];
    const primarySubjectArea = author.subject_area ?? author.field ?? author.area ?? getPrimarySubjectAreaFromBreakdown(breakdown);
    return { ...author, breakdown, primary_subject_area: primarySubjectArea };
  });
};

const extractItemsFromCollectionPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const extractPaginationFromPayload = (responseData, payload = {}) => {
  return responseData?.pagination || payload?.pagination || {};
};

const normalizeSubjectAreaItems = (payload) => {
  const items = extractItemsFromCollectionPayload(payload);
  return items.map((item) => ({ ...item, subject_area_id: item?.subject_area_id ?? item?.id ?? '', display_name: item?.display_name ?? item?.name ?? '' }));
};

export default function useAuthors() {
  const [authorsParams, setAuthorsParams] = useState(null);
  const [leaderboardParams, setLeaderboardParams] = useState(null);
  const [subjectAreasParams, setSubjectAreasParams] = useState(null);
  const [authorDetailId, setAuthorDetailId] = useState(null);
  const [authorArticlesParams, setAuthorArticlesParams] = useState(null);
  const [authorBreakdownId, setAuthorBreakdownId] = useState(null);

  // 1. Authors List
  const { data: authorsData, isLoading: loadingAuthors, error: errorAuthors } = useQuery({
    queryKey: ['authors', 'list', authorsParams],
    queryFn: async () => {
      try {
        const apiParams = { ...authorsParams };
        if (authorsParams?.sort === 'citations') {
          apiParams.sort_by = 'cited_by_count';
          apiParams.order = 'desc';
        } else if (authorsParams?.sort === 'impact' || authorsParams?.sort === 'h_index') {
          apiParams.sort_by = 'cited_by_count';
          apiParams.order = 'desc';
        } else {
          apiParams.sort_by = 'works_count';
          apiParams.order = 'desc';
        }
        delete apiParams.sort;
        const response = await getAuthorsApi(apiParams);
        if (response.data && typeof response.data === 'object' && response.data.success !== false) {
          const payload = response.data.data;
          const items = extractItemsFromCollectionPayload(payload);
          const normalizedItems = items.map(normalizeAuthorRecord);
          const pagination = extractPaginationFromPayload(response.data, payload);
          const total = pagination.total ?? payload?.total ?? normalizedItems.length;
          const limit = pagination.limit ?? (parseInt(authorsParams.limit || '1', 10) || normalizedItems.length || 1);

          const sortedItems = (() => {
            if (authorsParams.sort === 'impact' || authorsParams.sort === 'h_index') return sortAuthorsByImpact(normalizedItems);
            if (authorsParams.sort === 'articles') return [...normalizedItems].sort((a, b) => getAuthorMetric(b, ['article_count', 'works_count', 'papers']) - getAuthorMetric(a, ['article_count', 'works_count', 'papers']));
            if (authorsParams.sort === 'citations') return [...normalizedItems].sort((a, b) => getAuthorMetric(b, ['citation_count', 'cited_by_count', 'citations']) - getAuthorMetric(a, ['citation_count', 'cited_by_count', 'citations']));
            return normalizedItems;
          })();
          return { authors: sortedItems, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
        } else {
          throw new Error(response.data?.message || 'Failed to fetch authors');
        }
      } catch (err) {
        console.error('Failed to fetch authors from API:', err);
        throw err;
      }
    },
    enabled: !!authorsParams,
  });

  const fetchAuthors = useCallback((params = {}) => setAuthorsParams(params), []);

  // 2. Author Detail
  const { data: currentAuthor, isLoading: loadingAuthorDetail, error: errorAuthorDetail } = useQuery({
    queryKey: ['authors', 'detail', authorDetailId],
    queryFn: async () => {
      try {
        const response = await getAuthorDetailApi(authorDetailId);
        if (response.data && typeof response.data === 'object' && response.data.success !== false) {
          return normalizeAuthorRecord(response.data.data || {});
        } else {
          throw new Error(response.data?.message || 'Failed to fetch author detail');
        }
      } catch (err) {
        console.error('Failed to fetch author detail from API:', err);
        throw err;
      }
    },
    enabled: !!authorDetailId,
  });

  const fetchAuthorDetail = useCallback((id) => setAuthorDetailId(id), []);

  // 3. Author Articles
  const { data: authorArticlesData, isLoading: loadingArticles, error: errorArticles } = useQuery({
    queryKey: ['authors', 'articles', authorArticlesParams?.id, authorArticlesParams?.params],
    queryFn: async () => {
      const { id, params } = authorArticlesParams;
      try {
        const response = await getAuthorArticlesApi(id, params);
        if (response.data && typeof response.data === 'object' && response.data.success !== false) {
          return extractItemsFromCollectionPayload(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch author articles');
        }
      } catch (err) {
        console.error('Failed to fetch author articles from API:', err);
        return [];
      }
    },
    enabled: !!authorArticlesParams,
  });

  const fetchAuthorArticles = useCallback((id, params = {}) => setAuthorArticlesParams({ id, params }), []);

  // 4. Author Areas Breakdown
  const { data: authorBreakdownData, isLoading: loadingAreas, error: errorAreas } = useQuery({
    queryKey: ['authors', 'areas-breakdown', authorBreakdownId],
    queryFn: async () => {
      try {
        const response = await getAuthorAreasBreakdownApi(authorBreakdownId);
        if (response.data && typeof response.data === 'object' && response.data.success !== false) {
          return normalizeAreasBreakdown(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch areas breakdown');
        }
      } catch (err) {
        console.error('Failed to fetch areas breakdown from API:', err);
        return [];
      }
    },
    enabled: !!authorBreakdownId,
  });

  const fetchAuthorAreasBreakdown = useCallback((id) => setAuthorBreakdownId(id), []);

  // Subject Areas
  const { data: subjectAreasData, isLoading: loadingSubjectAreas, error: errorSubjectAreas } = useQuery({
    queryKey: ['authors', 'subject-areas', subjectAreasParams],
    queryFn: async () => {
      const response = await getSubjectAreasApi(subjectAreasParams);
      if (response.data && typeof response.data === 'object' && response.data.success !== false) {
        return normalizeSubjectAreaItems(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch subject areas');
      }
    },
    enabled: !!subjectAreasParams,
  });

  const fetchSubjectAreas = useCallback((params = {}) => setSubjectAreasParams(params), []);

  // 5. Leaderboard
  const { data: leaderboardData, isLoading: loadingLeaderboard, error: errorLeaderboard } = useQuery({
    queryKey: ['authors', 'leaderboard', leaderboardParams],
    queryFn: async () => {
      try {
        const response = await getAuthorLeaderboardApi(leaderboardParams);
        if (response.data && typeof response.data === 'object' && response.data.success !== false) {
          const rawData = Array.isArray(response.data.data) ? response.data.data : [];
          const normalizedData = rawData.map(normalizeAuthorRecord);
          
          const breakdownMap = {};
          await Promise.allSettled(
            normalizedData
              .filter((author) => !author.openalex_id)
              .map(async (author) => {
                const id = author.author_id ?? author.id;
                if (!id) return;
                try {
                  const breakdownResponse = await getAuthorAreasBreakdownApi(id);
                  if (breakdownResponse.data && typeof breakdownResponse.data === 'object' && breakdownResponse.data.success !== false) {
                    breakdownMap[id] = normalizeAreasBreakdown(breakdownResponse.data.data);
                  }
                } catch {
                  // Ignore unavailable breakdowns for local authors.
                }
              })
          );
          
          const enrichedList = enrichLeaderboardAuthors(normalizedData, breakdownMap);
          const pagination = response.data.pagination || {};
          const total = pagination.total ?? enrichedList.length;
          const limit = pagination.limit || 10;
          return { leaderboard: enrichedList, total, totalPages: pagination.total_pages ?? Math.max(1, Math.ceil(total / limit)) };
        } else {
          throw new Error(response.data?.message || 'Failed to fetch leaderboard');
        }
      } catch (err) {
        console.error('Failed to fetch author leaderboard from API:', err);
        throw err;
      }
    },
    enabled: !!leaderboardParams,
  });

  const fetchLeaderboard = useCallback((params = {}) => setLeaderboardParams(params), []);

  const fetchAuthorDetailsFull = useCallback(async (authorId) => {
    if (!authorId) return;
    setAuthorDetailId(authorId);
    setAuthorArticlesParams({ id: authorId, params: {} });
    setAuthorBreakdownId(authorId);
  }, []);

  return {
    authors: authorsData?.authors || [],
    totalAuthors: authorsData?.total || 0,
    currentAuthor: currentAuthor || null,
    authorArticles: authorArticlesData || [],
    authorBreakdown: authorBreakdownData || [],
    subjectAreas: subjectAreasData || [],
    leaderboard: leaderboardData?.leaderboard || [],
    totalLeaderboard: leaderboardData?.total || 0,
    leaderboardTotalPages: leaderboardData?.totalPages || 1,

    loadingAuthors,
    loadingAuthorDetail,
    loadingArticles,
    loadingAreas,
    loadingSubjectAreas,
    loadingLeaderboard,

    errorAuthors,
    errorAuthorDetail,
    errorArticles,
    errorAreas,
    errorSubjectAreas,
    errorLeaderboard,

    fetchAuthors,
    fetchAuthorDetail,
    fetchAuthorArticles,
    fetchAuthorAreasBreakdown,
    fetchSubjectAreas,
    fetchLeaderboard,
    totalPages: authorsData?.totalPages || 1,
    fetchAuthorDetailsFull,
  };
}
