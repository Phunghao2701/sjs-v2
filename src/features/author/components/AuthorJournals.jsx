import Icon from "../../../shared/components/Icon";

/**
 * @file AuthorJournals.jsx
 * @description Top publication venues derived from the author's available works.
 */
export default function AuthorJournals({ journals = [] }) {
  const maxPubs = Math.max(1, ...journals.map((journal) => journal.publications || 0));

  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:newspaper" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Top Publication Venues</h2>
        </div>
        <span className="ap-section-badge">{journals.length} venues in loaded works</span>
      </div>

      {journals.length === 0 ? (
        <p className="text-sm text-muted-foreground">Venue information is not available for the loaded publications.</p>
      ) : <div className="ap-journals-table">
        {journals.map((j, idx) => {
          const pct = Math.round((j.publications / maxPubs) * 100);

          return (
            <div key={j.id || idx} className="ap-journal-card">
              <div className="ap-journal-top">
                <div className="ap-journal-name-block">
                  <span className="ap-journal-rank-bullet">{idx + 1}</span>
                  <span className="ap-journal-name">{j.name}</span>
                  {j.quartile && <span className="ap-journal-q-badge">{j.quartile}</span>}
                </div>

                <div className="ap-journal-stat-block">
                  <span className="ap-journal-pub-count">
                    <strong>{j.publications}</strong> publications
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="ap-journal-bar-track">
                <div className="ap-journal-bar-fill" style={{ width: `${pct}%` }} />
              </div>

              {/* Footer info: latest year + journal metrics */}
              {(j.latestYear || j.impactFactor || j.citeScore) && (
                <div className="ap-journal-sub-row">
                  {j.latestYear && <span className="ap-journal-latest">Latest paper: {j.latestYear}</span>}
                  {(j.impactFactor || j.citeScore) && (
                    <div className="ap-journal-scores">
                      {j.impactFactor && <span className="ap-journal-score-pill">IF: {j.impactFactor}</span>}
                      {j.citeScore && <span className="ap-journal-score-pill">CiteScore: {j.citeScore}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
}
