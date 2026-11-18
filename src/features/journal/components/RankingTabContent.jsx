import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\components\RankingTabContent.jsx
 */
import { Row, Col, Table } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
export default function RankingTabContent({
  rankingHistory = [],
  metricName = 'Impact Factor',
  loading
}) {
  const {
    t
  } = useTranslation();
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
        title={t("journal.chuaCoDuLieuLichSuXepHangChoTa")}
        description={t("journal.duLieuXepHangSeHienThiODay", "Dữ liệu lịch sử xếp hạng sẽ hiển thị tại đây khi có thông tin.")}
      />
    );
  }

  // Sort chronological for chart (oldest to newest)
  const chartData = [...rankingHistory].sort((a, b) => a.year - b.year);
  // Sort reverse chronological for table (newest to oldest)
  const tableData = [...rankingHistory].sort((a, b) => b.year - a.year);

  // SVG Chart Calculations
  const chartHeight = 260;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  // Find max value for scaling
  const validValues = chartData.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 10;
  const yMax = Math.ceil(maxValue / 5) * 5; // round to next multiple of 5

  // Generate Y axis ticks
  const yTicks = [];
  for (let i = 0; i <= yMax; i += yMax / 5) {
    yTicks.push(Math.round(i * 10) / 10);
  }

  // Calculate coordinates
  const getX = index => {
    return paddingLeft + index * (graphWidth / (chartData.length - 1 || 1));
  };
  const getY = value => {
    if (value === null || value === undefined) return chartHeight - paddingBottom;
    const ratio = value / yMax;
    return chartHeight - paddingBottom - ratio * graphHeight;
  };
  return <Row className="gy-4 align-items-stretch">
      <Col lg={7} className="d-flex flex-column">
        <section className="journal-surface p-4 h-100 d-flex flex-column">
          <h2 className="journal-section-title">
            {t("journal.hoatDongOpenAlex", "OpenAlex publication activity")}</h2>

          <div className="flex-grow-1 d-flex justify-content-center align-items-center overflow-auto py-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" style={{
            minWidth: '400px',
            height: 'auto'
          }}>
              <defs>
                <linearGradient id="line-area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {yTicks.map((tick, idx) => {
              const y = getY(tick);
              return <g key={idx}>
                    <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="var(--border)" strokeWidth="1" />
                    <text x={paddingLeft - 8} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end" fontWeight="500">
                      {tick}
                    </text>
                  </g>;
            })}

              {(() => {
              const points = chartData.map((d, idx) => ({
                ...d,
                x: getX(idx),
                y: getY(d.value)
              })).filter(d => d.value !== null && d.value !== undefined && !Number.isNaN(Number(d.value)));
              if (points.length === 0) return null;
              const linePoints = points.map(point => `${point.x},${point.y}`).join(' ');
              const areaPoints = `${paddingLeft},${chartHeight - paddingBottom} ${linePoints} ${chartWidth - paddingRight},${chartHeight - paddingBottom}`;
              return <g className="chart-line-group">
                    {points.length > 1 && <>
                        <polygon points={areaPoints} fill="url(#line-area-fill)" />
                        <polyline points={linePoints} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </>}

                    {points.map((point, idx) => <g key={idx}>
                        <circle cx={point.x} cy={point.y} r="6" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                        <circle cx={point.x} cy={point.y} r="3" fill="var(--primary)" />
                        <text x={point.x} y={point.y - 12} fill="var(--primary)" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {point.value}
                        </text>
                      </g>)}
                  </g>;
            })()}

              <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="var(--border)" strokeWidth="1.5" />

              {chartData.map((d, idx) => {
              const x = getX(idx);
              return <text key={idx} x={x} y={chartHeight - paddingBottom + 18} fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontWeight="500">
                    {d.year}
                  </text>;
            })}
            </svg>
          </div>
        </section>
      </Col>

      <Col lg={5} className="d-flex flex-column">
        <section className="journal-surface p-4 h-100 d-flex flex-column">
          <h2 className="journal-section-title">{t("journal.soBaiBaoVaTrichDanTheoNam", "Works and citations by year")}</h2>

          <div className="table-responsive flex-grow-1">
            <Table borderless className="journal-ranking-table align-middle mb-0 text-start">
              <thead>
                <tr>
                  <th>{t("article.nam")}</th>
                  <th>{t("journal.baiBao", "Works")}</th>
                  <th>{t("journal.trichDan", "Citations")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => <tr key={idx}>
                    <td className="journal-number">{row.year}</td>
                    <td className="journal-number">
                      {row.value !== null && row.value !== undefined ? row.value : <span className="journal-muted-dash">N/A</span>}
                    </td>
                    <td>
                      {row.cited_by_count ?? 0}
                    </td>
                  </tr>)}
              </tbody>
            </Table>
          </div>
        </section>
      </Col>
    </Row>;
}
