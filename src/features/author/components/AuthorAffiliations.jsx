import { useState } from "react";
import Icon from "../../../shared/components/Icon";

/**
 * @file AuthorAffiliations.jsx
 * @description Paginated academic affiliations list.
 */
export default function AuthorAffiliations({ affiliations }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!affiliations || affiliations.length === 0) return null;

  const pageSize = 4;
  const pageCount = Math.ceil(affiliations.length / pageSize);
  const safePage = Math.min(currentPage, pageCount);
  const visibleAffiliations = affiliations.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstVisible = (safePage - 1) * pageSize + 1;
  const lastVisible = Math.min(safePage * pageSize, affiliations.length);

  return (
    <div className="ap-section ap-affiliations-section" id="affiliations">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:building-2" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Current Affiliations</h2>
        </div>
        <span className="ap-section-badge">{affiliations.length} institutions</span>
      </div>

      <div className="ap-affiliations-list">
        {visibleAffiliations.map((item) => (
          <div key={item.id} className={`ap-affiliation-item${item.externalUrl ? " is-link" : ""}`}>
            <div
              className="ap-affiliation-badge-logo"
              style={{
                backgroundColor: item.logoColor ? `${item.logoColor}15` : "var(--bg-chip)",
                borderColor: item.logoColor ? `${item.logoColor}40` : "var(--border)",
                color: item.logoColor || "var(--text-main)",
              }}
            >
              {item.logoInitials || "GT"}
            </div>

            <div className="ap-affiliation-content">
              <div className="ap-affiliation-main-row">
                <h3 className="ap-affiliation-name">
                  {item.externalUrl ? (
                    <a href={item.externalUrl} target="_blank" rel="noreferrer" aria-label={`Open ${item.institution} organization record`}>
                      {item.institution}
                    </a>
                  ) : item.institution}
                </h3>
                {item.since && <span className="ap-affiliation-since">Since {item.since}</span>}
              </div>

              <div className="ap-affiliation-dept">{item.department}</div>

              <div className="ap-affiliation-meta-footer">
                <span className="ap-affiliation-role">
                  <Icon icon="lucide:user-check" width="12" />
                  {item.role}
                </span>
                <span className="ap-affiliation-dot">·</span>
                <span className="ap-affiliation-loc">
                  <Icon icon="lucide:map-pin" width="11" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="ap-affiliations-pagination" aria-label="Affiliations pagination">
          <span className="ap-affiliations-page-summary">
            {firstVisible}–{lastVisible} of {affiliations.length}
          </span>
          <div className="ap-affiliations-page-actions">
            <button
              type="button"
              className="ap-affiliations-page-btn"
              aria-label="Previous affiliations page"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <Icon icon="lucide:chevron-left" width="14" />
            </button>
            <span className="ap-affiliations-page-number">{safePage} / {pageCount}</span>
            <button
              type="button"
              className="ap-affiliations-page-btn"
              aria-label="Next affiliations page"
              disabled={safePage >= pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            >
              <Icon icon="lucide:chevron-right" width="14" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
