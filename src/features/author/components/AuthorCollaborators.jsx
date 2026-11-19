import Icon from "../../../shared/components/Icon";
import AuthorAvatar from "./AuthorAvatar";
import { Link, useParams } from "react-router-dom";

/**
 * @file AuthorCollaborators.jsx
 * @description Frequent academic collaborators list.
 */
export default function AuthorCollaborators({ collaborators = [] }) {
  const { lang = "en" } = useParams();
  return (
    <div className="ap-section" id="collaborators">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:users" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Frequent Collaborators</h2>
        </div>
        <span className="ap-section-badge">{collaborators.length} co-authors in loaded works</span>
      </div>

      {collaborators.length === 0 ? (
        <p className="text-sm text-muted-foreground">Co-author details are not available for the loaded publications.</p>
      ) : <div className="ap-collab-grid">
        {collaborators.map((c) => {
          const Card = c.id ? Link : "div";
          return (
          <Card
            key={c.id || c.name}
            {...(c.id ? { to: `/${lang}/authors/${encodeURIComponent(c.id)}` } : {})}
            className={`ap-collab-card${c.id ? " is-link" : ""}`}
            aria-label={c.id ? `View ${c.name}'s researcher profile` : undefined}
          >
            <div className="ap-collab-avatar">
              <AuthorAvatar name={c.name} size="md" bgColor={c.avatarColor} />
            </div>

            <div className="ap-collab-info">
              <h3 className="ap-collab-name">{c.name}</h3>
              <div className="ap-collab-inst">{c.institution}</div>
              <div className="ap-collab-role">{c.role}</div>

              {c.researchArea && (
                <div className="ap-collab-area-tag">
                  <span>{c.researchArea}</span>
                </div>
              )}

              <div className="ap-collab-shared-row">
                <Icon icon="lucide:file-text" width="11" />
                <span className="ap-collab-num">{c.sharedPublications}</span>
                <span>joint publications</span>
              </div>
            </div>
          </Card>
        );})}
      </div>}
    </div>
  );
}
