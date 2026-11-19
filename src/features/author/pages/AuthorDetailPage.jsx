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
  const { currentAuthor, fetchAuthorDetailsFull, loadingAuthorDetail, errorAuthorDetail, authorArticles, authorBreakdown, loadingArticles } = useAuthors();

  useEffect(() => {
    if (id) {
      fetchAuthorDetailsFull(id);
    }
  }, [id, fetchAuthorDetailsFull]);

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
            <Button variant="outline" size="sm" onClick={() => fetchAuthorDetailsFull(id)}>
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
  const researchFocus = (Array.isArray(currentAuthor?.subject_areas)
    ? currentAuthor.subject_areas
    : Array.isArray(currentAuthor?.topics) ? currentAuthor.topics : [])
    .map((area) => typeof area === 'string'
      ? area
      : area?.name || area?.display_name || area?.subject_area || area?.field || area?.domain || '')
    .filter(Boolean);

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
    research_focus: researchFocus,
    avatar_color: currentAuthor?.avatar_color || '#0071BC',
  };

  const metrics = {
    publications: currentAuthor?.works_count ?? currentAuthor?.article_count ?? 0,
    citations: currentAuthor?.cited_by_count ?? currentAuthor?.citation_count ?? 0,
    hIndex: currentAuthor?.h_index ?? 0,
    i10Index: currentAuthor?.i10_index ?? 0,
    highlyCitedPapers: 0,
    researchAreas: (currentAuthor?.subject_areas || currentAuthor?.topics || []).length,
  };

  // Build affiliations from enriched data
  const rawAffiliations = currentAuthor?.affiliations || [];
  const lastKnownInsts = currentAuthor?.last_known_institutions || [];

  const affiliations = rawAffiliations.length > 0
    ? rawAffiliations
      .filter(aff => aff.institution && aff.years?.length > 0)
      .sort((a, b) => Math.max(...(b.years || [0])) - Math.max(...(a.years || [0])))
      .slice(0, 10)
      .map((aff, idx) => ({
        id: aff.id || idx,
        institution: aff.institution,
        institutionId: aff.institution_id || aff.id || null,
        ror: aff.ror || null,
        externalUrl: aff.ror
          ? (String(aff.ror).startsWith('http') ? aff.ror : `https://ror.org/${aff.ror}`)
          : (aff.institution_id || aff.id ? `https://openalex.org/I${String(aff.institution_id || aff.id).replace(/^https?:\/\/openalex\.org\/I?/i, '').replace(/^I/i, '')}` : null),
        department: aff.type || '',
        role: 'Researcher',
        location: aff.country_code || '',
        since: aff.years?.length > 0 ? Math.min(...aff.years) : '',
        logoInitials: (aff.institution || '').slice(0, 2).toUpperCase(),
      }))
    : lastKnownInsts.length > 0
      ? lastKnownInsts.map((inst, idx) => ({
          id: inst.id || idx,
          institution: inst.display_name || 'Unknown',
          institutionId: inst.id || inst.institution_id || null,
          ror: inst.ror || null,
          externalUrl: inst.ror
            ? (String(inst.ror).startsWith('http') ? inst.ror : `https://ror.org/${inst.ror}`)
            : (inst.id || inst.institution_id ? `https://openalex.org/I${String(inst.id || inst.institution_id).replace(/^https?:\/\/openalex\.org\/I?/i, '').replace(/^I/i, '')}` : null),
          department: inst.type || '',
          role: 'Researcher',
          location: inst.country_code || '',
          since: '',
          logoInitials: (inst.display_name || 'UN').slice(0, 2).toUpperCase(),
        }))
      : institution && institution !== 'No institution listed'
        ? [{
            id: 1,
            institution: institution,
            department: currentAuthor?.institution_2 || currentAuthor?.department || '',
            role: 'Researcher',
            location: '',
            since: '',
            logoInitials: institution.slice(0, 2).toUpperCase(),
          }]
        : [];

  const researchCenters = [];

  // Build interests from topics
  const rawTopics = currentAuthor?.topics || [];
  const interests = rawTopics.map((t, idx) => ({
    name: t.display_name || t.field || t.domain || 'Unknown',
    primary: idx < 3,
  }));

  // Build research areas from topic_share or subject_areas
  const rawTopicShare = currentAuthor?.topic_share || [];
  const rawSubjectAreas = currentAuthor?.subject_areas || [];

  const researchAreas = (() => {
    if (rawTopicShare.length > 0) {
      const totalValue = rawTopicShare.reduce((sum, ts) => sum + (ts.value || 0), 0);
      const grouped = new Map();
      rawTopicShare.forEach((topic) => {
        const name = topic.display_name || topic.field || topic.topic || topic.domain || 'Unknown';
        const current = grouped.get(name) || { value: 0 };
        current.value += Number(topic.value) || 0;
        grouped.set(name, current);
      });
      return [...grouped.entries()].map(([name, topic]) => ({
        name,
        percentage: totalValue > 0 ? Math.round((topic.value / totalValue) * 100) : 0,
        count: Math.round(topic.value * (currentAuthor?.works_count || 0)),
      }));
    }
    if (rawSubjectAreas.length > 0) {
      const totalCount = rawSubjectAreas.reduce((sum, sa) => sum + (sa.count || 0), 0);
      return rawSubjectAreas.map(sa => ({
        name: sa.name || 'Unknown',
        percentage: totalCount > 0 ? Math.round((sa.count / totalCount) * 100) : 0,
        count: sa.count || 0,
      }));
    }
    // Fallback: derive from authorBreakdown
    if (authorBreakdown?.length > 0) {
      return authorBreakdown.map(item => ({
        name: item.subject_area || item.display_name || item.name || 'Unknown',
        percentage: item.percentage || 0,
        count: item.count || 0,
      }));
    }
    return [];
  })();

  // Build impact trend from counts_by_year
  const countsPerYear = currentAuthor?.counts_by_year || [];
  const impactTrend = countsPerYear
    .sort((a, b) => a.year - b.year)
    .map(c => ({
      year: c.year,
      citations: c.cited_by_count ?? 0,
      publications: c.works_count ?? 0,
    }));

  // Build publications from authorArticles
  const publications = (authorArticles || []).map((article) => ({
    id: article.article_id || article.id || article.openalex_id || null,
    title: article.title || article.display_name || 'Untitled',
    journal: article.journal_name || article.primary_location?.source?.display_name || article.journal || '',
    year: article.publication_year || article.year || null,
    authors: (article.authorships || article.authors || []).map((authorship) => {
      const person = authorship.author || authorship;
      const name = person.display_name || person.full_name || person.name || authorship.display_name || '';
      const authorId = person.author_id || person.id || person.openalex_id || authorship.author_id || null;
      return name ? { id: authorId, name } : null;
    }).filter(Boolean),
    citations: article.cited_by_count ?? article.citation_count ?? 0,
    doi: article.doi || null,
    tags: (article.topics || article.keywords || []).slice(0, 3).map(t => t.display_name || t.name || t),
  }));

  const mostCited = [...publications].sort((a, b) => (b.citations || 0) - (a.citations || 0)).slice(0, 5);

  // Build venue and co-author tables from the loaded publication records.
  const venueStats = new Map();
  const collaboratorStats = new Map();
  const authorIdentifiers = new Set([
    currentAuthor?.id,
    currentAuthor?.author_id,
    currentAuthor?.openalex_id,
    currentAuthor?.orcid,
  ].filter(Boolean).map(String));

  (authorArticles || []).forEach((article) => {
    const venueName = article.journal_name
      || article.primary_location?.source?.display_name
      || article.journal?.display_name
      || (typeof article.journal === 'string' ? article.journal : '');
    if (venueName) {
      const venue = venueStats.get(venueName) || { publications: 0, latestYear: null };
      const year = article.publication_year || article.year || null;
      venue.publications += 1;
      venue.latestYear = year && (!venue.latestYear || year > venue.latestYear) ? year : venue.latestYear;
      venueStats.set(venueName, venue);
    }

    const authorships = article.authorships || article.authors || [];
    const seenOnArticle = new Set();
    authorships.forEach((authorship) => {
      const person = authorship.author || authorship;
      const id = person.author_id || person.id || person.openalex_id || authorship.author_id;
      const name = person.display_name || person.full_name || person.name || authorship.display_name;
      if (!name) return;
      const identifier = id ? String(id) : name;
      if (authorIdentifiers.has(identifier) || name.trim().toLowerCase() === authorName.trim().toLowerCase() || seenOnArticle.has(identifier)) return;
      seenOnArticle.add(identifier);

      const collaborator = collaboratorStats.get(identifier) || {
        id: identifier,
        name,
        institution: person.last_known_institution?.display_name
          || person.last_known_institution
          || authorship.institution?.display_name
          || '',
        researchArea: person.topics?.[0]?.display_name || '',
        sharedPublications: 0,
      };
      collaborator.sharedPublications += 1;
      collaboratorStats.set(identifier, collaborator);
    });
  });

  const journals = [...venueStats.entries()]
    .map(([name, stats]) => ({ id: name, name, ...stats }))
    .sort((a, b) => b.publications - a.publications || a.name.localeCompare(b.name))
    .slice(0, 5);
  const collaborators = [...collaboratorStats.values()]
    .sort((a, b) => b.sharedPublications - a.sharedPublications || a.name.localeCompare(b.name))
    .slice(0, 8);

  // Build research network from affiliations + topics
  const networkNodes = [
    ...(affiliations.length > 0
      ? affiliations.slice(0, 4).map((aff, idx) => ({
            id: `inst-${idx}`,
            name: aff.institution,
            label: aff.institution?.length > 20 ? aff.institution.slice(0, 18) + '…' : aff.institution,
            type: 'institution',
            externalUrl: aff.externalUrl,
            angle: idx * (360 / Math.min(affiliations.length, 4) + 4),
          }))
      : []),
    ...rawTopics
      .slice(0, 4)
      .map((t, idx) => {
        const name = t.display_name || t.field || t.domain || 'Research area';
        return ({
        id: `topic-${idx}`,
        name,
        searchTerm: name,
        label: name.length > 20 ? name.slice(0, 18) + '…' : name,
        type: 'topic',
        angle: 180 + idx * (360 / 8),
      });}),
  ];

  const network = {
    center: { label: authorName },
    nodes: networkNodes,
  };

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
        <motion.div className="ap-quicknav-sticky" variants={fadeUp}>
          <AuthorQuickNav />
        </motion.div>

        {/* 4. KEY RESEARCH METRICS STRIP */}
        <motion.div variants={fadeUp}>
          <AuthorMetricsCards metrics={metrics} />
        </motion.div>

        {/* 5. TWO-COLUMN GRID: Affiliations & Centers | Interests & Areas */}
        <motion.div id="affiliations" variants={fadeUp} className="ap-grid-two-col">
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
        <motion.div id="research" variants={fadeUp}>
          <AuthorResearchImpact metrics={metrics} trend={impactTrend} />
        </motion.div>

        {/* 7. SCIENTIFIC PUBLICATIONS */}
        <motion.div id="publications" variants={fadeUp}>
          <AuthorPublications publications={publications} />
        </motion.div>

        {/* 8. TWO-COLUMN: Most Cited | Top Journals */}
        <motion.div id="venues" variants={fadeUp} className={`ap-grid-two-col${journals.length === 0 ? " ap-grid-single-col" : ""}`}>
          <div className="ap-grid-col">
            <AuthorMostCited mostCited={mostCited} />
          </div>
          {journals.length > 0 && (
            <div className="ap-grid-col">
              <AuthorJournals journals={journals} />
            </div>
          )}
        </motion.div>

        {/* 9. TWO-COLUMN: Frequent Collaborators | Research Network */}
        <motion.div id="collaborators" variants={fadeUp} className={`ap-grid-two-col${collaborators.length === 0 ? " ap-grid-single-col" : ""}`}>
          {collaborators.length > 0 && (
            <div className="ap-grid-col">
              <AuthorCollaborators collaborators={collaborators} />
            </div>
          )}
          <div className="ap-grid-col">
            <AuthorResearchNetwork network={network} />
          </div>
        </motion.div>

        {/* 10. TWO-COLUMN: Awards & Honors | Education & Career */}
        <motion.div id="awards" variants={fadeUp} className="ap-grid-two-col">
          <div className="ap-grid-col">
            <AuthorAwards awards={awards} />
          </div>
          <div className="ap-grid-col">
            <AuthorEducation education={education} />
          </div>
        </motion.div>

        {/* 11. RELATED RESEARCHERS */}
        <motion.div id="related" variants={fadeUp}>
          <AuthorRelatedResearchers researchers={relatedResearchers} />
        </motion.div>
      </MotionPage>
    </PageContainer>
  );
}
