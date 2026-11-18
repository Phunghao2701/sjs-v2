import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\pages\ArticleDetailPage.jsx
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../../../shared/ui/modal';
import { Icon } from '@iconify/react';
import { Button } from '../../../shared/ui/button';
import { PageContainer } from '../../../shared/ui/page-layout';
import { Breadcrumbs } from '../../../shared/ui/breadcrumb';

// Layout
import Header from '../../landing/components/Header';

// Auth
import useAuth from '../../auth/hooks/useAuth';

// API
import { getArticleDetailApi, bookmarkArticleApi, getArticlesListApi } from '../api/articleApi';

// Subcomponents
import ArticleDetailSkeleton from '../components/ArticleDetailSkeleton';
import ArticleDetailEmpty from '../components/ArticleDetailEmpty';
import ArticleDetailError from '../components/ArticleDetailError';
import ArticlesTabContent from '../../journal/components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { toast } from '../../../shared/utils/toast';
import { getDoiUrl, normalizeArticleDetail } from '../utils/articleFormatters';
import LatexText from '../../../shared/components/LatexText/LatexText';
import '../Article.css';
const formatAuthorsLine = (authors = [], limit = 3) => {  if (!authors || authors.length === 0) return t("article.dangCapNhatTacGia");
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
const topicKeywordChipStyle = {
  border: '1px solid var(--border)',
  color: 'var(--text-main)',
  backgroundColor: 'var(--bg-main)',
  borderRadius: '999px'
};
const formatReferenceLabel = (referenceUrl = '', index = 0) => {
  const rawValue = String(referenceUrl || '').trim();
  if (!rawValue) return `Reference ${index + 1}`;
  const workId = rawValue.split('/').filter(Boolean).pop();
  return workId ? `OpenAlex ${workId}` : `Reference ${index + 1}`;
};
const smoothScrollTo = targetId => {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};
export default function ArticleDetailPage() {
  const { t: _t } = useTranslation();
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [showCitationsModal, setShowCitationsModal] = useState(false);
  const [referencePage, setReferencePage] = useState(1);
  const referencesPerPage = 2;
  const visibleAuthors = useMemo(() => {
    const authors = article?.authors || [];
    if (showAllAuthors) return authors;
    return authors.slice(0, 3);
  }, [article?.authors, showAllAuthors]);
  const hiddenAuthorCount = Math.max((article?.authors?.length || 0) - 3, 0);
  const references = article?.references || [];
  const referenceTotalPages = Math.max(1, Math.ceil(references.length / referencesPerPage));
  const paginatedReferences = references.slice((referencePage - 1) * referencesPerPage, referencePage * referencesPerPage);
  const keywordsText = useMemo(() => {    const keywords = article?.keywords || [];
    if (!keywords.length) return t("article.dangCapNhatTuKhoa");
    return keywords.map(keyword => keyword.display_name || keyword.name || keyword.keyword).filter(Boolean).join('; ');
  }, [article?.keywords]);
  const fetchRecommendedArticles = useCallback(async parsedArticle => {
    try {
      setIsRecommendedLoading(true);
      const params = {
        limit: 4,
        page: 1
      };
      const journalId = Number(parsedArticle.journal_id);
      const topicId = Number(parsedArticle.primary_topic || parsedArticle.topic_id);
      if (Number.isFinite(journalId)) params.journal_id = journalId;
      if (Number.isFinite(topicId)) params.topic_id = topicId;
      const response = await getArticlesListApi(params);
      const payload = response.data?.data || response.data || {};
      const rawItems = payload.items || payload.articles || payload.data || [];
      const normalizedItems = rawItems.map(normalizeRecommendedArticle).filter(item => String(item.article_id) !== String(parsedArticle.article_id)).slice(0, 3);
      setRecommendedArticles(normalizedItems);
    } catch (err) {
      console.warn('Error fetching recommended articles:', err);
      setRecommendedArticles([]);
    } finally {
      setIsRecommendedLoading(false);
    }
  }, []);
  const fetchArticleDetail = useCallback(async () => {    setIsLoading(true);
    setError(null);
    try {
      const response = await getArticleDetailApi(id);
      if (response.data && response.data.success !== false) {
        const apiData = response.data.data || {};
        const parsedArticle = normalizeArticleDetail(apiData, id);
        setArticle(parsedArticle);
        fetchRecommendedArticles(parsedArticle);
        const localBookmarkKey = `bookmark_${currentUser?.username || 'guest'}_${id}`;
        const isLocallyBookmarked = localStorage.getItem(localBookmarkKey) === 'true';
        setIsBookmarked(apiData.is_bookmarked || isLocallyBookmarked);
      } else {
        throw new Error(t("article.khongTheTaiChiTietBaiBaoKhoaHo"));
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      setError(err.response?.data?.message || err.message || t("article.loiKhiTaiDuLieuBaiBaoKhoaHoc"));
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser, fetchRecommendedArticles]);
  useEffect(() => {
    fetchArticleDetail();
  }, [fetchArticleDetail]);
  const handleBookmarkToggle = async () => {    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setIsBookmarkLoading(true);
    const localBookmarkKey = `bookmark_${currentUser.username}_${id}`;
    const nextState = !isBookmarked;
    try {
      await bookmarkArticleApi(id);
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
  const handleDoiClick = () => {
    if (!articleDoiUrl) return;
    window.open(articleDoiUrl, '_blank', 'noopener,noreferrer');
  };
  const handleShareArticle = async () => {    const shareUrl = window.location.href;
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
  const handleKeywordClick = keyword => {
    const keywordId = keyword.keyword_id || keyword.id;
    if (keywordId) {
      navigate(`/keywords/${keywordId}/articles`);
      return;
    }
    const label = keyword.display_name || keyword.name || keyword.keyword;
    if (label) {
      navigate(`/articles?search=${encodeURIComponent(label)}`);
    }
  };
  const handleTopicClick = topic => {
    const topicId = topic?.topic_id || topic?.id;
    if (topicId) {
      navigate(`/topics/${topicId}`);
      return;
    }
    const label = topic?.display_name || topic?.name || '';
    if (!label) return;
    navigate(`/articles?search=${encodeURIComponent(label)}`);
  };
  const handleOrganizationAccess = () => {    if (article?.is_open_access && article?.doi) {
      window.open(getDoiUrl(article.doi), '_blank', 'noopener,noreferrer');
      return;
    }
    toast.info(t("article.hienChuaCoCongTruyCapToChucRie"));
  };
  const articleDoiUrl = getDoiUrl(article?.doi);
  return <div className="article-detail-page grid-bg">
      <Header />

      <PageContainer className="position-relative z-1">
        {isLoading ? <ArticleDetailSkeleton /> : error ? <ArticleDetailError errorMsg={error} onRetry={fetchArticleDetail} /> : !article ? <ArticleDetailEmpty articleId={id} /> : <main className="article-detail-container">
            <div className="article-detail-shell">
              <aside className="article-detail-sidebar d-none d-xl-block">
                <h2 className={`article-detail-journal-title mb-4 ${article.journal_id ? 'is-clickable' : ''}`} role={article.journal_id ? 'button' : undefined} onClick={() => article.journal_id && navigate(`/journals/${article.journal_id}`)}>
                  {article.journal_name || 'Scientific Journal'}
                </h2>

                <div className="article-detail-meta-list">
                  <span><strong>Date:</strong> {article.publication_year || t("article.dangCapNhat")}</span>
                  <span><strong>Article:</strong> {article.article_id}</span>
                  <span>
                    <strong>Volume:</strong>{' '}
                    <Button variant="link" size="sm" disabled={!article.volume_id} onClick={() => article.volume_id && navigate(`/articles?volume_id=${article.volume_id}`)} className="article-detail-meta-link h-auto p-0 text-sm">
                      {article.volume_number || '—'}
                    </Button>
                  </span>
                  <span>
                    <strong>Issue:</strong>{' '}
                    <Button variant="link" size="sm" disabled={!article.issue_id} onClick={() => article.issue_id && navigate(`/articles?issue_id=${article.issue_id}`)} className="article-detail-meta-link h-auto p-0 text-sm">
                      {article.issue_number || '—'}
                    </Button>
                  </span>
                  <span><strong>Access:</strong> {article.is_open_access ? 'Open access' : 'Restricted'}</span>
                </div>

                <div className="article-detail-divider" />

                <div className="text-muted-custom text-xs fw-bold text-uppercase mb-2">{t("article.publisher")}</div>
                <div className="text-xs text-muted-custom fw-semibold text-uppercase d-flex flex-column gap-1">
                  <span>{article.publisher_name || t("article.dangCapNhat")}</span>
                  <span>Coverage: {article.publication_year || '—'}</span>
                </div>
              </aside>

              <section className="article-detail-main">
                <h1 className="article-detail-title text-base font-semibold leading-snug">
                  <LatexText text={article.title} />
                </h1>

                <div className="article-detail-authors">
                  {visibleAuthors.length > 0 ? visibleAuthors.map((author, index) => {                const authorLabel = author.display_name || author.name || author.author_name || t("typeAuthor");
                const authorId = author.author_id || author.id;
                return <Button key={authorId || `${authorLabel}-${index}`} variant="link" size="sm" disabled={!authorId} onClick={() => authorId && navigate(`/authors/${authorId}`)} className="article-detail-author-link h-auto p-0 text-sm" title={authorId ? `Xem chi tiết ${authorLabel}` : authorLabel}>
                          {authorLabel}{index < visibleAuthors.length - 1 ? ',' : ''}
                        </Button>;
              }) : <span>{t("article.dangCapNhatTacGia")}</span>}
                  {hiddenAuthorCount > 0 && !showAllAuthors && <Button variant="link" size="sm" onClick={() => setShowAllAuthors(true)} className="article-detail-author-toggle h-auto p-0 text-sm">
                      Show more +{hiddenAuthorCount}
                    </Button>}
                  {showAllAuthors && (article?.authors?.length || 0) > 3 && <Button variant="link" size="sm" onClick={() => setShowAllAuthors(false)} className="article-detail-author-toggle h-auto p-0 text-sm">
                      Show less
                    </Button>}
                </div>


                <div className="article-detail-action-bar">
                  <div className="article-detail-actions flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCitationsModal(true)} className="gap-1.5 text-sm">
                      <Icon icon="lucide:quote" width="14" />
                      {t("article.citations")}: {article.semantic_citation_count ?? article.citations ?? 0}
                    </Button>
                    <Button variant={isBookmarked ? "default" : "outline"} size="sm" disabled={isBookmarkLoading} onClick={handleBookmarkToggle} className="gap-1.5 text-sm">
                      <Icon icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark-plus'} width="14" />
                      Add to Project
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareArticle} className="gap-1.5 text-sm">
                      <Icon icon="lucide:share-2" width="14" />
                      {t("article.share")}
                    </Button>
                  </div>
                </div>

                <div className="article-detail-external-bar">
                  {articleDoiUrl && <a href={articleDoiUrl} target="_blank" rel="noreferrer" className="article-detail-doi-link">
                      {articleDoiUrl}
                      <Icon icon="lucide:external-link" width="14" />
                    </a>}
                  <span className="article-detail-access-badge">
                    <span className={`article-detail-access-dot ${article.is_open_access ? 'is-open' : ''}`} />
                    {article.is_open_access ? 'Open access' : 'Restricted access'}
                  </span>
                </div>

                <div className="article-detail-tabs flex flex-wrap gap-1 border-b border-border pb-2 mb-4">
                  <Button variant={activeTab === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('preview')} className="text-sm">
                    Article Preview
                  </Button>
                  <Button variant={activeTab === 'keywords_topics' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('keywords_topics')} className="text-sm">
                    Keywords & Topics
                  </Button>
                  <Button variant={activeTab === 'references' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('references')} className="text-sm">
                    References ({(article.references || []).length})
                  </Button>
                  <Button variant={activeTab === 'recommended' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('recommended')} className="text-sm">
                    Recommended Articles
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/articles/${id}/visual`)} className="text-sm text-primary font-semibold">
                    <Icon icon="lucide:network" width="14" className="me-1" />
                    Interactive Graph
                  </Button>
                </div>

                {activeTab === 'preview' ? <div className="article-preview-grid">
                    <article>
                      {/* TL;DR section */}
                      {article.semantic_tldr && <section id="tldr" className="article-section">
                          <h2 className="article-section-title text-base font-semibold">TL;DR</h2>
                          <div className="p-3 rounded border border-border bg-primary/10 text-text-main text-sm leading-relaxed">
                            <strong>Summary:</strong> {article.semantic_tldr}
                          </div>
                        </section>}

                      <section id="abstract" className="article-section">
                        <h2 className="article-section-title text-base font-semibold">{t("article.abstract")}</h2>
                        {(article.abstract || 'No abstract is available for this article.').split('\n').filter(Boolean).map((paragraph, index) => (
                             <LatexText key={index} text={paragraph} as="p" className="article-section-text text-sm leading-relaxed" />
                        ))}
                      </section>


                      <section id="section-snippets" className="article-section">
                        <h2 className="article-section-title text-base font-semibold">Section snippets</h2>
                        <p className="article-section-text text-sm leading-relaxed">{t("article.tomTatNhanhBaiBaoThuocChuDe")} <strong>{article.topic_name || 'Research'}</strong>{t("article.congBoTrong")} <strong>{article.journal_name || 'Scientific Journal'}</strong>
                          {article.publication_year ? ` năm ${article.publication_year}` : ''}.
                        </p>
                      </section>
                    </article>

                    <aside className="article-toc-aside d-none d-lg-block">
                      <div className="article-toc-title text-sm font-semibold mb-2">Article preview</div>
                      <nav className="d-flex flex-column gap-1">
                        {article.semantic_tldr && <Button variant="ghost" size="sm" onClick={() => smoothScrollTo('tldr')} className="justify-start text-xs text-text-muted hover:text-text-main h-auto py-1">TL;DR</Button>}
                        <Button variant="ghost" size="sm" onClick={() => smoothScrollTo('abstract')} className="justify-start text-xs text-text-muted hover:text-text-main h-auto py-1">Abstract</Button>
                        <Button variant="ghost" size="sm" onClick={() => smoothScrollTo('section-snippets')} className="justify-start text-xs text-text-muted hover:text-text-main h-auto py-1">Section snippets</Button>
                      </nav>
                    </aside>
                  </div> : activeTab === 'keywords_topics' ? <div className="keywords-topics-tab-panel">
                    <section className="mb-5">
                      <h2 className="article-section-title text-base font-semibold mb-4">{t("article.keywords")}</h2>
                      {(article.keywords || []).length > 0 ? <div className="row g-4">
                          {article.keywords.map((keyword, index) => {                    const label = keyword.display_name || keyword.name || keyword.keyword;
                    const keywordId = keyword.keyword_id || keyword.id;
                    return <div key={keywordId || `${label}-${index}`} className="col-12 col-md-6 col-lg-4">
                                <div className="keyword-card d-flex flex-column justify-content-between h-100">
                                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                    <div>
                                      <div className="keyword-card-label text-xs">Research keyword</div>
                                      <h3 className="keyword-card-title text-base font-semibold">{label}</h3>
                                    </div>
                                    <Icon icon="lucide:tags" width="18" className="keyword-card-icon" />
                                  </div>
                                  <Button id={`keyword-view-${keywordId || label}`} variant="outline" size="sm" onClick={() => handleKeywordClick(keyword)} className="keyword-card-action d-inline-flex align-items-center gap-2 mt-3 w-fit text-sm">
                                    <span>{t("article.xemBaiBaoLienQuan")}</span>
                                    <Icon icon="lucide:arrow-up-right" width="16" />
                                  </Button>
                                </div>
                              </div>;
                  })}
                        </div> : <div className="article-reference-card-empty text-center py-5">
                          <Icon icon="lucide:tags" width="48" className="text-muted mb-3" />
                          <p className="mb-0 text-sm">{keywordsText}</p>
                        </div>}
                    </section>

                    {article.topics?.length > 0 && <section className="mt-5">
                        <h2 className="article-section-title text-base font-semibold mb-3">Topics</h2>
                        <div className="d-flex gap-2 flex-wrap">
                          {article.topics.map(topic => <Button key={topic.topic_id || topic.display_name} variant="outline" size="sm" onClick={() => handleTopicClick(topic)} className="article-topic-chip rounded-full text-xs">
                              {topic.display_name}
                            </Button>)}
                        </div>
                      </section>}
                  </div> : activeTab === 'references' ? <div className="references-tab-panel">
                    <h2 className="article-section-title text-base font-semibold mb-4">{t("article.references")}</h2>
                    <p className="article-section-text text-sm leading-relaxed mb-4">{t("article.baiBaoHienCo")}{" "}<strong>{(article.references || []).length}</strong>{" "}{t("article.taiLieuThamKhaoDuocDongBoTrong")}{" "}<strong>{article.semantic_citation_count ?? article.citations ?? 0}</strong>.
                    </p>

                    {(article.references || []).length > 0 ? <div className="d-grid gap-3">
                        {(article.references || []).map((referenceUrl, index) => {                  return <a key={`${referenceUrl}-${index}`} href={referenceUrl} target="_blank" rel="noreferrer" className="article-reference-card">
                              <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                  <div className="article-reference-label text-xs">
                                    {t("article.referenceLabel")} {index + 1}
                                  </div>
                                  <div className="article-reference-title text-sm font-medium">
                                    {formatReferenceLabel(referenceUrl, index)}
                                  </div>
                                  <div className="article-reference-url text-xs">
                                    {referenceUrl}
                                  </div>
                                </div>
                                <span className="article-reference-action text-sm">
                                  <Icon icon="lucide:external-link" width="16" />{t("article.moNguon")}</span>
                              </div>
                            </a>;
                })}
                      </div> : <div className="article-reference-card-empty text-center py-5 text-sm">{t("article.chuaCoDanhSachReferenceChiTiet")}</div>}
                  </div> : <ArticlesTabContent recentArticles={recommendedArticles} loading={isRecommendedLoading} onArticleClick={articleId => navigate(`/articles/${articleId}/visual`)} />}
              </section>
            </div>

          </main>}
      </PageContainer>

      <Modal show={showCitationsModal} onHide={() => setShowCitationsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-display font-semibold text-base">{t("article.citationsCitedBy")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="article-modal-stat-box p-3 rounded-lg border border-border bg-surface-muted mb-3">
            <div className="text-muted-custom text-xs font-semibold text-uppercase mb-1">{t("article.tongLuotTrichDan")}</div>
            <div className="font-display font-bold text-base text-text-main">
              {(article?.citations ?? 0).toLocaleString('en-US')}
            </div>
          </div>

          <p className="text-muted-custom text-sm mb-3 leading-relaxed">
            <strong className="text-text-main">Citations</strong>{t("article.laSoLuongBaiBaoHoacCongTrinhKh")}</p>

          <div className="grid gap-2 text-sm">
            <div><strong>DOI:</strong>{t("article.maDinhDanhCoDinhCuaBaiBao")}</div>
            <div><strong>References:</strong>{t("article.danhSachTaiLieuMaBaiBaoNayTric")}</div>
            <div><strong>Citations / Cited by:</strong>{t("article.soCongTrinhKhacTrichDanLaiBaiB")}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" size="sm" onClick={() => setShowCitationsModal(false)}>{t("article.dong")}</Button>
        </Modal.Footer>
      </Modal>

      <AuthRequiredModal show={showLoginModal} onHide={() => setShowLoginModal(false)} />
    </div>;
}
