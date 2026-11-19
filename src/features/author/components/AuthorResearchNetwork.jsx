import Icon from "../../../shared/components/Icon";

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * @file AuthorResearchNetwork.jsx
 * @description Lightweight, clean SVG-based academic collaboration & research network visualization.
 */
export default function AuthorResearchNetwork({ network }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();
  const { lang = "en" } = useParams();

  if (!network || (!network.nodes?.length && !network.center)) return null;

  const { center, nodes = [] } = network;
  const centerLabel = center?.label || 'Author';
  const nameParts = centerLabel.split(' ');
  const line1 = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
  const line2 = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
  const cx = 200;
  const cy = 150;
  const r = 105;
  const svgW = 400;
  const svgH = 300;

  const nodeColors = {
    institution: "#0F172A", // Dark navy
    topic: "var(--primary)", // Orange
    person: "#0EA5E9",
  };

  const getPos = (angle) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:share-2" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Research Network</h2>
        </div>
        <span className="ap-section-badge">Key Affiliations & Core Topics</span>
      </div>

      <div className="ap-network-wrapper">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="ap-network-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines */}
          {nodes.map((node) => {
            const pos = getPos(node.angle);
            return (
              <line
                key={node.id}
                x1={cx}
                y1={cy}
                x2={pos.x}
                y2={pos.y}
                stroke="var(--border)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Outer Satellite Nodes */}
          {nodes.map((node) => {
            const pos = getPos(node.angle);
            const color = nodeColors[node.type] || "var(--text-muted)";
            return (
              <g
                key={node.id}
                className={`ap-network-node-group${selectedNode?.id === node.id ? " is-selected" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Show details for ${node.name || node.label}`}
                aria-pressed={selectedNode?.id === node.id}
                onClick={() => setSelectedNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedNode(node);
                  }
                }}
              >
                <title>{`${node.name || node.label} — ${node.type === "institution" ? "Affiliation" : "Research area"}. Select for details.`}</title>
                <circle className="ap-network-hit-area" cx={pos.x} cy={pos.y} r="18" />
                <circle cx={pos.x} cy={pos.y} r="10" fill={color} opacity="0.12" />
                <circle cx={pos.x} cy={pos.y} r="6" fill={color} />
                <text
                  x={pos.x}
                  y={pos.y + (pos.y > cy ? 18 : -14)}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--text-main)"
                  fontWeight="600"
                  fontFamily="var(--font-display)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Center Hub Node */}
          <circle cx={cx} cy={cy} r="32" fill="var(--primary)" opacity="0.12" />
          <circle cx={cx} cy={cy} r="22" fill="var(--primary)" />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize="8"
            fill="#ffffff"
            fontWeight="700"
            fontFamily="var(--font-display)"
          >
            {line1}
          </text>
          <text
            x={cx}
            y={cy + 7}
            textAnchor="middle"
            fontSize="8"
            fill="#ffffff"
            fontWeight="700"
            fontFamily="var(--font-display)"
          >
            {line2}
          </text>
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
        ) : (
          <p className="ap-network-hint">Select an institution or research area to explore its details.</p>
        )}

        <div className="ap-network-legend">
          <span className="ap-network-legend-item">
            <span style={{ backgroundColor: "#0F172A" }} className="ap-network-dot" />
            <span>Institutions & Alliances</span>
          </span>
          <span className="ap-network-legend-item">
            <span style={{ backgroundColor: "var(--primary)" }} className="ap-network-dot" />
            <span>Foundational Research Domains</span>
          </span>
        </div>
      </div>
    </div>
  );
}
