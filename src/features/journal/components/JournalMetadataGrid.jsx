import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\JournalMetadataGrid.jsx
 */
import { Row, Col } from '../../../shared/ui/layout-grid';
export default function JournalMetadataGrid({
  journal,
  loading
}) {
  const {
    t,
    i18n
  } = useTranslation();
  if (loading || !journal) {
    return <section className="journal-surface journal-meta-grid mb-4" aria-label="Đang tải metadata tạp chí">
        <Row className="gy-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Col lg={2} md={4} sm={6} key={i}>
              <div className="skeleton-shimmer mb-2" style={{
            width: '60px',
            height: '14px'
          }} />
              <div className="skeleton-shimmer" style={{
            width: '100px',
            height: '24px'
          }} />
            </Col>)}
        </Row>
      </section>;
  }
  const {
    issn,
    eissn,
    issns,
    publisher_name,
    country_name,
    region_name,
    subject_area_name,
    coverage
  } = journal;

  const allIssns = Array.isArray(issns) && issns.length > 0
    ? issns
    : String(issn || '').split(',').map(s => s.trim()).filter(Boolean);
  const displayIssn = allIssns[0] || issn || '';
  const displayEIssn = eissn || (allIssns.length > 1 ? allIssns[1] : (allIssns[0] && allIssns[0] !== displayIssn ? allIssns[0] : ''));

  // Format Country: if 2-letter ISO code, resolve friendly name in current locale
  const displayCountry = (() => {
    const raw = country_name || journal.country || journal.country_code;
    if (!raw) return '';
    if (/^[A-Z]{2}$/i.test(raw)) {
      try {
        const displayNames = new Intl.DisplayNames([i18n.language || 'en', 'en'], { type: 'region' });
        return displayNames.of(raw.toUpperCase()) || raw;
      } catch {
        return raw;
      }
    }
    return raw;
  })();

  // Format Area / Region
  const displayArea = region_name ||
    journal.region ||
    subject_area_name ||
    journal.area ||
    journal.subject_categories?.[0]?.display_name ||
    journal.topics?.[0]?.display_name ||
    journal.topic_share?.[0]?.domain?.display_name ||
    journal.topic_share?.[0]?.display_name ||
    '';

  // Format Coverage
  const displayCoverage = (() => {
    if (coverage) return coverage;
    if (journal.first_publication_year && journal.last_publication_year) {
      return journal.first_publication_year === journal.last_publication_year
        ? String(journal.first_publication_year)
        : `${journal.first_publication_year} - ${journal.last_publication_year}`;
    }
    if (Array.isArray(journal.counts_by_year) && journal.counts_by_year.length > 0) {
      const years = journal.counts_by_year.map(c => Number(c.year)).filter(Boolean);
      if (years.length) {
        const minY = Math.min(...years);
        const maxY = Math.max(...years);
        return minY === maxY ? String(minY) : `${minY} - ${maxY}`;
      }
    }
    return '';
  })();

  const metadataItems = [{
    label: 'ISSN',
    value: displayIssn
  }, {
    label: 'E-ISSN',
    value: displayEIssn
  }, {
    label: 'Publisher',
    value: publisher_name
  }, {
    label: t("journal.quocGia"),
    value: displayCountry
  }, {
    label: t("journal.khuVuc"),
    value: displayArea
  }, {
    label: 'Coverage',
    value: displayCoverage
  }];
  return <section className="journal-surface journal-meta-grid mb-4" aria-label="Thông tin cơ bản tạp chí">
      <Row className="gy-4 text-start">
        {metadataItems.map((item, idx) => <Col lg={2} md={4} xs={6} key={idx}>
            <div className="journal-meta-label">
              {item.label}
            </div>
            <div className="journal-meta-value">
              {item.value !== undefined && item.value !== null && item.value !== '' ? item.value : t("author.chuaCapNhat")}
            </div>
          </Col>)}
      </Row>
    </section>;
}