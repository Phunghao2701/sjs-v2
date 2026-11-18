import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalHero.jsx
 */
import { Row, Col } from '../../../shared/ui/layout-grid';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Skeleton } from '../../../shared/ui/skeleton';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
export default function JournalHero({
  journal,
  isFollowing,
  isAddingToProject,
  onFollow,
  onAddToProject,
  loading
}) {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  if (loading || !journal) {
    return (
      <section className="journal-surface journal-hero-card mb-4 rounded-card border border-border bg-surface p-6" aria-label="Đang tải thông tin tạp chí">
        <Row className="gy-4 journal-hero-content">
          <Col lg={8}>
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <Skeleton className="h-10 w-4/5 rounded mb-3" />
            <Skeleton className="h-16 w-11/12 rounded mb-4" />
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </Col>
          <Col lg={4} className="text-lg-end">
            <Skeleton className="h-16 w-36 rounded mb-2 ms-lg-auto" />
            <Skeleton className="h-5 w-40 rounded mb-3 ms-lg-auto" />
            <div className="flex gap-2 justify-content-lg-end flex-wrap">
              <Skeleton className="h-9 w-28 rounded" />
              <Skeleton className="h-9 w-32 rounded" />
            </div>
          </Col>
        </Row>
      </section>
    );
  }
  const {
    display_name,
    title,
    name,
    description,
    publisher_name,
    is_open_access,
    quartile,
    metric_value,
    metric_name,
    metric_year,
    latest_metrics,
    summary_stats,
    subject_categories = [],
    is_following
  } = journal || {};

  const journalTitle = display_name || title || name || '';
  const displayQuartile = quartile || latest_metrics?.quartile || 'Q1';
  const displayMetricValue = metric_value ?? latest_metrics?.sjr ?? latest_metrics?.value ?? summary_stats?.h_index ?? null;
  const displayMetricName = metric_name || (summary_stats?.h_index != null ? 'OpenAlex H-index' : 'SJR Score');
  const displayMetricYear = metric_year || latest_metrics?.year || null;

  const handleCategoryClick = categoryName => {
    if (!categoryName) return;
    navigate(`/keywords?keyword=${encodeURIComponent(categoryName)}`);
  };
  return <section className="journal-surface journal-hero-card mb-4" aria-labelledby="journal-detail-title">
      <Row className="gy-4 align-items-start journal-hero-content">
        <Col lg={8} md={7}>
          <div className="journal-meta-line flex items-center gap-2 mb-2 flex-wrap">
            {displayQuartile && (
              <Badge variant="success" className="text-xs font-bold px-2 py-0.5">
                {displayQuartile}
              </Badge>
            )}
            {is_open_access && (
              <Badge variant="info" className="text-xs font-semibold px-2 py-0.5">
                Open Access
              </Badge>
            )}
            {publisher_name && (
              <span className="text-xs text-muted-foreground font-medium">
                {publisher_name}
              </span>
            )}
          </div>

          <h1 id="journal-detail-title" className="journal-title">
            {journalTitle}
          </h1>

          <p className="journal-description">
            {description || t("journal.chuaCoMoTaChiTietPhamViNghienC")}
          </p>

          {subject_categories.length > 0 && <div className="journal-category-list" aria-label="Chủ đề nghiên cứu">
              {subject_categories.map((cat, idx) => <span key={cat.id || idx} className="journal-category-chip" role="button" tabIndex={0} onClick={() => handleCategoryClick(cat.display_name)} onKeyDown={e => e.key === 'Enter' && handleCategoryClick(cat.display_name)} title={`Tìm keyword ${cat.display_name}`}>
                  {cat.display_name}
                </span>)}
            </div>}
        </Col>

        <Col lg={4} md={5} className="text-md-end text-start mt-lg-2">
          {displayMetricValue !== null && displayMetricValue !== undefined ? <div className="journal-metric-panel ms-md-auto mb-3">
              <div className="journal-metric-value">
                {displayMetricValue}
              </div>
              <div className="journal-metric-label">
                {displayMetricName}{displayMetricYear ? ` ${displayMetricYear}` : ''}
              </div>
            </div> : <div className="journal-metric-panel ms-md-auto mb-3">
              <span className="text-muted-custom">{t("journal.chuaCoDuLieuRanking")}</span>
            </div>}

          <div className="journal-action-row">
            <Button onClick={onFollow} disabled={isFollowing} className={`journal-outline-btn px-3 py-2 ${is_following ? 'is-active' : ''}`}>
              {isFollowing ? <Spinner animation="border" size="sm" /> : is_following ? <>
                  <Icon icon="lucide:check" width="16" />{t("journal.dangTheoDoi")}</> : <>
                  <Icon icon="lucide:plus" width="16" />{t("catalog.theoDoi")}</>}
            </Button>

            <PrimaryButton onClick={onAddToProject} disabled={isAddingToProject} className="gap-2 px-3 py-2">
              {isAddingToProject ? <Spinner animation="border" size="sm" variant="light" /> : <>
                  <Icon icon="lucide:folder-plus" width="16" />{t("journal.themVaoProject")}</>}
            </PrimaryButton>
          </div>
        </Col>
      </Row>
    </section>;
}
