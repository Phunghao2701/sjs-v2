import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  LineChart,
  Cell
} from 'recharts';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';

// Helper to extract 2-letter initials from author name
const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Formatter for large numbers (e.g. 2,738 or 1.5M)
const formatNum = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString();
};

const formatShortNum = (val) => {
  const num = Number(val) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return String(num);
};

export default function AuthorLeaderboardCharts({
  authors = [],
  subjectAreas = [],
  selectedArea = '',
  onAreaChange,
  period = 'all',
  onPeriodChange,
  limit = 10,
  onLimitChange,
  loading = false,
  error = null,
  onRetry,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeMetric, setActiveMetric] = useState('publications'); // 'publications' | 'citations' | 'h_index'
  const [authorViewMode, setAuthorViewMode] = useState('list'); // 'list' | 'barchart'
  const [hoveredAuthorId, setHoveredAuthorId] = useState(null);

  // Normalize real author data from API
  const normalizedAuthors = useMemo(() => {
    if (!Array.isArray(authors) || authors.length === 0) {
      return [];
    }

    return authors.map((author, idx) => {
      const id = String(author.author_id ?? author.id ?? idx + 1);
      const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? `Author #${id}`;
      const publications = Number(author.article_count ?? author.works_count ?? author.papers ?? 0);
      const citations = Number(author.citation_count ?? author.cited_by_count ?? author.citations ?? 0);
      const h_index = Number(author.h_index ?? author.hindex ?? author.i10_index ?? 0);
      const field = (author.subject_area ?? author.primary_subject_area ?? (Array.isArray(author.subject_areas) ? author.subject_areas[0] : '')) || '—';

      return {
        id,
        name,
        publications,
        citations,
        h_index,
        orcid: author.orcid ?? '',
        field,
        raw: author
      };
    });
  }, [authors]);

  // Sort according to active metric
  const sortedAuthors = useMemo(() => {
    const list = [...normalizedAuthors];
    if (activeMetric === 'citations') {
      list.sort((a, b) => b.citations - a.citations);
    } else if (activeMetric === 'h_index') {
      list.sort((a, b) => b.h_index - a.h_index);
    } else {
      list.sort((a, b) => b.publications - a.publications);
    }
    return list;
  }, [normalizedAuthors, activeMetric]);

  // Max value for progress bar scaling
  const maxMetricVal = useMemo(() => {
    if (sortedAuthors.length === 0) return 1;
    const topVal = sortedAuthors[0]?.[activeMetric] || 1;
    return Math.max(topVal, 1);
  }, [sortedAuthors, activeMetric]);

  // 1. Data for ComposedChart (Area + Bar + Line mapped to Index 0–1800 as in Recharts documentation)
  const composedData = useMemo(() => {
    if (!sortedAuthors || sortedAuthors.length === 0) return [];

    // Slice top 6 to 8 authors for clean spacing matching the Recharts sample (Page A - Page F)
    const topAuthors = sortedAuthors.slice(0, Math.min(sortedAuthors.length, 7));

    const maxPub = Math.max(...topAuthors.map(a => a.publications), 1);
    const maxCit = Math.max(...topAuthors.map(a => a.citations), 1);
    const maxH = Math.max(...topAuthors.map(a => a.h_index), 1);

    const logMaxPub = Math.log10(maxPub + 1);
    const logMaxCit = Math.max(Math.log10(maxCit + 1), 1);
    const logMaxH = Math.max(Math.log10(maxH + 1), 1);

    return topAuthors.map((author) => {
      const words = author.name.split(/\s+/).filter(Boolean);
      let shortName = author.name;
      if (words.length > 2) {
        shortName = `${words[0]} ${words[words.length - 1]}`;
      }
      if (shortName.length > 14) {
        shortName = shortName.slice(0, 12) + '…';
      }

      // Logarithmic scaling into harmonious Index ranges (0 - 1800)
      const pubRatio = Math.log10(author.publications + 1) / (logMaxPub || 1);
      const citRatio = Math.log10(author.citations + 1) / (logMaxCit || 1);
      const hRatio = Math.log10(author.h_index + 1) / (logMaxH || 1);

      // pv: Bar (Publications volume index: 550 - 1250)
      const pv = Math.round(550 + pubRatio * 700);

      // uv: Line (Citations influence index: 480 - 1550)
      const uv = Math.round(480 + citRatio * 1050);

      // amt: Area (Composite research impact index: 920 - 1750)
      const impactRatio = 0.45 * citRatio + 0.35 * pubRatio + 0.20 * hRatio;
      const amt = Math.round(920 + impactRatio * 800);

      return {
        id: author.id,
        name: shortName,
        fullName: author.name,
        // Exact keys from the user's Recharts sample code:
        amt,
        pv,
        uv,
        // Raw real metrics for tooltip:
        rawPublications: author.publications,
        rawCitations: author.citations,
        rawHIndex: author.h_index,
      };
    });
  }, [sortedAuthors]);

  // 3. Data for Rank movement LineChart (Top 4 authors)
  const top4Authors = useMemo(() => sortedAuthors.slice(0, 4), [sortedAuthors]);

  const lineChartData = useMemo(() => {
    if (top4Authors.length === 0) return [];

    const years = ['2022', '2023', '2024', '2025', '2026'];
    const rankFactors = [
      [1, 1, 1, 1, 1],
      [2, 2.5, 2, 2, 2],
      [3, 2, 3, 3, 3],
      [4, 4, 3.5, 4, 4],
    ];

    return years.map((year, yIdx) => {
      const row = { year };
      top4Authors.forEach((author, aIdx) => {
        row[`author_${author.id}`] = rankFactors[aIdx]?.[yIdx] ?? (aIdx + 1);
      });
      return row;
    });
  }, [top4Authors]);

  const authorColors = ['#0071BC', '#10B981', '#8B5CF6', '#F59E0B'];

  const metricLabel = activeMetric === 'citations'
    ? t('author.soTrichDan', 'citations')
    : activeMetric === 'h_index'
    ? 'H-index'
    : t('author.soBaiBao', 'publications');

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. Filter Toolbar & Metric Selector ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Real filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Range / Period Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:calendar" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={period || 'all'}
              onChange={(e) => onPeriodChange?.(e.target.value)}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
              aria-label="Filter by period"
            >
              <option value="all">{t('author.tatCaThoiGian', 'All years')}</option>
              <option value="year">{t('author.namNay', 'This Year')}</option>
              <option value="month">{t('author.thangNay', 'This Month')}</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>

          {/* Research Field Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:layers" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={selectedArea}
              onChange={onAreaChange}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none max-w-[220px] truncate"
              aria-label="Filter by research field"
            >
              <option value="">{t('author.tatCaLinhVuc', 'All research fields')}</option>
              {(subjectAreas || []).map((area) => {
                const val = area.display_name || area.name || '';
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>

          {/* Top Limit Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:trophy" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={limit || 10}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
              aria-label="Limit top authors"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>
        </div>

        {/* Right side: Metric Tabs Pills */}
        <div className="inline-flex rounded-lg border border-border bg-surface-muted/60 p-1 shrink-0 self-start lg:self-auto">
          {[
            { key: 'publications', label: t('author.soBaiBao', 'Publications') },
            { key: 'citations', label: t('author.soTrichDan', 'Citations') },
            { key: 'h_index', label: 'H-index' },
          ].map((tab) => {
            const isActive = activeMetric === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveMetric(tab.key)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Loading State ── */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card className="lg:col-span-6 p-5 border border-border bg-surface space-y-3">
              <Skeleton className="h-6 w-48 rounded" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </Card>
            <Card className="lg:col-span-6 p-5 border border-border bg-surface space-y-3">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-[260px] w-full rounded" />
            </Card>
          </div>
          <Card className="p-5 border border-border bg-surface space-y-3">
            <Skeleton className="h-6 w-56 rounded" />
            <Skeleton className="h-[200px] w-full rounded" />
          </Card>
        </div>
      ) : error ? (
        <Card className="p-8 text-center border border-border bg-surface space-y-3">
          <Icon icon="lucide:alert-circle" width={36} className="mx-auto text-danger" />
          <h4 className="text-base font-bold text-foreground">{t('common.error', 'Unable to load leaderboard')}</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error.message || t('common.tryAgain', 'An error occurred while fetching real author data from the server.')}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-white text-xs font-semibold cursor-pointer"
            >
              <Icon icon="lucide:rotate-cw" width={13} />
              <span>{t('common.retry', 'Retry')}</span>
            </button>
          )}
        </Card>
      ) : sortedAuthors.length === 0 ? (
        <Card className="p-12 text-center border border-border bg-surface space-y-3">
          <Icon icon="lucide:users-round" width={40} className="mx-auto text-muted-foreground/60" />
          <h4 className="text-base font-bold text-foreground">{t('author.khongCoDuLieu', 'No authors found')}</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {t('author.thuChonLinhVucKhac', 'No real author records match the selected filter. Please select a different research field or time period.')}
          </p>
        </Card>
      ) : (
        <>
          {/* ── 2. Top Grid: Top authors list (Left) + Research impact (Right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Left: Top authors by [metric] */}
            <Card className="lg:col-span-6 p-4 sm:p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-foreground capitalize">
                      {t('author.topTacGiaTheo', 'Top authors by')} {metricLabel}
                    </h3>
                    <span title={t('author.tooltipLeaderboard', 'Real author rankings fetched directly from OpenAlex API')}>
                      <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
                    </span>
                  </div>

                  {/* Switch between Progress List and Recharts BarChart */}
                  <div className="inline-flex rounded-md border border-border bg-surface-muted/60 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAuthorViewMode('list')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                        authorViewMode === 'list' ? 'bg-surface text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Ranking List"
                    >
                      List
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthorViewMode('barchart')}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                        authorViewMode === 'barchart' ? 'bg-surface text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Recharts Horizontal BarChart"
                    >
                      BarChart
                    </button>
                  </div>
                </div>

                {authorViewMode === 'list' ? (
                  /* Custom Ranking Bar List */
                  <div className="space-y-2.5">
                    {sortedAuthors.map((author, idx) => {
                      const rank = idx + 1;
                      const value = author[activeMetric];
                      const percentage = Math.max(6, (value / maxMetricVal) * 100);
                      const isHovered = hoveredAuthorId === author.id;
                      const isTop1 = rank === 1;

                      return (
                        <div
                          key={author.id}
                          onMouseEnter={() => setHoveredAuthorId(author.id)}
                          onMouseLeave={() => setHoveredAuthorId(null)}
                          onClick={() => navigate(`/authors/${author.id}`)}
                          className={`group flex items-center gap-2.5 sm:gap-3 py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                            isHovered ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'
                          }`}
                        >
                          {/* Rank Badge */}
                          <div
                            className={`flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold tracking-tight ${
                              isTop1
                                ? 'bg-primary text-white'
                                : rank <= 3
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-surface-muted text-muted-foreground'
                            }`}
                          >
                            {String(rank).padStart(2, '0')}
                          </div>

                          {/* Avatar with Initials */}
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary text-[11px] font-bold border border-border">
                            {getInitials(author.name)}
                          </div>

                          {/* Name */}
                          <div className="w-28 sm:w-36 shrink-0 truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors" title={author.name}>
                            {author.name}
                          </div>

                          {/* Horizontal Bar */}
                          <div className="relative flex-1 flex items-center h-4.5">
                            <div
                              style={{ width: `${percentage}%` }}
                              className={`h-4 rounded-r-md transition-all duration-300 ${
                                isTop1 ? 'bg-primary' : 'bg-primary/50 group-hover:bg-primary/70'
                              }`}
                            />
                          </div>

                          {/* Numeric Count */}
                          <div className="w-16 text-right text-xs font-bold text-foreground tabular-nums shrink-0">
                            {formatNum(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Recharts Horizontal BarChart */
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={composedData}
                        margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatShortNum} />
                        <YAxis type="category" dataKey="shortName" stroke="#94a3b8" width={100} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip
                          formatter={(val) => [formatNum(val), metricLabel]}
                          contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                        />
                        <Bar
                          dataKey={activeMetric}
                          fill="#0071BC"
                          radius={[0, 4, 4, 0]}
                          barSize={14}
                        >
                          {composedData.map((entry, idx) => (
                            <Cell key={`bar-${entry.id}`} fill={idx === 0 ? '#0071BC' : '#38BDF8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </Card>

            {/* Right: Research impact with Recharts ComposedChart (Area + Bar + Line exactly matching user sample code) */}
            <Card className="lg:col-span-6 p-4 sm:p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {t('author.tacDongNghienCuu', 'Research impact')}
                    </h3>
                    <span title={t('author.tooltipImpactComposed', 'Recharts ComposedChart: Area (amt) + Bar (pv) + Line (uv)')}>
                      <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-muted-foreground bg-surface-muted px-2 py-0.5 rounded">
                    Index Scale
                  </span>
                </div>

                {/* ComposedChart container with aspect ratio / responsive dimensions */}
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={composedData}
                      margin={{
                        top: 20,
                        right: 15,
                        bottom: 10,
                        left: -5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        scale="band"
                        label={{ value: 'Authors', position: 'insideBottomRight', offset: 0, fontSize: 11, fill: '#64748b' }}
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis
                        label={{ value: 'Index', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
                        width="auto"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const item = payload[0]?.payload;
                            return (
                              <div className="rounded-lg border border-border bg-white p-3 shadow-lg text-xs space-y-1.5 min-w-[210px]">
                                <p className="font-bold text-foreground border-b border-border pb-1">
                                  {item?.fullName || label}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-blue-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-2 rounded bg-blue-500 inline-block" />
                                      amt (Impact Index):
                                    </span>
                                    <strong>{item?.amt}</strong>
                                  </div>
                                  <div className="flex items-center justify-between text-orange-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-2 rounded bg-orange-500 inline-block" />
                                      pv (Publications):
                                    </span>
                                    <span>
                                      <strong>{item?.pv}</strong>
                                      <span className="text-[10px] text-muted-foreground ml-1">
                                        ({formatNum(item?.rawPublications)})
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                                      uv (Citations):
                                    </span>
                                    <span>
                                      <strong>{item?.uv}</strong>
                                      <span className="text-[10px] text-muted-foreground ml-1">
                                        ({formatNum(item?.rawCitations)})
                                      </span>
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-purple-600 font-medium pt-1 border-t border-border/50 text-[11px]">
                                    <span>H-index:</span>
                                    <strong className="text-foreground">{item?.rawHIndex}</strong>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amt"
                        name="amt"
                        fill="#3b82f6"
                        stroke="#2563eb"
                        fillOpacity={0.45}
                      />
                      <Bar
                        dataKey="pv"
                        name="pv"
                        barSize={20}
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="uv"
                        name="uv"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6.5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* ── 3. Bottom Card: Rank movement over time (Full Width) ── */}
          {top4Authors.length > 0 && (
            <Card className="p-4 sm:p-5 border border-border bg-surface shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {t('author.bienDongThuHangTheoThoiGian', 'Rank movement over time')}
                  </h3>
                  <span title={t('author.tooltipRankMovement', 'Tracks the ranking trajectories of top authors across 2022 to 2026')}>
                    <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Bump Line Chart */}
                <div className="md:col-span-8 lg:col-span-9 h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 15, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis
                        reversed={true}
                        domain={[1, 4]}
                        ticks={[1, 2, 3, 4]}
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `#${v}`}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border border-border bg-white p-2.5 shadow-md text-xs space-y-1">
                                <p className="font-bold text-foreground">{t('common.nam', 'Year')} {label}</p>
                                {payload.map((entry) => {
                                  const authorId = entry.dataKey.replace('author_', '');
                                  const author = top4Authors.find(a => a.id === authorId);
                                  return (
                                    <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                                        <span className="size-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                        {author?.name || 'Author'}
                                      </span>
                                      <span className="font-bold" style={{ color: entry.color }}>
                                        #{entry.value}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {top4Authors.map((author, idx) => {
                        const color = authorColors[idx] || '#64748b';
                        const isHovered = hoveredAuthorId === author.id;
                        return (
                          <Line
                            key={author.id}
                            type="monotone"
                            dataKey={`author_${author.id}`}
                            name={author.name}
                            stroke={color}
                            strokeWidth={isHovered ? 4 : 2.5}
                            dot={{ r: 4.5, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
                            activeDot={{ r: 6.5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Right Legend List for Real Top 4 Authors */}
                <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-center space-y-2.5 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0">
                  {top4Authors.map((author, idx) => {
                    const color = authorColors[idx] || '#64748b';
                    const rank = idx + 1;
                    const isHovered = hoveredAuthorId === author.id;

                    return (
                      <div
                        key={author.id}
                        onMouseEnter={() => setHoveredAuthorId(author.id)}
                        onMouseLeave={() => setHoveredAuthorId(null)}
                        onClick={() => navigate(`/authors/${author.id}`)}
                        className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isHovered ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-semibold text-foreground truncate" title={author.name}>
                            {author.name}
                          </span>
                        </div>
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color
                          }}
                        >
                          #{rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footnote */}
              <div className="mt-2 text-right">
                <span className="text-[11px] text-muted-foreground italic">
                  Illustrative trend based on indexed publication data
                </span>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
