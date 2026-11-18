import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import ChartRangeDropdown from './ChartRangeDropdown';

const LINE_COLORS = ['var(--primary)', '#3b82f6', '#10b981', '#a855f7'];

function SimpleSvgChart({ years, series }) {
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  if (!years?.length || !series?.length) return null;

  const W = 1000;
  const H = 160;
  const PAD = { top: 14, right: 20, bottom: 14, left: 20 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const allVals = series.flatMap(s => s.data ?? []).filter(Number.isFinite);
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(1, ...allVals);
  const xScale = i => PAD.left + (i / (years.length - 1 || 1)) * chartW;
  const yScale = v => PAD.top + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  return (
    <div className="relative w-full">
      <div className="h-[140px] w-full relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Subtle Grid lines */}
          {[0, 0.33, 0.66, 1].map((tick) => {
            const y = PAD.top + (1 - tick) * chartH;
            return (
              <line
                key={tick}
                x1={PAD.left}
                x2={PAD.left + chartW}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Series lines */}
          {series.map((s, si) => {
            if (!s.data?.length) return null;
            const color = LINE_COLORS[si % LINE_COLORS.length];
            const pts = s.data.map((v, i) => `${xScale(i)},${yScale(v ?? 0)}`).join(' ');
            const pts0 = `${xScale(0)},${yScale(0)}`;
            const ptsN = `${xScale(s.data.length - 1)},${yScale(0)}`;

            return (
              <g key={si}>
                <polygon
                  points={`${pts0} ${pts} ${ptsN}`}
                  fill={color}
                  fillOpacity={0.07}
                />
                <polyline
                  points={pts}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {s.data.map((v, i) => (
                  <circle
                    key={i}
                    cx={xScale(i)}
                    cy={yScale(v ?? 0)}
                    r={3.5}
                    fill={color}
                    stroke="var(--surface)"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {s.data.map((v, i) => (
                  <circle
                    key={`hover-${i}`}
                    cx={xScale(i)}
                    cy={yScale(v ?? 0)}
                    r={16}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        year: years[i],
                        value: v ?? 0,
                        xPercent: (xScale(i) / W) * 100,
                        yPercent: (yScale(v ?? 0) / H) * 100,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-control border border-border bg-surface px-2 py-1 shadow-popover text-[11px]"
            style={{
              left: `${hoveredPoint.xPercent}%`,
              top: `${hoveredPoint.yPercent}%`,
              marginTop: '-6px',
            }}
          >
            <div className="font-semibold text-muted-foreground text-[10px]">
              {t("article.nam", "Year")} {hoveredPoint.year}
            </div>
            <div className="font-bold text-primary tabular-nums">
              {hoveredPoint.value.toLocaleString()} {t("author.baiBao", "articles")}
            </div>
          </div>
        )}
      </div>

      {/* HTML X-Axis Labels */}
      <div className="flex justify-between items-center px-4 pt-1.5 border-t border-border/50 text-[11px] font-mono text-muted-foreground select-none">
        {years.map((yr) => (
          <span key={yr} className="hover:text-foreground transition-colors">
            {yr}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PublicationTrendChart({
  analytics,
  loading,
  isFetching,
  error,
  onRetry,
  selectedRange,
  onRangeChange
}) {
  const { t } = useTranslation();

  const years = analytics?.years ?? analytics?.year_range ?? [];
  const series = analytics?.series ?? (analytics?.data ? [{
    label: t("articles"),
    data: analytics.data
  }] : []);

  const legend = series.length > 0 ? (
    <div className="flex flex-wrap items-center gap-2.5">
      {series.map((s, i) => (
        <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <div
            className="h-1.5 w-2.5 rounded-sm"
            style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }}
          />
          <span>{s.label ? t(s.label, s.label) : `Series ${i + 1}`}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:trending-up" width={16} className="text-primary" />
          <span>{t("dashboard.xuHuongPublication")}</span>
        </CardTitle>
        <div className="flex items-center gap-2.5">
          {legend}
          {onRangeChange && <ChartRangeDropdown value={selectedRange} onChange={onRangeChange} />}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-1.5 text-[11px] text-muted-foreground">
          <p className="m-0 truncate">{t("dashboard.soBaiBaoTheoNamTrongProjectsCu")}</p>
          {isFetching && (
            <span className="inline-flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
              <Icon icon="lucide:loader" className="animate-spin" width={11} />
              <span>{t("common.dangCapNhat", "Updating...")}</span>
            </span>
          )}
        </div>

        <div className="min-h-[160px] flex items-center justify-center">
          {loading && years.length === 0 ? (
            <div className="h-[160px] w-full animate-pulse rounded-lg bg-surface-muted" />
          ) : error && years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
              <Icon icon="lucide:alert-triangle" width={22} className="text-danger" />
              <p className="text-xs text-muted-foreground m-0">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  className="mt-1 text-xs font-semibold text-primary hover:underline"
                  onClick={onRetry}
                >
                  {t("article.thuLai")}
                </button>
              )}
            </div>
          ) : years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
              <Icon icon="lucide:bar-chart-2" width={28} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground mb-0">
                {t("dashboard.chuaCoDuLieuXuHuongPublication")}
              </p>
              <p className="text-[11px] text-muted-foreground m-0">
                {t("dashboard.taoProjectDauTienDeBatDauTheoD")}
              </p>
            </div>
          ) : (
            <div
              className="w-full transition-opacity duration-200"
              style={{ opacity: isFetching ? 0.6 : 1 }}
            >
              <SimpleSvgChart years={years} series={series} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
