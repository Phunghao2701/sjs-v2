import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthors from "../hooks/useAuthors";
import Icon from "../../../shared/components/Icon";
import { PageContainer } from "../../../shared/ui/page-layout";
import { StatePanel } from "../../../shared/ui/state-panel";
import { Button } from "../../../shared/ui/button";
import { Breadcrumbs } from "../../../shared/ui/breadcrumb";
import { MotionPage, fadeUp, staggerContainer, staggerItem } from "../../../shared/ui/motion";

// Sub-components
import AuthorProfileHero from "../components/AuthorProfileHero";
import AuthorQuickNav from "../components/AuthorQuickNav";
import AuthorMetricsCards from "../components/AuthorMetricsCards";
import AuthorAffiliations from "../components/AuthorAffiliations";
import AuthorResearchCenters from "../components/AuthorResearchCenters";
import AuthorResearchInterests from "../components/AuthorResearchInterests";
import AuthorResearchAreas from "../components/AuthorResearchAreas";
import AuthorResearchImpact from "../components/AuthorResearchImpact";
import AuthorPublications from "../components/AuthorPublications";
import AuthorMostCited from "../components/AuthorMostCited";
import AuthorJournals from "../components/AuthorJournals";
import AuthorCollaborators from "../components/AuthorCollaborators";
import AuthorResearchNetwork from "../components/AuthorResearchNetwork";
import AuthorAwards from "../components/AuthorAwards";
import AuthorEducation from "../components/AuthorEducation";
import AuthorRelatedResearchers from "../components/AuthorRelatedResearchers";

import "./AuthorDetailPage.css";

/**
 * @file AuthorDetailPage.jsx
 * @description Academic Researcher Profile (ResearchPulse).
 * Full-width, high-density scientific profile layout.
 */
export default function AuthorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentAuthor, fetchAuthorDetail, loadingAuthorDetail, errorAuthorDetail } = useAuthors();

  useEffect(() => {
    if (id) {
      fetchAuthorDetail(id);
    }
  }, [id, fetchAuthorDetail]);

  if (loadingAuthorDetail) {
    return (
      <PageContainer className="space-y-4">
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Icon icon="lucide:loader-2" className="size-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Loading author profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (errorAuthorDetail || (!loadingAuthorDetail && !currentAuthor && id)) {
    return (
      <PageContainer className="space-y-4">
        <StatePanel
          variant="error"
          icon={<Icon icon="lucide:wifi-off" width="36" className="text-danger" />}
          title="Unable to load author profile"
          description={errorAuthorDetail?.message || "Server request failed or rate limit reached. Please try again."}
          actions={
            <Button variant="outline" size="sm" onClick={() => fetchAuthorDetail(id)}>
              Retry
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const rawName = currentAuthor?.display_name || currentAuthor?.full_name || currentAuthor?.name || '';
  const authorName = rawName && rawName.trim() ? rawName.trim() : (currentAuthor?.openalex_id ? `Author ${currentAuthor.openalex_id}` : `Author #${id}`);
  const institution = currentAuthor?.institution_1 || currentAuthor?.last_known_institution || currentAuthor?.affiliation || 'No institution listed';

  const author = {
    id: currentAuthor?.author_id || currentAuthor?.id || id,
    full_name: authorName,
    position: currentAuthor?.position || 'Academic Researcher',
    institution_1: institution,
    institution_2: currentAuthor?.institution_2 || currentAuthor?.department || '',
    orcid: currentAuthor?.orcid || '',
    homepage: currentAuthor?.homepage || '',
    email: currentAuthor?.email || '',
    bio: currentAuthor?.bio || '',
    research_focus: currentAuthor?.subject_areas || [],
    avatar_color: currentAuthor?.avatar_color || '#0071BC',
  };

  const metrics = {
    publications: currentAuthor?.works_count ?? currentAuthor?.article_count ?? 0,
    citations: currentAuthor?.cited_by_count ?? currentAuthor?.citation_count ?? 0,
    hIndex: currentAuthor?.h_index ?? 0,
    i10Index: currentAuthor?.i10_index ?? 0,
    highlyCitedPapers: 0,
    researchAreas: (currentAuthor?.subject_areas || []).length,
  };

  const affiliations = institution && institution !== 'No institution listed' ? [
    {
      id: 1,
      institution: institution,
      department: currentAuthor?.institution_2 || currentAuthor?.department || '',
      role: 'Researcher',
      location: '',
      since: '',
      logoInitials: institution.slice(0, 2).toUpperCase(),
    }
  ] : [];

  const researchCenters = [];
  const interests = currentAuthor?.subject_areas || [];
  const researchAreas = [];
  const impactTrend = [];
  const publications = [];
  const mostCited = [];
  const journals = [];
  const collaborators = [];
  const network = { nodes: [], links: [] };
  const awards = [];
  const education = [];
  const relatedResearchers = [];

  return (
    <PageContainer className="space-y-4">
      <MotionPage className="ap-main-container space-y-4">
        {/* RESEARCHER HERO */}
        <motion.div variants={fadeUp}>
          <AuthorProfileHero author={author} metrics={metrics} />
        </motion.div>

        {/* 3. QUICK NAVIGATION (Sticky) */}
        <motion.div variants={fadeUp}>
          <AuthorQuickNav />
        </motion.div>

        {/* 4. KEY RESEARCH METRICS STRIP */}
        <motion.div variants={fadeUp}>
          <AuthorMetricsCards metrics={metrics} />
        </motion.div>

        {/* 5. TWO-COLUMN GRID: Affiliations & Centers | Interests & Areas */}
        <motion.div variants={fadeUp} className="ap-grid-two-col">
          {/* Left Column */}
          <div className="ap-grid-col">
            <AuthorAffiliations affiliations={affiliations} />
            <AuthorResearchCenters centers={researchCenters} />
          </div>

          {/* Right Column */}
          <div className="ap-grid-col">
            <AuthorResearchInterests interests={interests} />
            <AuthorResearchAreas areas={researchAreas} />
          </div>
        </motion.div>

        {/* 6. RESEARCH IMPACT & TRAJECTORY */}
        <motion.div variants={fadeUp}>
          <AuthorResearchImpact metrics={metrics} trend={impactTrend} />
        </motion.div>

        {/* 7. SCIENTIFIC PUBLICATIONS */}
        <motion.div variants={fadeUp}>
          <AuthorPublications publications={publications} />
        </motion.div>

        {/* 8. TWO-COLUMN: Most Cited | Top Journals */}
        <motion.div variants={fadeUp} className="ap-grid-two-col">
          <div className="ap-grid-col">
            <AuthorMostCited mostCited={mostCited} />
          </div>
          <div className="ap-grid-col">
            <AuthorJournals journals={journals} />
          </div>
        </motion.div>

        {/* 9. TWO-COLUMN: Frequent Collaborators | Research Network */}
        <motion.div variants={fadeUp} className="ap-grid-two-col">
          <div className="ap-grid-col">
            <AuthorCollaborators collaborators={collaborators} />
          </div>
          <div className="ap-grid-col">
            <AuthorResearchNetwork network={network} />
          </div>
        </motion.div>

        {/* 10. TWO-COLUMN: Awards & Honors | Education & Career */}
        <motion.div variants={fadeUp} className="ap-grid-two-col">
          <div className="ap-grid-col">
            <AuthorAwards awards={awards} />
          </div>
          <div className="ap-grid-col">
            <AuthorEducation education={education} />
          </div>
        </motion.div>

        {/* 11. RELATED RESEARCHERS */}
        <motion.div variants={fadeUp}>
          <AuthorRelatedResearchers researchers={relatedResearchers} />
        </motion.div>
      </MotionPage>
    </PageContainer>
  );
}
