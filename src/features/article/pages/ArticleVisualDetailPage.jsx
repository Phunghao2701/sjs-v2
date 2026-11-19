import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\pages\ArticleVisualDetailPage.jsx
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/ui/modal';
import { Dropdown } from '../../../shared/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { Button } from '../../../shared/ui/button';

// Auth
import useAuth from '../../auth/hooks/useAuth';

// API
import { getArticleDetailApi, bookmarkArticleApi, getArticlesListApi } from '../api/articleApi';

// Subcomponents
import ArticleDetailSkeleton from '../components/ArticleDetailSkeleton';
import ArticleDetailEmpty from '../components/ArticleDetailEmpty';
import ArticleDetailError from '../components/ArticleDetailError';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { toast } from '../../../shared/utils/toast';
import { getDoiUrl, normalizeArticleDetail } from '../utils/articleFormatters';
import { downloadArticleCsv } from '../utils/csvExport';
import { downloadArticlePdf } from '../utils/pdfExport';
import LatexText from '../../../shared/components/LatexText/LatexText';
import ArticleGraphWidget from '../../../trendingApp/features/articles/components/ArticleGraphWidget';
import { searchArticlesGraph } from '../../../trendingApp/features/articles/services/articleGraph.service';
import '../Article.css';
const formatAuthorsLine = (authors = [], limit = 3) => {
  if (!authors || authors.length === 0) return t("article.dangCapNhatTacGia");
  const names = authors.slice(0, limit).map(author => author.display_name || author.name || author.author_name || t("typeAuthor")).join(', ');
  return authors.length > limit ? `${names}...` : names;
};
const normalizeRecommendedArticle = (item = {}) => ({
  ...item,
  article_id: item.article_id || item.id,
  title: item.title || 'Untitled Article',
  publication_year: item.publication_year || item.year || '—',
  doi: item.doi || '',
  abstract: item.abstract || item.description || 'No abstract is available for this article.',
  authors: Array.isArray(item.authors) ? formatAuthorsLine(item.authors, 3) : item.authors || item.authors_text || ''
});
const formatReferenceLabel = (referenceUrl = '', index = 0) => {
  const rawValue = String(referenceUrl || '').trim();
  if (!rawValue) return `Reference ${index + 1}`;
  const workId = rawValue.split('/').filter(Boolean).pop();
  return workId ? `OpenAlex ${workId}` : `Reference ${index + 1}`;
};

// ======================================================================
// Right Sidebar Component for Article Details
// ======================================================================
const ArticleDetailPane = ({
  articleId,
  onTitleClick
}) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [referencePage, setReferencePage] = useState(1);
  const referencesPerPage = 2;
  const fetchArticleForPane = useCallback(async () => {
    console.log(`[Pane] Attempting to fetch details for articleId: '${articleId}' (type: ${typeof articleId})`);
    if (!articleId) {
      console.warn('[Pane] No articleId provided, aborting fetch.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getArticleDetailApi(articleId);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        if (Object.keys(apiData).length === 0) {
          console.warn(`[Pane] API returned success, but data is empty for ID: '${articleId}'. Rendering 'Empty' state.`);
          setArticle(null);
        } else {
          const parsedArticle = normalizeArticleDetail(apiData, articleId);
          setArticle(parsedArticle);
        }
        const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${articleId}`;
        const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
        setIsBookmarked(apiData.is_bookmarked || isLocallyBookmarked);
      } else {
        throw new Error(response.data?.message || t("article.khongTheTaiChiTietBaiBao"));
      }
    } catch (err) {
      console.error(`[Pane] Error fetching article detail for ID '${articleId}':`, err);
      if (err.isAxiosError && err.response && err.response.status === 404) {
        setError({
          type: '404',
          message: t("article.khongTimThayBaiBaoNay")
        });
      } else {
        setError({
          type: 'generic',
          message: err.message || t("article.loiKhiTaiDuLieu")
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [articleId, currentUser]);
  useEffect(() => {
    fetchArticleForPane();
  }, [fetchArticleForPane]);
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const visibleAuthors = useMemo(() => {
    const authors = article?.authors || [];
    if (showAllAuthors) return authors;
    return authors.slice(0, 3);
  }, [article?.authors, showAllAuthors]);
  const hiddenAuthorCount = Math.max((article?.authors?.length || 0) - 3, 0);
  const references = article?.references || [];
  const referenceTotalPages = Math.max(1, Math.ceil(references.length / referencesPerPage));
  const paginatedReferences = references.slice((referencePage - 1) * referencesPerPage, referencePage * referencesPerPage);
  const articleDoiUrl = getDoiUrl(article?.doi);
  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!article?.article_id) return;
    setIsBookmarkLoading(true);
    const localBookmarkKey = `bookmark_${currentUser.username}_${article.article_id}`;
    const nextState = !isBookmarked;
    try {
      await bookmarkArticleApi(article.article_id);
      setIsBookmarked(nextState);
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.success(nextState ? t("article.daThemBaiBaoVaoProject") : t("article.daXoaBaiBaoKhoiProject"));
    } catch (err) {
      console.warn('Bookmark API error, toggling state locally:', err);
      setIsBookmarked(nextState);
      localStorage.setItem(localBookmarkKey, String(nextState));
      toast.warning(t("article.khongTheDongBoServerDaCapNhatT"));
    } finally {
      setIsBookmarkLoading(false);
    }
  };
  const handleShareArticle = async () => {
    const shareUrl = `${window.location.origin}/articles/${article.article_id}`;
    const shareData = {
      title: article?.title || 'Article detail',
      text: `Khám phá bài báo: ${article?.title || ''}`,
      url: shareUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(t("article.daMoChiaSeBaiBao"));
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("article.daSaoChepLienKetBaiBao"));
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('Unable to share article:', err);
      toast.error(t("article.khongTheChiaSeBaiBaoLucNay"));
    }
  };
  if (isLoading) {
    return <div className="p-4">
        <ArticleDetailSkeleton />
      </div>;
  }
  if (error) {
    if (error.type === '404') {
      return <div className="p-4 text-center">
          <Icon icon="lucide:file-x" width="48" className="text-muted-custom mb-3" />
          <h4 className="font-display fw-bold text-main">{t("article.baiBaoKhongTonTai")}</h4>
          <p className="text-muted-custom px-2">{t("article.coVeNhuChungToiKhongTheTimThay")}{articleId}{t("article.coTheKhongHopLeHoacDaBiXoa")}</p>
          <Button variant="outline-primary" onClick={fetchArticleForPane} className="mt-3">{t("article.thuLai")}</Button>
          <p className="text-muted-custom mt-3">
            <small>{t("article.neuBanVanGapLoiHayKiemTraIdCua")}</small>
          </p>
        </div>;
    }
    return <div className="p-4">
        <ArticleDetailError errorMsg={error.message} onRetry={fetchArticleForPane} />
      </div>;
  }
  if (!article) {
    return <div className="p-4">
        <ArticleDetailEmpty articleId={articleId} />
      </div>;
  }
  return <div className="detail-pane-content px-4 py-4">
      <div className={`article-detail-journal-title mb-2 ${article.journal_id ? 'is-clickable' : ''}`} onClick={() => article.journal_id && navigate(`/journals/${article.journal_id}`)}>
        {article.journal_name || 'Scientific Journal'}
      </div>

      <h1 className="article-detail-title is-clickable" onClick={() => onTitleClick(article.article_id)} title={t("article.xemChiTietBaiBao")}>
        <LatexText text={article.title} />
      </h1>

      <div className="article-detail-authors mb-3">
        {visibleAuthors.length > 0 ? visibleAuthors.map((author, index) => {
        const authorLabel = author.display_name || author.name || author.author_name || t("typeAuthor");
        const authorId = author.author_id || author.id;
        return <span key={authorId || `${authorLabel}-${index}`} className={`article-detail-author-span ${authorId ? 'is-link' : ''}`} onClick={() => authorId && navigate(`/authors/${authorId}`)}>
                {authorLabel}{index < visibleAuthors.length - 1 ? ', ' : ''}
              </span>;
      }) : <span className="text-muted-custom">—</span>}
        {hiddenAuthorCount > 0 && !showAllAuthors && <Button variant="link" size="sm" onClick={() => setShowAllAuthors(true)} className="article-detail-author-toggle p-0 ms-1 h-auto text-xs">
            +{hiddenAuthorCount} authors
          </Button>}
        {showAllAuthors && (article?.authors?.length || 0) > 3 && <Button variant="link" size="sm" onClick={() => setShowAllAuthors(false)} className="article-detail-author-toggle p-0 ms-1 h-auto text-xs">
            Show less
          </Button>}
      </div>

      <div className="article-detail-meta-list mb-3">
        <span className="meta-item">
          <Icon icon="lucide:calendar" width="14" />
          <strong>{t("article.namXuatBan", "Year")}:</strong> {article.publication_year || '—'}
        </span>
        <span className="meta-item">
          <Icon icon="lucide:building" width="14" />
          <strong>{t("article.publisher", "Publisher")}:</strong> {article.publisher_name || '—'}
        </span>
        <span className="meta-item">
          <Icon icon="lucide:globe" width="14" />
          <strong>{t("article.viTriVenue", "Location")}:</strong> {article.journal_name || '—'}
        </span>
        {article.volume_number && <span className="meta-item">
            <Icon icon="lucide:book" width="14" />
            <strong>{t("article.volumeIssue")}:</strong> {t("article.vol")} {article.volume_number}{article.issue_number ? `, ${t("article.issue")} ${article.issue_number}` : ''}
          </span>}
      </div>

      <div className="article-detail-actions-connected mb-4">
        <div className="citations-chip" onClick={() => setShowCitationsModal(true)}>
          <Icon icon="lucide:quote" width="13" />
          <span>{article.citations ?? 0} {t("article.citations")}</span>
        </div>
        <Dropdown className="d-inline-block">
          <Dropdown.Toggle as="button" className="action-btn-connected custom-dropdown-toggle">
            <Icon icon="lucide:download" width="14" />
            <span style={{ marginLeft: '4px' }}>{t("article.download")}</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => downloadArticleCsv(article)}>
              <Icon icon="lucide:file-spreadsheet" width="14" className="me-2" />
              {t("article.exportCsv")}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => downloadArticlePdf(article, { withWatermark: false })}>
              <Icon icon="lucide:file-text" width="14" className="me-2" />
              {t("article.exportPdf")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <button onClick={handleShareArticle} className="action-btn-connected">
          <Icon icon="lucide:share-2" width="14" />
          <span>{t("article.share")}</span>
        </button>
      </div>

      <div className="article-detail-open-in mb-4">
        <span className="open-in-label text-muted-custom">{t("article.openIn")}</span>
        <div className="open-in-links-container">
          {articleDoiUrl && <a href={articleDoiUrl} target="_blank" rel="noreferrer" className="open-in-btn">
              <Icon icon="simple-icons:doi" width="14" />
              <span>DOI</span>
            </a>}
          <a href={article.source_url || `https://www.semanticscholar.org/search?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noreferrer" className="open-in-btn">
            <Icon icon="simple-icons:semanticscholar" width="12" />
            <span>Semantic Scholar</span>
          </a>
          <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noreferrer" className="open-in-btn">
            <Icon icon="simple-icons:googlescholar" width="12" />
            <span>Google</span>
          </a>
        </div>
      </div>

      <div className="detail-pane-divider mb-4" />

      <section className="article-section-connected">
        <h3 className="section-title-connected mb-2 font-display text-base font-semibold">{t("article.abstract")}</h3>
        {(article.abstract || 'No abstract is available for this article.').split('\n').filter(Boolean).map((paragraph, index) => (
           <LatexText key={index} text={paragraph} as="p" className="abstract-text-connected font-display text-sm leading-relaxed" />
        ))}
      </section>

      {(article.keywords || []).length > 0 && <section className="article-section-connected mt-4">
          <h3 className="section-title-connected mb-2 font-display text-base font-semibold">{t("article.keywords")}</h3>
          <div className="d-flex gap-1.5 flex-wrap">
            {article.keywords.map(keyword => {
          const label = keyword.display_name || keyword.name || keyword.keyword;
          return <span key={keyword.keyword_id || label} onClick={() => navigate(`/keywords/${keyword.keyword_id || ''}`)} className="geography-topic-badge text-xs" style={{
            cursor: 'pointer'
          }}>
                  {label}
                </span>;
        })}
          </div>
        </section>}

      <section className="article-connected-references mt-4">
        <h3 className="section-title-connected mb-2 font-display text-base font-semibold">{t("article.references")} ({references.length})</h3>
        {references.length > 0 ? <div className="d-flex flex-column gap-2">
            {paginatedReferences.map((referenceUrl, index) => {
          const absoluteIndex = (referencePage - 1) * referencesPerPage + index;
          return <a key={`${referenceUrl}-${absoluteIndex}`} href={referenceUrl} target="_blank" rel="noreferrer" className="reference-link-item p-2 rounded">
                  <div className="reference-item-index text-xs text-muted-custom">{t("article.referenceLabel")} {absoluteIndex + 1}</div>
                  <div className="reference-item-label text-sm text-truncate text-main font-display">{formatReferenceLabel(referenceUrl, absoluteIndex)}</div>
                </a>;
        })}
            {references.length > referencesPerPage && <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                <span className="text-xs text-muted-custom">{t("article.page")} {referencePage}/{referenceTotalPages}</span>
                <div className="d-flex gap-1">
                  <button disabled={referencePage <= 1} onClick={() => setReferencePage(page => Math.max(1, page - 1))} className="btn btn-xs btn-outline-secondary py-0 px-2 font-display text-xs">{t("article.truoc")}</button>
                  <button disabled={referencePage >= referenceTotalPages} onClick={() => setReferencePage(page => Math.min(referenceTotalPages, page + 1))} className="btn btn-xs btn-outline-secondary py-0 px-2 font-display text-xs">{t("article.next")}</button>
                </div>
              </div>}
          </div> : <span className="text-xs text-muted-custom font-display">{t("article.khongCoTaiLieuThamKhaoChiTiet")}</span>}
      </section>
      
      <Modal show={showCitationsModal} onHide={() => setShowCitationsModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="font-display font-semibold text-base">{t("article.citationsCitedBy")}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="article-modal-stat-box p-3 rounded-lg border border-border bg-surface-muted mb-3">
            <div className="text-muted-custom text-xs font-semibold text-uppercase mb-1">{t("article.tongLuotTrichDan")}</div>
            <div className="font-display font-bold text-base text-text-main">{(article?.citations ?? 0).toLocaleString('en-US')}</div>
          </div>
          <p className="text-muted-custom text-sm mb-3 leading-relaxed"><strong className="text-text-main">Citations</strong>{t("article.laSoLuongBaiBaoHoacCongTrinhKh")}</p>
          <div className="grid gap-2 text-sm">
            <div><strong>DOI:</strong>{t("article.maDinhDanhCoDinhCuaBaiBao")}</div>
            <div><strong>References:</strong>{t("article.danhSachTaiLieuMaBaiBaoNayTric")}</div>
            <div><strong>Citations / Cited by:</strong>{t("article.soCongTrinhKhacTrichDanLaiBaiB")}</div>
          </div>
        </Modal.Body>
        <Modal.Footer><Button variant="outline" size="sm" onClick={() => setShowCitationsModal(false)}>{t("article.dong")}</Button></Modal.Footer>
      </Modal>

      <AuthRequiredModal show={showLoginModal} onHide={() => setShowLoginModal(false)} />
    </div>;
};

// ======================================================================
// Main Page Component
// ======================================================================
export default function ArticleVisualDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originArticle, setOriginArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(id);
  const [apiGraphData, setApiGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);

  useEffect(() => {
    setSelectedArticleId(id);
  }, [id]);

  const fetchRecommendedArticles = useCallback(async (parsedArticle) => {
    try {
      setIsRecommendedLoading(true);
      const params = {
        limit: 15,
        page: 1,
      };
      const journalId = Number(parsedArticle.journal_id);
      const topicId = Number(parsedArticle.primary_topic || parsedArticle.topic_id);
      if (Number.isFinite(journalId)) params.journal_id = journalId;
      if (Number.isFinite(topicId)) params.topic_id = topicId;
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || payload.data || [];
      const normalizedItems = rawItems
        .map(normalizeRecommendedArticle)
        .filter((item) => String(item.article_id) !== String(parsedArticle.article_id))
        .slice(0, 10);
      setRecommendedArticles(normalizedItems);
    } catch (err) {
      console.warn('Error fetching recommended articles:', err);
      setRecommendedArticles([]);
    } finally {
      setIsRecommendedLoading(false);
    }
  }, []);

  const fetchOriginArticleDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getArticleDetailApi(id);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        const parsedArticle = normalizeArticleDetail(apiData, id);
        setOriginArticle(parsedArticle);
        fetchRecommendedArticles(parsedArticle);
      } else {
        throw new Error(t("article.khongTheTaiChiTietBaiBaoKhoaHo", "Unable to load article details"));
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      setError(err.response?.data?.message || err.message || t("article.loiKhiTaiDuLieuBaiBaoKhoaHoc", "Error loading article data"));
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchRecommendedArticles]);

  useEffect(() => {
    fetchOriginArticleDetail();
  }, [fetchOriginArticleDetail]);

  // Try fetching enhanced graph data from backend if available
  useEffect(() => {
    if (!originArticle?.title) return;
    let cancelled = false;
    setGraphLoading(true);

    searchArticlesGraph({ keyword: originArticle.title, limit: 30 })
      .then((res) => {
        if (!cancelled && res?.nodes && res.nodes.length > 0) {
          setApiGraphData(res);
        }
      })
      .catch((err) => {
        console.warn('Backend graph search not available, falling back to local citation network:', err);
      })
      .finally(() => {
        if (!cancelled) setGraphLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [originArticle?.title]);

  // Construct local graph network from origin paper + recommended papers
  const localGraphData = useMemo(() => {
    if (!originArticle) return { nodes: [], relationships: [] };

    const originId = String(originArticle.article_id || originArticle.id || id);
    const originAuthorName =
      Array.isArray(originArticle.authors) && originArticle.authors.length > 0
        ? (originArticle.authors[0]?.display_name || originArticle.authors[0]?.name || 'Author')
        : (typeof originArticle.authors === 'string' ? originArticle.authors.split(',')[0] : 'Author');

    const nodes = [
      {
        id: originId,
        labels: ['Article', 'Origin'],
        properties: {
          id: originId,
          title: originArticle.title || 'Target Article',
          doi: originArticle.doi || '',
          publication_year: originArticle.publication_year || new Date().getFullYear(),
          display_label: `${originAuthorName} (${originArticle.publication_year || 'Recent'})`,
          is_origin: true,
        },
      },
    ];

    const relationships = [];

    if (Array.isArray(recommendedArticles) && recommendedArticles.length > 0) {
      recommendedArticles.forEach((rec, idx) => {
        const recId = String(rec.article_id || rec.id || `rec-${idx}`);
        const recAuthorName = rec.authors
          ? (typeof rec.authors === 'string' ? rec.authors.split(',')[0] : 'Author')
          : 'Author';

        nodes.push({
          id: recId,
          labels: ['Article'],
          properties: {
            id: recId,
            title: rec.title || 'Related Article',
            doi: rec.doi || '',
            publication_year: rec.publication_year || originArticle.publication_year || '—',
            display_label: `${recAuthorName} (${rec.publication_year || '—'})`,
          },
        });

        relationships.push({
          id: `rel-${originId}-${recId}`,
          start: originId,
          end: recId,
          type: 'REFERENCES',
        });
      });
    }

    return { nodes, relationships };
  }, [originArticle, recommendedArticles, id]);

  const activeGraphData = useMemo(() => {
    if (apiGraphData?.nodes?.length > 0) {
      return apiGraphData;
    }
    return localGraphData;
  }, [apiGraphData, localGraphData]);

  const handleTitleClick = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <ArticleDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ArticleDetailError errorMsg={error} onRetry={fetchOriginArticleDetail} />
      </div>
    );
  }

  if (!originArticle) {
    return (
      <div className="p-6">
        <ArticleDetailEmpty articleId={id} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border bg-surface shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/articles/${id}`)}
            className="gap-1.5 text-xs h-8 shrink-0 rounded-control border-border hover:bg-surface-muted"
          >
            <Icon icon="lucide:arrow-left" width={14} />
            <span>{t("article.quayLaiBaiBao", "Back to Article")}</span>
          </Button>

          <div className="h-4 w-px bg-border shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="size-6 rounded-control bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Icon icon="lucide:network" width={14} />
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-foreground truncate max-w-sm sm:max-w-md lg:max-w-xl m-0">
              {originArticle.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden md:inline font-mono">
            {activeGraphData.nodes.length} nodes · {activeGraphData.relationships.length} links
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Interactive Graph
          </span>
        </div>
      </div>

      {/* 2. Main 3-Column Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Column (Col 3): Target & Related Papers */}
        <aside className="lg:col-span-3 bg-surface flex flex-col min-h-0 overflow-hidden">
          <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-surface-muted/40 border-b border-border flex items-center gap-1.5 shrink-0">
            <Icon icon="lucide:target" width={13} className="text-primary" />
            <span>Target Article</span>
          </div>

          <div
            onClick={() => setSelectedArticleId(originArticle.article_id)}
            className={`p-3 border-b border-border transition-colors cursor-pointer shrink-0 ${
              String(selectedArticleId) === String(originArticle.article_id)
                ? 'bg-primary-subtle/25 border-l-4 border-l-primary'
                : 'hover:bg-surface-muted/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                Active Node
              </span>
              <span className="font-mono text-muted-foreground text-xs font-semibold">
                {originArticle.publication_year || '—'}
              </span>
            </div>
            <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-snug m-0">
              <LatexText text={originArticle.title} />
            </h3>
            <div className="text-[11px] text-muted-foreground mt-1 truncate">
              {formatAuthorsLine(originArticle.authors, 2)}
            </div>
          </div>

          <div className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-surface-muted/40 border-b border-border flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:files" width={13} className="text-muted-foreground" />
              <span>Connected Papers</span>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              ({recommendedArticles.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60 min-h-0">
            {isRecommendedLoading ? (
              <div className="p-5 text-center text-xs text-muted-foreground">
                <span className="inline-block animate-spin mr-1.5">⏳</span>
                Loading connected publications...
              </div>
            ) : recommendedArticles.length === 0 ? (
              <div className="p-5 text-center text-xs text-muted-foreground">
                No related articles found.
              </div>
            ) : (
              recommendedArticles.map((rec) => {
                const isSelected = String(selectedArticleId) === String(rec.article_id);
                return (
                  <div
                    key={rec.article_id}
                    onClick={() => setSelectedArticleId(rec.article_id)}
                    className={`p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary-subtle/25 border-l-4 border-l-primary font-medium'
                        : 'hover:bg-surface-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-muted-foreground text-[11px] font-semibold">
                        {rec.publication_year}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug m-0">
                      <LatexText text={rec.title} />
                    </h4>
                    <div className="text-[11px] text-muted-foreground mt-1 truncate">
                      {rec.authors}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Center Column (Col 5): Canvas Graph */}
        <section className="lg:col-span-5 bg-surface flex flex-col min-h-0 relative">
          <div className="px-3.5 py-2 text-xs font-semibold text-foreground bg-surface border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:network" width={14} className="text-primary" />
              <span>Citation & Topic Network</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal">
              Scroll to zoom · Drag to pan · Click node
            </span>
          </div>

          <div className="flex-1 w-full h-full relative min-h-[360px] overflow-hidden bg-background">
            <ArticleGraphWidget
              data={activeGraphData}
              loading={isRecommendedLoading || graphLoading}
              onNodeClick={(node) => {
                const targetId = node?.properties?.id || node?.id;
                if (targetId) setSelectedArticleId(targetId);
              }}
            />
          </div>
        </section>

        {/* Right Column (Col 4): Selected Article Details */}
        <aside className="lg:col-span-4 bg-surface flex flex-col min-h-0 overflow-y-auto">
          {selectedArticleId ? (
            <ArticleDetailPane
              articleId={selectedArticleId}
              onTitleClick={handleTitleClick}
            />
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground m-auto">
              <Icon icon="lucide:mouse-pointer-click" width={28} className="mx-auto mb-2 text-muted-foreground/60" />
              <p className="font-medium text-foreground text-sm mb-1">No Paper Selected</p>
              <p className="m-0">Click any node on the graph or a paper in the list to view detailed metrics and abstract.</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
