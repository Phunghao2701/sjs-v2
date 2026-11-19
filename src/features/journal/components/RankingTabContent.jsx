import React, { useState, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import { Row, Col } from '../../../shared/ui/layout-grid';
import { Table } from '../../../shared/ui/table';
import { Icon } from '@iconify/react';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface p-2.5 shadow-md text-xs">
        <p className="font-semibold text-foreground mb-1">Year {data.year}</p>
        <div className="flex items-center justify-between gap-3 text-primary font-medium">
          <span>Works:</span>
          <span className="font-bold font-mono">{Number(data.works || 0).toLocaleString()}</span>
        </div>
        {data.citations !== undefined && data.citations !== null && (
          <div className="flex items-center justify-between gap-3 text-muted-foreground mt-0.5">
            <span>Citations:</span>
            <span className="font-mono">{Number(data.citations || 0).toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function RankingTabContent({
  rankingHistory = [],
  metricName = 'Impact Factor',
  loading
}) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('10Y');

  // Chronological list (oldest to newest)
  const fullChartData = useMemo(() => {
    return [...rankingHistory]
      .filter(item => item && item.year && !isNaN(Number(item.year)))
      .sort((a, b) => a.year - b.year);
  }, [rankingHistory]);

  // Reverse chronological for table (newest to oldest)
  const tableData = useMemo(() => {
    return [...rankingHistory]
      .filter(item => item && item.year && !isNaN(Number(item.year)))
      .sort((a, b) => b.year - a.year);
  }, [rankingHistory]);

  // Filtered chart data based on selected time range
  const filteredChartData = useMemo(() => {
    if (fullChartData.length === 0) return [];
    if (timeRange === 'ALL' || fullChartData.length <= 10) {
      return fullChartData.map(d => ({
        year: d.year,
        works: Number(d.value || 0),
        citations: Number(d.cited_by_count || 0),
      }));
    }

    const latestYear = Math.max(...fullChartData.map(d => d.year));
    const rangeSpan = timeRange === '20Y' ? 20 : 10;
    const cutoff = latestYear - rangeSpan + 1;

    return fullChartData
      .filter(d => d.year >= cutoff)
      .map(d => ({
        year: d.year,
        works: Number(d.value || 0),
        citations: Number(d.cited_by_count || 0),
      }));
  }, [fullChartData, timeRange]);

  if (loading) {
    return (
      <Row className="gy-4">
        <Col lg={7}>
          <section className="journal-surface p-4 h-100 rounded-card border border-border bg-surface">
            <Skeleton className="h-6 w-44 rounded mb-4" />
            <Skeleton className="h-72 w-full rounded" />
          </section>
        </Col>
        <Col lg={5}>
          <section className="journal-surface p-4 h-100 rounded-card border border-border bg-surface">
            <Skeleton className="h-6 w-36 rounded mb-4" />
            <Skeleton className="h-72 w-full rounded" />
          </section>
        </Col>
      </Row>
    );
  }

  if (!rankingHistory || rankingHistory.length === 0) {
    return (
      <StatePanel
        variant="neutral"
        icon={<Icon icon="lucide:line-chart" width="32" className="text-muted-foreground" />}
        title={t("journal.chuaCoDuLieuLichSuXepHangChoTa", "No ranking history available")}
        description={t("journal.duLieuXepHangSeHienThiODay", "Ranking history data will appear here when available.")}
      />
    );
  }

  return (
    <Row className="gy-4 align-items-stretch">
      {/* Left Column: Publication Activity Area Chart */}
      <Col lg={7} className="d-flex flex-column">
        <section className="journal-surface p-4 h-100 d-flex flex-column rounded-card border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="journal-section-title text-base font-semibold text-foreground mb-0">
              {t("journal.hoatDongOpenAlex", "OpenAlex publication activity")}
            </h2>

            {fullChartData.length > 10 && (
              <div className="flex items-center gap-1 bg-surface-muted/60 p-1 rounded-lg border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeRange('10Y')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === '10Y'
                      ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  10Y
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('20Y')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === '20Y'
                      ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  20Y
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('ALL')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    timeRange === 'ALL'
                      ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({fullChartData.length}y)
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-h-[280px] h-[280px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredChartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="openalex-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary, #0071BC)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary, #0071BC)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="year"
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                  minTickGap={25}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="works"
                  name="Works"
                  stroke="var(--primary, #0071BC)"
                  strokeWidth={2.5}
                  fill="url(#openalex-area-fill)"
                  dot={
                    filteredChartData.length <= 15
                      ? { r: 3.5, fill: 'var(--primary, #0071BC)', strokeWidth: 1.5, stroke: '#fff' }
                      : false
                  }
                  activeDot={{ r: 5, fill: 'var(--primary, #0071BC)', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </Col>

      {/* Right Column: Works and Citations by Year Table */}
      <Col lg={5} className="d-flex flex-column">
        <section className="journal-surface p-4 h-100 d-flex flex-column rounded-card border border-border bg-surface">
          <div className="flex items-center justify-between mb-3">
            <h2 className="journal-section-title text-base font-semibold text-foreground mb-0">
              {t("journal.soBaiBaoVaTrichDanTheoNam", "Works and citations by year")}
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {tableData.length} {t("journal.years", "years recorded")}
            </span>
          </div>

          <div className="table-responsive flex-grow-1 max-h-[300px] overflow-y-auto border rounded-md border-border/60">
            <Table borderless hover className="journal-ranking-table align-middle mb-0 text-start w-full">
              <thead className="sticky top-0 bg-surface z-10 border-b border-border shadow-2xs">
                <tr className="text-xs text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">{t("article.nam", "Year")}</th>
                  <th className="py-2.5 px-3 text-end">{t("journal.baiBao", "Works")}</th>
                  <th className="py-2.5 px-3 text-end">{t("journal.trichDan", "Citations")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary-subtle/10 transition-colors">
                    <td className="py-2 px-3 font-semibold text-foreground">{row.year}</td>
                    <td className="py-2 px-3 text-end font-mono font-medium text-foreground">
                      {row.value != null ? Number(row.value).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 px-3 text-end font-mono text-muted-foreground">
                      {row.cited_by_count != null ? Number(row.cited_by_count).toLocaleString() : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </section>
      </Col>
    </Row>
  );
}
