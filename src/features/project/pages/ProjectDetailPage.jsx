import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import { useQueryClient } from '@tanstack/react-query';
import { useKeywordTracking } from '../../keyword/hooks/useKeywordTracking';
import { useProjectOverviewQuery } from '../hooks/useProjectOverviewQuery';
import { useProjectMembersQuery } from '../hooks/useProjectMembersQuery';
import KeywordWatchList from '../../keyword/components/KeywordWatchList';
import AddKeywordModal from '../../keyword/components/AddKeywordModal';
import ManageKeywordsModal from '../../keyword/components/ManageKeywordsModal';
import ProjectMembersList from '../components/ProjectMembersList';
import InviteMemberModal from '../components/InviteMemberModal';
import { Icon } from '@iconify/react';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Alert } from '../../../shared/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import projectService from '../../project/services/projectService';
import LatexText from '../../../shared/components/LatexText/LatexText';
import useAuth from '../../auth/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const ProjectDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const auth = useAuth();
  const currentUser = auth?.user;

  const {
    project,
    watchArticles,
    keywordArticles,
    watchedKeywords,
    watchArticlesPagination,
    keywordArticlesPagination,
    loading,
    error,
    actionLoading,
    addKeywordWatch,
    removeKeywordWatch,
    fetchWatchArticles,
    fetchKeywordArticles,
  } = useKeywordTracking(projectId);

  const [activeTab, setActiveTab] = useState(
    tabParam && ['overview', 'articles', 'keywords', 'members'].includes(tabParam)
      ? tabParam
      : 'overview'
  );

  useEffect(() => {
    if (tabParam && ['overview', 'articles', 'keywords', 'members'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, userId: null });

  const queryClient = useQueryClient();
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewErrorRaw,
    refetch: fetchProjectOverview,
  } = useProjectOverviewQuery(projectId);
  const overviewError = overviewErrorRaw ? t("project.khongTheTaiDuLieuTongQuanVuiLo") : null;

  const { data: membersData, isLoading: membersLoading } = useProjectMembersQuery(projectId);
  const members = membersData || [];

  const [membersActionLoading, setMembersActionLoading] = useState(false);

  const chartColors = ['#0071BC', '#3393CB', '#66B1D9', '#334155', '#64748b', '#94a3b8'];

  const handleInviteMember = async (email, role) => {
    setMembersActionLoading(true);
    try {
      await projectService.inviteProjectMember(projectId, email, role);
      setShowInviteModal(false);
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    } catch (err) {
      console.error('Error inviting member', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi mời thành viên.');
    } finally {
      setMembersActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, role) => {
    setMembersActionLoading(true);
    try {
      await projectService.updateProjectMemberRole(projectId, userId, role);
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    } catch (err) {
      console.error('Error updating role', err);
      alert('Không thể cập nhật quyền.');
    } finally {
      setMembersActionLoading(false);
    }
  };

  const handleRemoveMember = (userId) => {
    setConfirmModal({ show: true, userId });
  };

  const confirmRemoveMember = async () => {
    if (!confirmModal.userId) return;
    setMembersActionLoading(true);
    const targetUserId = confirmModal.userId;
    setConfirmModal({ show: false, userId: null });
    try {
      await projectService.removeProjectMember(projectId, targetUserId);
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    } catch (err) {
      console.error('Error removing member', err);
      alert('Không thể xóa thành viên.');
    } finally {
      setMembersActionLoading(false);
    }
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');
  const formatDate = (value) => {
    if (!value) return t("author.chuaCapNhat");
    return new Date(value).toLocaleDateString('vi-VN');
  };

  const mapChartData = (chart) => {
    const labels = chart?.labels || [];
    const values = chart?.datasets?.[0]?.data || [];
    return labels.map((label, index) => ({
      name: label,
      value: values[index] || 0,
    }));
  };

  const hasChartData = (chart) => mapChartData(chart).some((item) => item.value > 0);

  const chartTooltipStyle = {
    backgroundColor: 'var(--ds-surface, #ffffff)',
    border: '1px solid var(--ds-border, #E4E7EC)',
    borderRadius: '8px',
    boxShadow: 'var(--ds-shadow-card)',
    color: 'var(--ds-foreground, #0D1B1C)',
    fontSize: '13px',
  };

  const renderEmptyChart = (message = t("project.chuaCoDuLieuBieuDo")) => (
    <div className="flex h-52 flex-col items-center justify-center text-muted-foreground py-6">
      <Icon icon="lucide:chart-no-axes-column" width="36" className="mb-2 opacity-40" />
      <span className="text-xs">{message}</span>
    </div>
  );

  const renderDonutChart = (chart, centerLabel) => {
    let data = mapChartData(chart);
    if (!hasChartData(chart)) return renderEmptyChart();

    if (data.length > 5) {
      const sorted = [...data].sort((a, b) => b.value - a.value);
      const top5 = sorted.slice(0, 5);
      const remainingSum = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
      if (remainingSum > 0) {
        const otherLabel = centerLabel === 'Subject Areas' ? t("project.linhVucKhac") : t("project.nguonKhac");
        top5.push({
          name: otherLabel,
          value: remainingSum,
        });
      }
      data = top5;
    }
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <div className="relative flex justify-center">
          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val) => [formatNumber(val), centerLabel]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            <span className="text-lg font-bold text-foreground font-mono leading-none">{formatNumber(total)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">
              {t("common.total", "Total")}
            </span>
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={index}
                className="flex items-center justify-between py-1 border-b border-border text-xs"
              >
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="truncate font-medium text-foreground" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="text-muted-foreground whitespace-nowrap">
                  <span className="font-semibold text-foreground mr-1">{formatNumber(item.value)}</span>
                  <span>({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = (chart) => {
    const data = mapChartData(chart);
    if (!hasChartData(chart)) return renderEmptyChart();
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 12, right: 18, left: -10, bottom: 8 }}>
          <CartesianGrid stroke="var(--ds-border, #E4E7EC)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--ds-muted-foreground, #475467)', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--ds-muted-foreground, #475467)', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value) => [formatNumber(value), chart?.datasets?.[0]?.label || 'Publications']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--ds-primary, #0071BC)"
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2, fill: 'var(--ds-surface, #ffffff)', stroke: 'var(--ds-primary, #0071BC)' }}
            activeDot={{ r: 6, fill: 'var(--ds-primary, #0071BC)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderOverviewTab = () => {
    const summary = overviewData?.summary || {};
    const charts = overviewData?.charts || {};

    if (overviewLoading) {
      return (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[260px] w-full rounded" />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-[220px] w-full rounded" />
            </Card>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-[220px] w-full rounded" />
            </Card>
          </div>
        </div>
      );
    }

    if (overviewError) {
      return (
        <Alert variant="destructive" className="items-center">
          <Icon icon="lucide:circle-alert" width="24" className="shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-1">{t("article.khongTheTaiBieuDo")}</h4>
            <p className="text-xs m-0">{overviewError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProjectOverview}>
            {t("article.thuLai")}
          </Button>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {/* Publication trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">{t("project.xuHuongXuatBan")}</CardTitle>
              <p className="text-xs text-muted-foreground m-0">{t("project.soLuongBaiBaoLienQuanTheoTungN")}</p>
            </div>
            {summary.lastUpdatedAt && (
              <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {t("project.capNhatGanNhat")}: <strong className="text-foreground">{formatDate(summary.lastUpdatedAt)}</strong>
              </span>
            )}
          </CardHeader>
          <CardContent>{renderLineChart(charts.publicationTrend)}</CardContent>
        </Card>

        {/* Donut distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("project.phanBoLinhVuc")}</CardTitle>
              <p className="text-xs text-muted-foreground m-0">{t("project.tyTrongBaiBaoTheoSubjectArea")}</p>
            </CardHeader>
            <CardContent>{renderDonutChart(charts.subjectAreaDistribution, 'Subject Areas')}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t("project.loaiNguonXuatBan")}</CardTitle>
              <p className="text-xs text-muted-foreground m-0">{t("project.phanBoTheoJournalConferenceBoo")}</p>
            </CardHeader>
            <CardContent>{renderDonutChart(charts.publicationTypeDistribution, 'Publication Types')}</CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPagination = (type) => {
    const pagination = type === 'keywords' ? keywordArticlesPagination : watchArticlesPagination;
    const fetchFn = type === 'keywords' ? fetchKeywordArticles : fetchWatchArticles;
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages } = pagination;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => fetchFn(page - 1)}
          aria-label="Previous page"
        >
          <Icon icon="lucide:chevron-left" width="16" />
        </Button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={idx} className="px-2 text-xs text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={idx}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              className="size-8 p-0"
              onClick={() => p !== page && fetchFn(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => fetchFn(page + 1)}
          aria-label="Next page"
        >
          <Icon icon="lucide:chevron-right" width="16" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer className="py-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </Card>
          ))}
        </div>
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </PageContainer>
    );
  }

  if (error || !project) {
    return (
      <PageContainer className="py-8">
        <StatePanel
          variant="error"
          title={t("project.khongTheTaiDuAn")}
          description={error || t("project.duAnKhongTonTaiHoacDaBiXoa")}
          action={{
            label: t("auth.quayLai"),
            onClick: () => navigate(ROUTES.PROJECTS),
          }}
        />
      </PageContainer>
    );
  }

  const title = project.title || 'Untitled Project';
  const areaName =
    project.subject_area?.display_name ||
    project.subject_area?.name ||
    (typeof project.subject_area === 'string' ? project.subject_area : t("project.chuaXacDinhLinhVuc"));
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  const keywordCount = watchedKeywords?.length || 0;
  const articleCount = watchArticlesPagination?.total || 0;
  const growthRate = Number(overviewData?.summary?.growthRate ?? project?.alerts_24h?.growthRate ?? 0);
  const growthYear = overviewData?.summary?.growthYear;

  return (
    <PageContainer className="py-6 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("author.tongQuan"), to: ROUTES.DASHBOARD },
          { label: t("project.duAnTheoDoi"), to: ROUTES.PROJECTS },
          { label: title }
        ]}
        title={title}
        description={
          <span className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">
              {areaName}
            </Badge>
            <span>•</span>
            <span>{t("project.capNhatLuc")} {createdAt}</span>
          </span>
        }
        actions={
          <Button
            onClick={() => {
              const lang = i18n.language ? i18n.language.split('-')[0] : 'vi';
              navigate(`/${lang}/project/${projectId}/dashboard`);
            }}
            className="flex items-center gap-1.5"
          >
            <Icon icon="lucide:sparkles" width="16" aria-hidden="true" />
            <span>{t("project.phanTichChuyenSau")}</span>
          </Button>
        }
      />

      {/* Header section */}
      <div className="space-y-4">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <div className="text-xs font-medium text-muted-foreground">{t("keywords.baiBaoLienQuan")}</div>
            <div className="mt-1 text-xl font-bold text-foreground font-mono">
              {articleCount.toLocaleString('vi-VN')}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <div
              className="text-xs font-medium text-muted-foreground"
              title={growthYear ? `${growthYear} vs ${growthYear - 1}` : undefined}
            >
              {t("project.mucDoTangTruong")}
            </div>
            <div
              className={`mt-1 flex items-center gap-1 text-xl font-bold font-mono ${
                growthRate > 0
                  ? 'text-success'
                  : growthRate < 0
                  ? 'text-danger'
                  : 'text-muted-foreground'
              }`}
            >
              <span>
                {growthRate > 0 ? '+' : ''}
                {growthRate}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <div className="text-xs font-medium text-muted-foreground">{t("project.tuKhoaTheoDoi1")}</div>
            <div className="mt-1 text-xl font-bold text-foreground font-mono">
              {keywordCount.toLocaleString('vi-VN')}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface shadow-xs">
            <div className="text-xs font-medium text-muted-foreground">{t("project.tongSoTapChi", "Covered Journals")}</div>
            <div className="mt-1 text-xl font-bold text-foreground font-mono">
              {formatNumber(overviewData?.summary?.totalJournals || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <nav
        className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto"
        role="tablist"
        aria-label="Project sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'overview'}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('overview')}
        >
          <Icon icon="lucide:bar-chart-2" width="16" />
          <span>{t("project.tongQuanBieuDo", "Overview & Charts")}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'articles'}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'articles'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('articles')}
        >
          <Icon icon="lucide:file-text" width="16" />
          <span>{t("project.luongBaiBao", "News Feed")}</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {articleCount.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'keywords'}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'keywords'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('keywords')}
        >
          <Icon icon="lucide:key" width="16" />
          <span>{t("project.keywordsGiamSat", "Keywords & Monitoring")}</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {keywordCount.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'members'}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'members'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleTabChange('members')}
        >
          <Icon icon="lucide:users" width="16" />
          <span>{t("project.thanhVien", "Members")}</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {members.length}
          </span>
        </button>
      </nav>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'overview' && renderOverviewTab()}

        {activeTab === 'articles' && (
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="mb-4">
              <h3 className="m-0 text-base font-semibold text-foreground">
                {t("project.luongBaiVietCapNhat")}
              </h3>
              <p className="mt-1 mb-0 text-xs text-muted-foreground">
                {t("project.danhSachCacBaiBaoKhoaHocXuatBa")}
              </p>
            </div>

            {watchArticles.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Icon icon="lucide:file-x" width="40" className="mx-auto mb-2 opacity-40" />
                <p className="m-0 text-xs">{t("project.chuaCoBaiBaoNaoKhopVoiTuKhoaCu")}</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {watchArticles.map((article, index) => {
                  const pubYear = article.publication_year || (article.publication_date && new Date(article.publication_date).getFullYear());
                  const journalName = article.journal_name || article.journal?.title || t("author.tapChiKhoaHoc", "Scientific Journal");
                  return (
                    <div
                      key={article.article_id || article.id || index}
                      className="p-4 rounded-xl border border-border bg-surface-muted/20 hover:bg-surface-muted/40 transition-colors space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-primary inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-subtle text-[11px]">
                            <Icon icon="lucide:book-marked" width="12" />
                            {journalName}
                          </span>
                          {pubYear && (
                            <span className="text-muted-foreground text-[11px] font-medium">
                              • {pubYear}
                            </span>
                          )}
                        </div>
                        {article.matched_keywords?.length > 0 && (
                          <div className="flex items-center gap-1">
                            {article.matched_keywords.map((kw, kwIdx) => (
                              <Badge key={`kw-${kwIdx}`} variant="outline" className="text-[10px] gap-1 py-0.5">
                                <Icon icon="lucide:sparkles" width="10" />
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/articles/${article.article_id || article.id}/visual`}
                        className="group block no-underline"
                      >
                        <h4 className="m-0 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-relaxed">
                          <LatexText text={article.title} />
                        </h4>
                      </Link>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-xs text-muted-foreground">
                        {article.doi ? (
                          <div className="truncate">
                            <span className="text-muted-foreground mr-1">DOI:</span>
                            <a
                              href={article.doi.startsWith('http') ? article.doi : `https://doi.org/${article.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors no-underline font-mono text-[11px]"
                            >
                              {article.doi}
                            </a>
                          </div>
                        ) : <div />}

                        <Link
                          to={`/articles/${article.article_id || article.id}/visual`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline no-underline shrink-0"
                        >
                          <span>{t("article.xemChiTiet", "View Analysis")}</span>
                          <Icon icon="lucide:arrow-right" width="13" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {renderPagination('articles')}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="m-0 text-base font-semibold text-foreground">
                  {t("project.quanLyWatchlistTuKhoa")}
                </h3>
                <p className="mt-1 mb-0 text-xs text-muted-foreground">
                  {t("project.heThongSeLienTucQuetBaiBaoMoiV")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${projectId}/edit`)}
              >
                <Icon icon="lucide:edit-2" width="14" />
                <span>{t("project.chinhSuaDanhSach")}</span>
              </Button>
            </div>

            <KeywordWatchList
              watchedKeywords={watchedKeywords}
              articles={keywordArticles}
              loading={loading}
              onManageClick={() => setShowManageModal(true)}
            />

            {renderPagination('keywords')}
          </div>
        )}

        {activeTab === 'members' && (
          <ProjectMembersList
            project={project}
            members={members}
            loading={membersLoading}
            onInviteClick={() => setShowInviteModal(true)}
            onChangeRole={handleChangeRole}
            onRemoveMember={handleRemoveMember}
            actionLoading={membersActionLoading}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Modals */}
      <AddKeywordModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAdd={addKeywordWatch}
        actionLoading={actionLoading}
      />

      <ManageKeywordsModal
        show={showManageModal}
        onHide={() => setShowManageModal(false)}
        watchedKeywords={watchedKeywords}
        onRemove={removeKeywordWatch}
        actionLoading={actionLoading}
      />

      <InviteMemberModal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        actionLoading={membersActionLoading}
      />

      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, userId: null })}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-base font-semibold text-foreground">
            {t("project.xoaThanhVienTitle", "Xóa thành viên")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-sm text-muted-foreground m-0">
            {t("project.banCoChacMuonXoaThanhVien", "Bạn có chắc chắn muốn xóa thành viên này / hủy lời mời khỏi dự án không?")}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModal({ show: false, userId: null })}
          >
            {t("admin.huy", "Hủy")}
          </Button>
          <Button variant="destructive" onClick={confirmRemoveMember}>
            {t("project.xoa", "Xóa")}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
};

export default ProjectDetailPage;
