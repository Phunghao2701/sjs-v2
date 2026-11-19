import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide, forceX, forceY } from 'd3-force';

import { useTranslation } from 'react-i18next';
import {
  ARTICLE_GRAPH_THEME,
  buildGraphData,
  clamp,
  compactText,
  getId,
} from '../utils/articleGraph.utils';

export default function ArticleGraphWidget({
  data,
  centerNodeId,
  loading = false,
  error = '',
  onNodeClick,
}) {
  const { t } = useTranslation();
  const fgRef = useRef(null);
  const graphBoxRef = useRef(null);

  const [dims, setDims] = useState({ width: 0, height: 0 });

  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const graph = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return buildGraphData(data);
  }, [data]);

  useEffect(() => {
    const el = graphBoxRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      if (width > 0 && height > 0) setDims({ width, height });
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!graph.nodes.length || !fgRef.current) return;

    // Keep the queried article in the hub and arrange related papers as satellites,
    // matching the compact hub-and-spoke maps used elsewhere in the app.
    const centerNode = graph.nodes.find((node) => String(node.id) === String(centerNodeId))
      || graph.nodes.reduce((best, node) => (node.degree > (best?.degree ?? -1) ? node : best), null);
    const satellites = graph.nodes
      .filter((node) => node !== centerNode)
      .sort((a, b) => String(a.label).localeCompare(String(b.label)));
    const radius = Math.min(155, Math.max(92, Math.min(dims.width, dims.height) * 0.3));

    if (centerNode) {
      centerNode.x = 0;
      centerNode.y = 0;
      centerNode.fx = 0;
      centerNode.fy = 0;

      satellites.forEach((node, index) => {
        const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / Math.max(satellites.length, 1));
        node.x = Math.cos(angle) * radius;
        node.y = Math.sin(angle) * radius;
        node.fx = node.x;
        node.fy = node.y;
      });
    }

    // Lực đẩy vừa phải để các cụm không văng quá xa
    fgRef.current.d3Force('charge')?.strength(-130);

    // Khoảng cách giữa các node có liên kết
    fgRef.current.d3Force('link')?.distance((link) => {
      const sourceDegree = link?.source?.degree || 1;
      const targetDegree = link?.target?.degree || 1;
      const avg = (sourceDegree + targetDegree) / 2;

      return clamp(110 - avg * 2, 70, 135);
    });

    // Kéo các cụm không liên kết về gần trung tâm
    fgRef.current.d3Force('x', forceX(0).strength(0.05));
    fgRef.current.d3Force('y', forceY(0).strength(0.05));

    // Tách node lớn ra, tránh đè nhau
    fgRef.current.d3Force(
      'collide',
      forceCollide((node) => {
        return clamp((node.val || 10) * 1.25, 18, 52);
      }).iterations(3)
    );

    fgRef.current.d3ReheatSimulation?.();
  }, [graph.nodes, graph.links.length, centerNodeId, dims.width, dims.height]);

  const updateHighlight = useCallback(
    (node) => {
      if (!node) {
        setHoverNode(null);
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        return;
      }

      const nodeId = String(node.id);
      const nextNodes = new Set([nodeId]);
      const nextLinks = new Set();

      for (const link of graph.links) {
        const sourceId = getId(link.source);
        const targetId = getId(link.target);

        if (sourceId === nodeId || targetId === nodeId) {
          nextLinks.add(link);
          nextNodes.add(sourceId);
          nextNodes.add(targetId);
        }
      }

      setHoverNode(node);
      setHighlightNodes(nextNodes);
      setHighlightLinks(nextLinks);
    },
    [graph.links]
  );

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);

    if (node?.x != null && node?.y != null) {
      fgRef.current?.centerAt?.(node.x, node.y, 500);
      fgRef.current?.zoom?.(2.15, 500);
    }

    if (onNodeClick) {
      onNodeClick(node);
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'article-graph-widget',
          type: 'NODE_CLICK',
          payload: {
            id: node.properties.id,
            label: node.label,
            title: node.properties?.title,
            doi: node.properties?.doi,
            year: node.properties?.publication_year || node.properties?.year,
          },
        },
        import.meta.env.VITE_PARENT_ORIGIN || '*'
      );
    }
  }, [onNodeClick]);

  const drawNode = useCallback(
    (node, ctx, globalScale) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoverNode?.id === node.id;
      const isCenter = String(node.id) === String(centerNodeId);
      const hasHighlight = highlightNodes.size > 0;
      const isActive = !hasHighlight || highlightNodes.has(String(node.id));

      const radius = isCenter ? 20 : 7;
      const color = isCenter ? '#0071BC' : '#0EA5E9';
      const label = compactText(node.label, isCenter ? 16 : 25);
      const displayRadius = radius + (isHovered || isSelected ? 2 : 0);

      ctx.save();
      ctx.globalAlpha = isActive ? 1 : 0.18;

      if (isCenter || isSelected) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 113, 188, 0.13)';
        ctx.arc(node.x, node.y, displayRadius + (isCenter ? 12 : 7), 0, Math.PI * 2);
        ctx.fill();
      }

      if (isSelected) {
        ctx.beginPath();
        ctx.strokeStyle = ARTICLE_GRAPH_THEME.selectedRing;
        ctx.lineWidth = 2 / globalScale;
        ctx.arc(node.x, node.y, displayRadius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(node.x, node.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.2 / globalScale;
      ctx.arc(node.x, node.y, displayRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (isCenter) {
        const words = String(node.label || '').split(/\s+/);
        const midpoint = Math.ceil(words.length / 2);
        const lines = [words.slice(0, midpoint).join(' '), words.slice(midpoint).join('')];
        ctx.font = `700 ${clamp(9 / globalScale, 8, 10)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(compactText(lines[0], 12), node.x, node.y - 3 / globalScale);
        if (lines[1]) ctx.fillText(compactText(lines[1], 12), node.x, node.y + 6 / globalScale);
      } else {
        const fontSize = clamp(10 / globalScale, 9, 11);
        ctx.font = `${isSelected ? 700 : 600} ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 3 / globalScale;
        ctx.strokeText(label, node.x, node.y - (displayRadius + 8) / globalScale);
        ctx.fillStyle = isSelected ? '#005A96' : '#344054';
        ctx.fillText(label, node.x, node.y - (displayRadius + 8) / globalScale);
      }

      ctx.restore();
    },
    [selectedNode, hoverNode, highlightNodes, centerNodeId]
  );

  const drawPointerArea = useCallback((node, color, ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const isCenter = String(node.id) === String(centerNodeId);
    ctx.arc(node.x, node.y, isCenter ? 26 : 13, 0, Math.PI * 2);
    ctx.fill();
  }, [centerNodeId]);

  const getLinkColor = useCallback(
    (link) => {
      const hasHighlight = highlightLinks.size > 0;
      const isActive = highlightLinks.has(link);

      if (!hasHighlight) return ARTICLE_GRAPH_THEME.linkColor;

      return isActive
        ? ARTICLE_GRAPH_THEME.linkActiveColor
        : 'rgba(120, 65, 20, 0.035)';
    },
    [highlightLinks]
  );

  const resetView = () => {
    fgRef.current?.zoomToFit?.(700, 72);
  };

  const centerView = () => {
    fgRef.current?.centerAt?.(0, 0, 500);
    fgRef.current?.zoom?.(1, 500);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        background: ARTICLE_GRAPH_THEME.bg,
        overflow: 'hidden',
      }}
    >
      <div
        ref={graphBoxRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          background: ARTICLE_GRAPH_THEME.bg,
        }}
      >
        {dims.width > 0 && dims.height > 0 ? <ForceGraph2D
          ref={fgRef}
          graphData={graph}
          width={dims.width}
          height={dims.height}
          backgroundColor={ARTICLE_GRAPH_THEME.bg}
          cooldownTicks={180}
          d3AlphaDecay={0.022}
          d3VelocityDecay={0.27}
          nodeRelSize={1}
          enableNodeDrag={false}
          nodeCanvasObject={drawNode}
          nodePointerAreaPaint={drawPointerArea}
          nodeLabel={(node) => {
            const title = node.properties?.title;
            const doi = node.properties?.doi;
            const year = node.properties?.publication_year || node.properties?.year;

            let html = `
              <div style="
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                color: #431407;
                border: 1px solid rgba(234, 88, 12, 0.3);
                border-radius: 8px;
                padding: 10px 14px;
                box-shadow: 0 8px 24px rgba(234, 88, 12, 0.15);
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 13px;
                line-height: 1.5;
                max-width: 280px;
              ">
            `;
            if (title) {
              html += `<div style="font-weight: 600; font-size: 14px; color: #9a3412; margin-bottom: 4px;">${title}</div>`;
            }
            if (doi) {
              html += `<div style="margin-bottom: 2px;"><strong style="color: #c2410c;">DOI:</strong> ${doi}</div>`;
            }
            if (year) {
              html += `<div><strong style="color: #c2410c;">Year:</strong> ${year}</div>`;
            }
            if (!title && !doi && !year) {
              html += `<div style="font-weight: 500;">${node.label}</div>`;
            }
            html += `</div>`;
            return html;
          }}
          linkColor={getLinkColor}
          linkWidth={(link) => (highlightLinks.has(link) ? 1.4 : 0.65)}
          linkLineDash={() => [4, 3]}
          linkDirectionalParticles={0}
          linkDirectionalArrowLength={0}
          onNodeHover={updateHighlight}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
        /> : null}

        {loading ? (
          <OverlayCard>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '3px solid rgba(234, 88, 12, 0.2)',
                  borderTopColor: '#005A96',
                  animation: 'article-graph-spin 0.9s linear infinite',
                }}
              />
            </div>
            <div style={{ fontWeight: 700, color: '#9a3412' }}>
              {t('articleGraph.loadingTitle', 'Loading graph data, please wait...')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#c2410c' }}>
              {t('articleGraph.loadingSub', 'Synthesizing related article network')}
            </div>
            <style>{`
              @keyframes article-graph-spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </OverlayCard>
        ) : null}

        {!loading && error ? (
          <OverlayCard>
            <div style={{ fontWeight: 700, color: '#b42318' }}>
              {t('articleGraph.errorTitle', 'Cannot load graph')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#b42318' }}>
              {error}
            </div>
          </OverlayCard>
        ) : null}

        {!loading && !error && graph.nodes.length === 0 ? (
          <OverlayCard>
            <div style={{ fontWeight: 700, color: '#9a3412' }}>
              {t('articleGraph.noDataTitle', 'No article graph data')}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: '#c2410c' }}>
              {t('articleGraph.noDataSub', 'No articles with valid relationship data were found.')}
            </div>
          </OverlayCard>
        ) : null}

        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 10,
            display: 'flex',
            gap: 10,
            zIndex: 5,
          }}
        >
          <CircleButton onClick={resetView}>?</CircleButton>
          <CircleButton onClick={centerView}>⌖</CircleButton>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 16,
            bottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '7px 10px',
            border: '1px solid #e4e7ec',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.94)',
            color: '#344054',
            fontSize: 12,
            zIndex: 5,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0071BC' }} />
            Selected article
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#0EA5E9' }} />
            Connected papers
          </span>
        </div>
      </div>
    </div>
  );
}

function OverlayCard({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        padding: '12px 16px',
        borderRadius: 16,
        background: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid rgba(251, 146, 60, 0.32)',
        boxShadow: '0 12px 30px rgba(154, 52, 18, 0.12)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
}

function CircleButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: '1px solid rgba(234, 88, 12, 0.5)',
        background: 'rgba(255, 255, 255, 0.92)',
        color: '#005A96',
        fontSize: 16,
        lineHeight: 1,
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 18px rgba(234, 88, 12, 0.14)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </button>
  );
}
