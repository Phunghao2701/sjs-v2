import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\topic\pages\TopicDetailPage.jsx
 */
import { useEffect, useMemo, useState } from 'react';
import { StateCard } from '../../../shared/components/Card';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import { getTopicByIdApi, getTopicArticlesApi } from '../api/topic.api';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Card, CardContent } from '../../../shared/ui/card';
import { Alert } from '../../../shared/ui/alert';
import { PageContainer } from '../../../shared/ui/page-layout';
import { Breadcrumbs } from '../../../shared/ui/breadcrumb';
import { Skeleton } from '../../../shared/ui/skeleton';
import LatexText from '../../../shared/components/LatexText/LatexText';
import './TopicDetailPage.css';
const PAGE_SIZE = 10;
const normalizeArticle = (item = {}) => ({
  id: item.article_id,
  title: item.title || 'Untitled article',
  year: item.publication_year,
  doi: item.doi,
  citations: item.citations_count ?? item.citations ?? 0
});
export default function TopicDetailPage() {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const {
    topicId
  } = useParams();
  const [topic, setTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const fetchTopicDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const [topicResponse, articlesResponse] = await Promise.all([getTopicByIdApi(topicId), getTopicArticlesApi(topicId, {
          page: 1,
          limit: PAGE_SIZE
        })]);
        const topicData = topicResponse?.data?.data;
        const articlePayload = articlesResponse?.data?.data;
        if (!active) return;
        setTopic(topicData || null);
        setArticles((articlePayload?.articles || []).map(normalizeArticle));
        setPagination({
          page: articlePayload?.pagination?.page || 1,
          limit: articlePayload?.pagination?.limit || PAGE_SIZE,
          total: articlePayload?.pagination?.total || 0
        });
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || t("topic.khongTheTaiThongTinTopic"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchTopicDetail();
    return () => {
      active = false;
    };
  }, [topicId]);
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)));
  }, [pagination]);
  const handlePageChange = async nextPage => {
    if (nextPage === pagination.page || nextPage < 1 || nextPage > totalPages) return;
    setLoading(true);
    setError('');
    try {
      const response = await getTopicArticlesApi(topicId, {
        page: nextPage,
        limit: pagination.limit || PAGE_SIZE
      });
      const payload = response?.data?.data;
      setArticles((payload?.articles || []).map(normalizeArticle));
      setPagination({
        page: payload?.pagination?.page || nextPage,
        limit: payload?.pagination?.limit || PAGE_SIZE,
        total: payload?.pagination?.total || 0
      });
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (err) {
      setError(err.response?.data?.message || t("topic.khongTheTaiDanhSachBaiBaoCuaTo"));
    } finally {
      setLoading(false);
    }
  };
  return <div className="topic-detail-page grid-bg">
      <Header />

      <PageContainer className="topic-detail-shell">
        <Card className="topic-detail-hero">
          <CardContent className="topic-detail-hero__body">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <h1 className="topic-detail-title text-base font-semibold">
                  {topic?.display_name || t("topic.dangTaiTopic")}
                </h1>

                <p className="topic-detail-description text-sm leading-relaxed">{t("topic.khamPhaCacBaiBaoThuocChuDeNayD")}</p>
              </div>

              <div className="lg:col-span-4">
                <div className="topic-detail-summary">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="topic-detail-summary__label text-xs">{t("topic.maTopic")}</div>
                    <Badge variant="outline" className="topic-detail-summary__badge text-xs">
                      #{topic?.topic_id || topicId}
                    </Badge>
                  </div>

                  <hr className="topic-detail-summary__divider" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="topic-detail-summary__label text-xs">{t("project.tongSoBaiBao")}</div>
                    <div className="topic-detail-summary__value text-base font-bold">
                      {(pagination.total || 0).toLocaleString('en-US')}
                    </div>
                  </div>

                  <Button id="topic-view-all-articles" onClick={() => navigate(`/articles?topic_id=${topicId}`)} className="topic-detail-action mt-2 w-100 justify-content-center text-sm gap-2">
                    {t("topic.moBoLocBaiBao")}<Icon icon="lucide:arrow-right" width="18" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="topic-detail-section-heading d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="topic-detail-section-title text-base font-semibold">{t("topic.baiBaoThuocTopic")}</h2>
            <p className="topic-detail-section-subtitle text-xs text-text-muted">
              {t("pagination.page", "Page")} {pagination.page} / {totalPages}
            </p>
          </div>
          <Badge variant="secondary" className="topic-detail-count-badge text-xs">
            {(pagination.total || 0).toLocaleString('en-US')}{t("author.baiBao")}</Badge>
        </div>

        {error && <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>}

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </Card>
            ))}
          </div>
        ) : <div className="d-grid gap-3">
            {articles.length === 0 ? <StateCard variant="neutral" icon="lucide:file-question" title={t("topic.khongCoDuLieu")} description={t("topic.chuaCoBaiBaoNaoChoTopicNay")} className="my-4" /> : articles.map(article => <Card key={article.id} className="topic-detail-article-card">
                  <CardContent className="p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                      <div className="flex-grow-1">
                        <button type="button" className="btn btn-link topic-detail-article-title mb-2 text-start text-sm font-semibold" onClick={() => navigate(`/articles/${article.id}/visual`)}>
                          <LatexText text={article.title} />
                        </button>

                        <div className="topic-detail-article-meta text-xs">
                          <span className="d-inline-flex align-items-center gap-1">
                            <Icon icon="lucide:calendar-range" width="15" />
                            {article.year || 'N/A'}
                          </span>
                          {article.doi && <a href={article.doi.startsWith('http') ? article.doi : `https://doi.org/${article.doi}`} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-1">
                              <Icon icon="lucide:link-2" width="15" />
                              DOI
                            </a>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
          </div>}

        {articles.length > 0 && totalPages > 1 && <AdminPagination totalItems={pagination.total} currentPage={pagination.page} limit={pagination.limit} onPageChange={handlePageChange} entityName="bài báo" />}
      </PageContainer>
    </div>;
}