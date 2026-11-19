import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';

const mapProductivityData = (data = []) => {
  if (!Array.isArray(data) || !data.length) return [];
  const rawMaxX = Math.max(...data.map(item => item.yearlyOutput || 0));
  const rawMaxY = Math.max(...data.map(item => item.hIndex || 0));
  const maxX = Math.max(5, rawMaxX * 1.1);
  const maxY = Math.max(5, rawMaxY * 1.1);
  return data.map((item, index) => ({
    id: item.authorId || index,
    authorId: item.authorId || `#${index + 1}`,
    authorName: item.authorName || null,
    hIndex: item.hIndex ?? 0,
    yearlyOutput: item.yearlyOutput ?? 0,
    x: maxX > 0 ? (item.yearlyOutput / maxX) * 100 : 0,
    y: maxY > 0 ? (item.hIndex / maxY) * 100 : 0,
    r: 5,
    type: 'author',
  }));
};

const mapNetworkData = (data = {}) => ({
  nodes: (data.nodes || []).map(node => ({
    ...node,
    id: node.id,
    type: node.type === 'AUTHOR' ? 'author' : 'institution',
    val: node.size,
  })),
  links: (data.edges || []).map(edge => ({
    ...edge,
    source: edge.source || edge.from,
    target: edge.target || edge.to,
  })),
});

const mapTopicIntensityData = (rawData = []) => {
  if (!Array.isArray(rawData) || rawData.length === 0) return null;
  const rows = [...new Set(rawData.map(item => item.rowName).filter(Boolean))];
  const columns = [...new Set(rawData.map(item => item.topic).filter(Boolean))];
  const data = rows.map(row => columns.map(column => (
    rawData.find(item => item.rowName === row && item.topic === column)?.intensity || 0
  )));
  return { columns, rows, data };
};

export const useCollaborationDashboardQuery = (projectId, intensityType = 'author') => useQuery({
  queryKey: ['collaboration', 'dashboard', projectId],
  queryFn: () => apiClient.get('/analytics/network/collaboration-dashboard', {
    params: { project_id: projectId },
  }),
  enabled: !!projectId,
  staleTime: 5 * 60 * 1000,
  select: (response) => {
    const payload = response?.data || {};
    const rankings = payload.rankings || {};
    return {
      rankings: {
        authors: Array.isArray(rankings.authors) ? rankings.authors : [],
        institutions: Array.isArray(rankings.institutions) ? rankings.institutions : [],
      },
      impactMatrix: mapProductivityData(payload.impactMatrix),
      keyInsights: payload.keyInsights || null,
      globalNetwork: mapNetworkData(payload.globalNetwork),
      topicIntensity: mapTopicIntensityData(payload.topicIntensity?.[intensityType]),
    };
  },
});

/**
 * @typedef {Object} TopEntity
 * @property {string} name
 * @property {number} score
 */

/**
 * Fetch Influential Rankings (Authors and Institutions)
 * @param {string} projectId 
 */
export const useInfluentialRankingsQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'rankings', projectId],
    queryFn: () => apiClient.get('/analytics/rankings', {
      params: { project_id: projectId, limit: 10 }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const payload = response?.data?.authors || response?.data?.institutions 
        ? response.data 
        : (response?.authors || response?.institutions ? response : (response?.data || {}));
      return {
        authors: Array.isArray(payload?.authors) ? payload.authors : [],
        institutions: Array.isArray(payload?.institutions) ? payload.institutions : []
      };
    },
  });
};

/**
 * Fetch Author Productivity vs Impact Matrix (Scatter Plot)
 * @param {string} projectId 
 */
export const useAuthorProductivityMatrixQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'productivity-matrix', projectId],
    queryFn: () => apiClient.get('/analytics/matrix/productivity', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const data = response?.data || [];
      if (!data.length) return [];
      
      // Tìm giá trị max thực tế
      const rawMaxX = Math.max(...data.map(d => d.yearlyOutput));
      const rawMaxY = Math.max(...data.map(d => d.hIndex));
      
      // Thêm padding 10% và thiết lập giá trị min để tránh gom cụm toàn bộ vào cạnh phải (100%)
      const maxX = Math.max(5, rawMaxX * 1.1);
      const maxY = Math.max(5, rawMaxY * 1.1);
      
      return data.map((d, index) => ({
        id: d.authorId || index,
        authorId: d.authorId || `#${index + 1}`,
        authorName: d.authorName || null,
        hIndex: d.hIndex ?? 0,
        yearlyOutput: d.yearlyOutput ?? 0,
        x: maxX > 0 ? (d.yearlyOutput / maxX) * 100 : 0,
        y: maxY > 0 ? (d.hIndex / maxY) * 100 : 0,
        r: 5,
        type: 'author'
      }));
    }
  });
};

/**
 * Fetch Collaboration Insights (Key Insights)
 * @param {string} projectId 
 */
export const useCollaborationInsightsQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'metrics', projectId],
    queryFn: () => apiClient.get('/analytics/network/collab-metrics', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => response?.data || null,
  });
};

/**
 * Fetch Global Collaboration Network (Network Graph)
 * @param {string} projectId 
 */
export const useGlobalCollaborationNetworkQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'global-network', projectId],
    queryFn: () => apiClient.get('/analytics/network/collaboration', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const data = response?.data || { nodes: [], edges: [] };
      
      // Assign circular layout coordinates if not present
      const nodes = data.nodes || [];
      const edges = data.edges || [];
      
      const mappedNodes = nodes.map((node) => {
        return {
          ...node,
          id: node.id,
          type: node.type === 'AUTHOR' ? 'author' : 'institution',
          val: node.size // Đổi tên thuộc tính size -> val để ForceGraph2D tự tính kích thước
        };
      });
      
      const mappedLinks = edges.map(edge => ({
        ...edge,
        source: edge.source || edge.from,
        target: edge.target || edge.to
      }));

      return { nodes: mappedNodes, links: mappedLinks };
    }
  });
};

/**
 * Fetch Topic Intensity Matrix (Heatmap)
 * @param {string} projectId 
 * @param {string} type - 'author' | 'institution'
 */
export const useTopicIntensityMatrixQuery = (projectId, type) => {
  return useQuery({
    queryKey: ['collaboration', 'topic-intensity', projectId, type],
    queryFn: () => apiClient.get('/analytics/matrix/intensity', {
      params: { project_id: projectId, row_type: type }
    }),
    enabled: !!projectId && !!type,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const rawData = response?.data || [];
      if (!Array.isArray(rawData) || rawData.length === 0) return null;
      
      const rowsSet = new Set();
      const colsSet = new Set();
      
      rawData.forEach(item => {
        if (item.rowName) rowsSet.add(item.rowName);
        if (item.topic) colsSet.add(item.topic);
      });
      
      const rows = Array.from(rowsSet);
      const columns = Array.from(colsSet);
      
      const dataMatrix = rows.map(r => {
        return columns.map(c => {
          const cell = rawData.find(item => item.rowName === r && item.topic === c);
          return cell ? cell.intensity : 0;
        });
      });
      
      return { columns, rows, data: dataMatrix };
    }
  });
};
