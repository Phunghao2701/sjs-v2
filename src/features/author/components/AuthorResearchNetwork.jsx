import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../../../shared/components/Icon";

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 400;
const CENTER = { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };

function makeInitialPositions(nodes) {
  const radius = 135;
  return Object.fromEntries(nodes.map((node, index) => {
    const angle = (-90 + (360 * index) / Math.max(nodes.length, 1)) * Math.PI / 180;
    return [node.id, {
      x: CENTER.x + radius * Math.cos(angle),
      y: CENTER.y + radius * Math.sin(angle),
    }];
  }));
}

export default function AuthorResearchNetwork({ network }) {
  const navigate = useNavigate();
  const { lang = "en" } = useParams();
  const svgRef = useRef(null);
  const gestureRef = useRef(null);
  const draggedRef = useRef(false);
  const nodes = network?.nodes || [];
  const centerLabel = network?.center?.label || "Author";
  const [selectedNode, setSelectedNode] = useState(null);
  const [positions, setPositions] = useState(() => makeInitialPositions(nodes));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const nodePositions = useMemo(() => {
    const initial = makeInitialPositions(nodes);
    return nodes.map((node) => ({
      node,
      position: positions[node.id] || initial[node.id],
    }));
  }, [nodes, positions]);

  const updateGesture = useCallback((event) => {
    const gesture = gestureRef.current;
    const svg = svgRef.current;
    if (!gesture || !svg) return;

    const rect = svg.getBoundingClientRect();
    const dx = ((event.clientX - gesture.startX) * VIEW_WIDTH) / rect.width;
    const dy = ((event.clientY - gesture.startY) * VIEW_HEIGHT) / rect.height;

    if (Math.abs(dx) + Math.abs(dy) > 2) draggedRef.current = true;

    if (gesture.type === "node") {
      setPositions((current) => ({
        ...current,
        [gesture.nodeId]: {
          x: gesture.startPosition.x + dx / zoom,
          y: gesture.startPosition.y + dy / zoom,
        },
      }));
    } else {
      setPan({ x: gesture.startPan.x + dx, y: gesture.startPan.y + dy });
    }
  }, [zoom]);

  const endGesture = useCallback((event) => {
    gestureRef.current = null;
    if (svgRef.current?.hasPointerCapture?.(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
  }, []);

  const startNodeDrag = (event, node, position) => {
    event.preventDefault();
    event.stopPropagation();
    draggedRef.current = false;
    gestureRef.current = {
      type: "node",
      nodeId: node.id,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
    };
    svgRef.current?.setPointerCapture?.(event.pointerId);
  };

  const startPan = (event) => {
    if (event.target !== svgRef.current) return;
    gestureRef.current = {
      type: "pan",
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan,
    };
    svgRef.current?.setPointerCapture?.(event.pointerId);
  };

  const changeZoom = (factor) => {
    setZoom((current) => Math.min(2.5, Math.max(0.65, current * factor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!network || (!nodes.length && !network.center)) return null;

  const nameParts = centerLabel.split(" ");
  const midpoint = Math.ceil(nameParts.length / 2);
  const centerLines = [nameParts.slice(0, midpoint).join(" "), nameParts.slice(midpoint).join(" ")];

  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:share-2" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Research Network</h2>
        </div>
        <span className="ap-section-badge">Key Affiliations &amp; Core Topics</span>
      </div>

      <div className="ap-network-wrapper">
        <div className="ap-network-controls" aria-label="Research network controls">
          <button type="button" onClick={() => changeZoom(1.2)} aria-label="Zoom in" title="Zoom in">+</button>
          <button type="button" onClick={() => changeZoom(1 / 1.2)} aria-label="Zoom out" title="Zoom out">−</button>
          <button type="button" onClick={resetView} aria-label="Reset view" title="Reset view">↺</button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="ap-network-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Interactive author research network"
          onPointerDown={startPan}
          onPointerMove={updateGesture}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          onWheel={(event) => {
            event.preventDefault();
            changeZoom(event.deltaY < 0 ? 1.12 : 1 / 1.12);
          }}
          onClick={(event) => {
            if (event.target === svgRef.current && !draggedRef.current) setSelectedNode(null);
            draggedRef.current = false;
          }}
        >
          <g transform={`translate(${CENTER.x + pan.x} ${CENTER.y + pan.y}) scale(${zoom}) translate(${-CENTER.x} ${-CENTER.y})`}>
            {nodePositions.map(({ node, position }) => (
              <line
                key={`link-${node.id}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={position.x}
                y2={position.y}
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                pointerEvents="none"
              />
            ))}

            {nodePositions.map(({ node, position }) => {
              const isSelected = selectedNode?.id === node.id;
              const angle = Math.atan2(position.y - CENTER.y, position.x - CENTER.x);
              const color = node.type === "institution" ? "#0F172A" : "#0071BC";
              const labelX = position.x + Math.cos(angle) * 16;
              const labelY = position.y + Math.sin(angle) * 16;
              const textAnchor = Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle";

              return (
                <g
                  key={node.id}
                  className={`ap-network-node-group${isSelected ? " is-selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Show details for ${node.name || node.label}`}
                  aria-pressed={isSelected}
                  onPointerDown={(event) => startNodeDrag(event, node, position)}
                  onClick={() => {
                    if (draggedRef.current) {
                      draggedRef.current = false;
                      return;
                    }
                    setSelectedNode(node);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedNode(node);
                    }
                  }}
                >
                  <title>{`${node.name || node.label} — ${node.type === "institution" ? "Affiliation" : "Research area"}. Drag to rearrange or select for details.`}</title>
                  <circle className="ap-network-hit-area" cx={position.x} cy={position.y} r="20" />
                  <circle cx={position.x} cy={position.y} r="11" fill={color} opacity="0.14" />
                  <circle cx={position.x} cy={position.y} r="7" fill={color} />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="var(--text-main)"
                    fontWeight="600"
                    fontFamily="var(--font-display)"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            <g className="ap-network-center-node" pointerEvents="none">
              <circle cx={CENTER.x} cy={CENTER.y} r="32" fill="var(--primary)" opacity="0.12" />
              <circle cx={CENTER.x} cy={CENTER.y} r="22" fill="var(--primary)" />
              <text x={CENTER.x} y={CENTER.y - 4} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700" fontFamily="var(--font-display)">
                {centerLines[0]}
              </text>
              {centerLines[1] ? (
                <text x={CENTER.x} y={CENTER.y + 7} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700" fontFamily="var(--font-display)">
                  {centerLines[1]}
                </text>
              ) : null}
            </g>
          </g>
        </svg>

        {selectedNode ? (
          <div className="ap-network-selection" aria-live="polite">
            <div className="ap-network-selection-copy">
              <span className="ap-network-selection-type">
                {selectedNode.type === "institution" ? "Affiliation" : "Research area"}
              </span>
              <strong>{selectedNode.name || selectedNode.label}</strong>
            </div>
            <div className="ap-network-selection-actions">
              {selectedNode.type === "institution" && selectedNode.externalUrl ? (
                <a href={selectedNode.externalUrl} target="_blank" rel="noreferrer" className="ap-network-selection-action">
                  Open organization record <Icon icon="lucide:external-link" width="12" />
                </a>
              ) : selectedNode.type === "topic" ? (
                <button
                  type="button"
                  className="ap-network-selection-action"
                  onClick={() => navigate(`/${lang}/catalog?search=${encodeURIComponent(selectedNode.searchTerm || selectedNode.name || selectedNode.label)}`)}
                >
                  Find related publications <Icon icon="lucide:arrow-right" width="12" />
                </button>
              ) : null}
              <button
                type="button"
                className="ap-network-clear"
                onClick={() => setSelectedNode(null)}
                aria-label="Clear selected network node"
                title="Clear selection"
              >
                <Icon icon="lucide:x" width="14" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="ap-network-legend">
          <span className="ap-network-legend-item">
            <span style={{ backgroundColor: "#0F172A" }} className="ap-network-dot" />
            <span>Institutions &amp; Alliances</span>
          </span>
          <span className="ap-network-legend-item">
            <span style={{ backgroundColor: "#0071BC" }} className="ap-network-dot" />
            <span>Foundational Research Domains</span>
          </span>
        </div>
      </div>
    </div>
  );
}
