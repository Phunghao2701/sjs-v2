import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ROUTES from '../../../app/routes/routePaths';
import projectService from '../services/projectService';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi } from '../../catalog/api/catalogApi';
import keywordApi from '../../keywords/api/keywordApi';
import keywordService from '../../keyword/services/keywordService';
import SearchableKeywordInput from '../../../shared/components/Input/SearchableKeywordInput';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Alert } from '../../../shared/ui/alert';
import { Skeleton } from '../../../shared/ui/skeleton';
const EditProjectPage = () => {
  const { t: _t } = useTranslation();
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [title, setTitle] = useState('');
  const [subjectAreaId, setSubjectAreaId] = useState('');
  const [keywords, setKeywords] = useState([]);

  // API Data State
  const [areas, setAreas] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [areasRes, projectRes] = await Promise.all([getSubjectAreasApi(), projectService.getProjectById(id)]);
        if (areasRes?.data) setAreas(areasRes.data?.data?.items || areasRes.data?.data || areasRes.data || []);

        // Pre-fill
        if (projectRes && projectRes.data) {
          const p = projectRes.data;
          setTitle(p.title || '');
          setSubjectAreaId(p.subject_area?.subject_area_id || p.subject_area || '');
          if (p.watched_keywords && Array.isArray(p.watched_keywords) && p.watched_keywords.length > 0) {
            setKeywords(p.watched_keywords);
          } else {
            try {
              const trendingList = await keywordService.getTrendingKeywords(id, 100);
              if (trendingList && trendingList.length > 0) {
                setKeywords(trendingList.map(t => t.keyword || t.display_name));
              } else if (p.project_keywords) {
                setKeywords(p.project_keywords.map(pk => pk.keyword_text || pk.keyword || pk));
              }
            } catch (e) {
              console.error('Error fetching trending keywords:', e);
            }
          }
        }
      } catch (err) {
        console.error(t("project.loiTaiDuLieuDuAn"), err);
        setError(t("project.khongTheTaiDuLieuDuAnVuiLongTa"));
      } finally {
        setLoadingData(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);
  useEffect(() => {
    if (!subjectAreaId) {
      setSuggestedKeywords([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const queryParams = { limit: 10, subject_area_id: subjectAreaId };
        const res = await keywordApi.getKeywords(queryParams);
        const items = res?.data?.data?.items || res?.data?.data || res?.data || [];
        setSuggestedKeywords(Array.isArray(items) ? items.map(k => k.display_name || k.name).filter(Boolean) : []);
      } catch (err) {
        console.error(t("project.loiTaiGoiYTuKhoa"), err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [subjectAreaId]);
  const selectedAreaObj = areas.find(a => String(a.id || a.subject_area_id) === String(subjectAreaId));
  const selectedAreaName = selectedAreaObj ? selectedAreaObj.display_name || selectedAreaObj.name || selectedAreaObj.area_name : '';
  const removeKeyword = kw => {
    setKeywords(keywords.filter(k => k !== kw));
  };
  const addSuggestedKeyword = kw => {
    if (!keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
  };

  // Handle Area Change
  const handleAreaChange = e => {
    setSubjectAreaId(e.target.value);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !subjectAreaId) {
      setError(t("project.vuiLongNhapTenDuAnVaChonLinhVu"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Cập nhật thông tin dự án (không kèm keywords vì BE đã revert)
      const res = await projectService.updateProject(id, {
        title: title.trim(),
        subject_area_id: parseInt(subjectAreaId, 10),
        subject_category_ids: [],
        journal_ids: []
      });

      // 2. Đồng bộ keywords từ Frontend
      if (res && res.success !== false) {
        await keywordService.syncProjectKeywordsFEOnly(id, keywords);
        queryClient.invalidateQueries(['project', id, 'overview']);
        navigate(`/projects/${id}`);
      } else {
        setError(res?.message || t("project.capNhatDuAnThatBai"));
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || err.message || t("project.daCoLoiXayRaKhiCapNhatDuAn"));
    } finally {
      setLoading(false);
    }
  };
  if (loadingData) {
    return (
      <PageContainer className="max-w-[760px] py-6 sm:py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[760px] py-6 sm:py-10 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("author.tongQuan"), to: ROUTES.DASHBOARD },
          { label: t("project.duAnTheoDoi"), to: ROUTES.PROJECTS },
          { label: title || t("landing.duAn"), to: `/projects/${id}` },
          { label: t("project.quanLyTuKhoa") }
        ]}
        title={t("project.quanLyTuKhoaTheoDoi")}
        description={t("project.themHoacXoaCacCumTuKhoaNghienC")}
      />

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="items-center">
              <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
              <div className="flex-1 text-xs">{error}</div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("project.tuKhoaDangTheoDoi")}
              </label>
              <SearchableKeywordInput
                keywords={keywords}
                subjectAreaId={subjectAreaId}
                placeholder={t("project.chonTuKhoaTheoDoi")}
                disabled={loading}
                onAddKeyword={val => {
                  if (val && !keywords.includes(val)) {
                    setKeywords([...keywords, val]);
                  }
                }}
                onRemoveKeyword={removeKeyword}
              />

              {subjectAreaId && suggestedKeywords.length > 0 && (
                <div className="pt-2 text-xs">
                  <span className="text-muted-foreground font-medium">{t("project.goiYTuKhoaNoiBat")}:</span>
                  {loadingSuggestions ? (
                    <span className="text-muted-foreground ms-2">{t("common.dangTai")}</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedKeywords.filter(k => !keywords.includes(k)).map(sugg => (
                        <Badge
                          key={sugg}
                          variant="secondary"
                          className="cursor-pointer hover:border-primary transition-colors py-1 px-2.5"
                          onClick={() => addSuggestedKeyword(sugg)}
                        >
                          + {sugg}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                {t("auth.quayLai")}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                loadingText={t("project.dangLuu")}
                className="flex items-center gap-1.5"
              >
                <Icon icon="lucide:save" width="16" />
                <span>{t("admin.luuThayDoi")}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
export default EditProjectPage;
