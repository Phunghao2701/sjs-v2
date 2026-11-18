import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import Icon from '../../../shared/components/Icon';
import { Skeleton } from '../../../shared/ui/skeleton';

const geoUrl = '/data/countries-110m.json';

// ISO 3166-1 alpha-2 -> ISO 3166-1 numeric 3-digit code
const ALPHA2_TO_NUMERIC = {
  AF: '004', AL: '008', DZ: '012', AO: '024', AR: '032', AM: '051', AU: '036', AT: '040', AZ: '031',
  BS: '044', BD: '050', BY: '112', BE: '056', BZ: '084', BJ: '204', BT: '064', BO: '068', BA: '070',
  BW: '072', BR: '076', BN: '096', BG: '100', BF: '854', BI: '108', KH: '116', CM: '120', CA: '124',
  CF: '140', TD: '148', CL: '152', CN: '156', CO: '170', CG: '178', CD: '180', CR: '188', CI: '384',
  HR: '191', CU: '192', CY: '196', CZ: '203', DK: '208', DJ: '262', DO: '214', EC: '218', EG: '818',
  SV: '222', GQ: '226', ER: '232', EE: '233', ET: '231', FJ: '242', FI: '246', FR: '250', GA: '266',
  GM: '270', GE: '268', DE: '276', GH: '288', GR: '300', GT: '320', GN: '324', GW: '624', GY: '328',
  HT: '332', HN: '340', HU: '348', IS: '352', IN: '356', ID: '360', IR: '364', IQ: '368', IE: '372',
  IL: '376', IT: '380', JM: '388', JP: '392', JO: '400', KZ: '398', KE: '404', KP: '408', KR: '410',
  KW: '414', KG: '417', LA: '418', LV: '428', LB: '422', LS: '426', LR: '430', LY: '434', LT: '440',
  LU: '442', MK: '807', MG: '450', MW: '454', MY: '458', ML: '466', MR: '478', MX: '484', MD: '498',
  MN: '496', ME: '499', MA: '504', MZ: '508', MM: '104', NA: '516', NP: '524', NL: '528', NZ: '554',
  NI: '558', NE: '562', NG: '566', NO: '578', OM: '512', PK: '586', PA: '591', PG: '598', PY: '600',
  PE: '604', PH: '608', PL: '616', PT: '620', QA: '634', RO: '642', RU: '643', RW: '646', SA: '682',
  SN: '686', RS: '688', SL: '694', SK: '703', SI: '705', SO: '706', ZA: '710', SS: '728', ES: '724',
  LK: '144', SD: '729', SR: '740', SZ: '748', SE: '752', CH: '756', SY: '760', TW: '158', TJ: '762',
  TZ: '834', TH: '764', TL: '626', TG: '768', TT: '780', TN: '788', TR: '792', TM: '795', UG: '800',
  UA: '804', AE: '784', GB: '826', US: '840', UY: '858', UZ: '860', VE: '862', VN: '704', YE: '887',
  ZM: '894', ZW: '716'
};

const NUMERIC_TO_ALPHA2 = Object.entries(ALPHA2_TO_NUMERIC).reduce((acc, [alpha2, num]) => {
  acc[num] = alpha2;
  acc[String(parseInt(num, 10))] = alpha2;
  return acc;
}, {});

// Country name aliases in TopoJSON
const NAME_ALIASES = {
  'united states of america': 'US',
  'united states': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'vietnam': 'VN',
  'viet nam': 'VN',
  'russia': 'RU',
  'russian federation': 'RU',
  'south korea': 'KR',
  'korea': 'KR',
  'iran': 'IR',
  'syria': 'SY',
  'tanzania': 'TZ',
  'dem. rep. congo': 'CD',
  'dr congo': 'CD',
  'congo': 'CG',
  'côte d\'ivoire': 'CI',
  'ivory coast': 'CI',
  'bosnia and herz.': 'BA',
  'bosnia & herzegovina': 'BA',
  'macedonia': 'MK',
  'north macedonia': 'MK',
  'czech republic': 'CZ',
  'czechia': 'CZ'
};

// Global Macro Regions for Continental breakdown
const CONTINENT_REGIONS = [
  {
    id: 'asia-pacific',
    name: 'Asia & Pacific',
    icon: 'lucide:compass',
    color: '#0284c7',
    codes: new Set([
      'CN', 'JP', 'IN', 'KR', 'ID', 'AU', 'TW', 'SG', 'MY', 'TH', 'VN', 'NZ', 'PH', 'PK', 'BD',
      'HK', 'LK', 'NP', 'MM', 'KH', 'MN', 'MO', 'BN', 'LA', 'FJ', 'PG'
    ])
  },
  {
    id: 'north-america',
    name: 'North America',
    icon: 'lucide:map-pin',
    color: '#2563eb',
    codes: new Set(['US', 'CA', 'MX'])
  },
  {
    id: 'europe',
    name: 'Europe',
    icon: 'lucide:landmark',
    color: '#4f46e5',
    codes: new Set([
      'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'BE', 'PL', 'AT', 'DK', 'NO', 'FI', 'IE',
      'CZ', 'PT', 'GR', 'HU', 'RO', 'UA', 'SK', 'RS', 'HR', 'BG', 'SI', 'EE', 'LT', 'LV', 'IS',
      'LU', 'CY', 'BA', 'MK', 'AL', 'MD', 'ME', 'MT', 'BY'
    ])
  },
  {
    id: 'middle-east-africa',
    name: 'Middle East & Africa',
    icon: 'lucide:sun',
    color: '#d97706',
    codes: new Set([
      'IR', 'TR', 'SA', 'IL', 'EG', 'ZA', 'NG', 'AE', 'IQ', 'DZ', 'MA', 'KE', 'ET', 'TN', 'JO',
      'QA', 'GH', 'UG', 'LB', 'KW', 'OM', 'CM', 'TZ', 'SN', 'ZW', 'SD', 'RW', 'CI', 'NA', 'BW'
    ])
  },
  {
    id: 'latin-america',
    name: 'Latin America & Caribbean',
    icon: 'lucide:mountain',
    color: '#059669',
    codes: new Set([
      'BR', 'AR', 'CL', 'CO', 'PE', 'EC', 'CU', 'UY', 'VE', 'CR', 'PA', 'PR', 'DO', 'JM', 'BO',
      'PY', 'GT', 'TT', 'SV', 'HN', 'NI'
    ])
  },
  {
    id: 'eurasia',
    name: 'Eurasia & Central Asia',
    icon: 'lucide:globe-2',
    color: '#7c3aed',
    codes: new Set(['RU', 'KZ', 'UZ', 'AZ', 'GE', 'AM', 'KG', 'TJ', 'TM', 'MN'])
  }
];

// Helper to resolve flag code
const getCountryFlagCode = (item) => {
  const rawCode = (item?.code || item?.iso_code || item?.iso2 || item?.name?.substring(0, 2) || '').toLowerCase().trim();
  const isoMap = {
    gb: 'gb', gbr: 'gb', uk: 'gb',
    us: 'us', usa: 'us',
    de: 'de', deu: 'de',
    nl: 'nl', nld: 'nl',
    ch: 'ch', che: 'ch',
    vn: 'vn', vnm: 'vn',
    jp: 'jp', jpn: 'jp',
    kr: 'kr', kor: 'kr',
    cn: 'cn', chn: 'cn',
    in: 'in', ind: 'in',
    br: 'br', bra: 'br',
    ru: 'ru', rus: 'ru',
    ca: 'ca', can: 'ca',
    fr: 'fr', fra: 'fr',
    au: 'au', aus: 'au'
  };
  return isoMap[rawCode] || (rawCode.length === 2 ? rawCode : 'un');
};

export default function GeographyWorldMap({
  data = [],
  loading = false,
  selectedCountry = null,
  onSelectCountry,
  selectedYear = 'All',
  onYearChange,
}) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'regions'
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ coordinates: [0, 15], zoom: 1 });

  // Map countryStats by Alpha2 code and Name for O(1) lookup
  const { countryByCode, countryByName, totalWorldArticles } = useMemo(() => {
    const byCode = {};
    const byName = {};
    let total = 0;

    // Rank countries
    const ranked = [...data]
      .sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0))
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    for (const item of ranked) {
      const count = Number(item.article_count) || 0;
      total += count;
      const code = (item.code || item.iso_code || '').toUpperCase().trim();
      if (code) byCode[code] = item;
      if (item.name) byName[item.name.toLowerCase().trim()] = item;
    }

    return { countryByCode: byCode, countryByName: byName, totalWorldArticles: total };
  }, [data]);

  // Aggregate stats by Global Region
  const regionStats = useMemo(() => {
    return CONTINENT_REGIONS.map((region) => {
      let articles = 0;
      let activeCountries = 0;
      let topCountry = null;

      for (const item of data) {
        const code = (item.code || item.iso_code || '').toUpperCase().trim();
        if (region.codes.has(code)) {
          const count = Number(item.article_count) || 0;
          articles += count;
          if (count > 0) activeCountries++;
          if (!topCountry || count > (Number(topCountry.article_count) || 0)) {
            topCountry = item;
          }
        }
      }

      const percent = totalWorldArticles > 0 ? (articles / totalWorldArticles) * 100 : 0;
      return {
        ...region,
        totalArticles: articles,
        activeCountries,
        topCountry,
        percent
      };
    }).sort((a, b) => b.totalArticles - a.totalArticles);
  }, [data, totalWorldArticles]);

  // Find country data for a TopoJSON geometry
  const getCountryDataForGeo = useCallback((geo) => {
    // 1. Match by numeric ID
    const geoId = String(geo.id);
    const alpha2 = NUMERIC_TO_ALPHA2[geoId] || NUMERIC_TO_ALPHA2[String(parseInt(geoId, 10))];
    if (alpha2 && countryByCode[alpha2]) {
      return countryByCode[alpha2];
    }

    // 2. Match by normalized name
    const rawName = (geo.properties?.name || '').toLowerCase().trim();
    if (NAME_ALIASES[rawName] && countryByCode[NAME_ALIASES[rawName]]) {
      return countryByCode[NAME_ALIASES[rawName]];
    }
    if (countryByName[rawName]) {
      return countryByName[rawName];
    }

    return null;
  }, [countryByCode, countryByName]);

  // Determine fill color based on publication volume
  const getGeoFill = (geo, country) => {
    const isSelected = selectedCountry && country && (
      selectedCountry.zone_id === country.zone_id ||
      selectedCountry.code === country.code
    );

    if (isSelected) {
      return '#0284c7'; // Active bright primary blue
    }

    if (!country || !country.article_count || Number(country.article_count) <= 0) {
      return '#e2e8f0'; // Clean neutral for no data
    }

    const count = Number(country.article_count);
    // Quantile / logarithmic brackets
    if (count >= 5000000) return '#0369a1';  // Peak (>5M): Dark rich blue
    if (count >= 1000000) return '#0284c7';  // High (1M-5M): Primary blue
    if (count >= 100000)  return '#38bdf8';  // Medium (100k-1M): Cyan blue
    if (count >= 10000)   return '#7dd3fc';  // Low (10k-100k): Soft sky blue
    return '#bae6fd';                        // Minimal (<10k): Very light sky blue
  };

  const handleZoomIn = () => {
    if (position.zoom >= 6) return;
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 6) }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [0, 15], zoom: 1 });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col h-full min-w-0 relative">
      {/* Card Header with View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:globe" width={18} className="text-primary shrink-0" />
            <h3 className="text-base font-bold text-foreground tracking-tight m-0 truncate">
              {viewMode === 'map'
                ? t('zone.banDoXuatBanToanCau', 'Global Publication Heatmap')
                : t('zone.phanBoTheoChauLuc', 'Continental Distribution')}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 mb-0 truncate">
            {viewMode === 'map'
              ? t('zone.banDoTrucQuanHoaMatDo', 'Interactive world choropleth map showing publication volume')
              : t('zone.tyTrongSanLuongNghienCuuTheoKhuVuc', 'Research output breakdown by global macro-regions')}
          </p>
        </div>

        {/* View Toggle Tabs & Year Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-surface-muted p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                viewMode === 'map'
                  ? 'bg-surface text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
            >
              <Icon icon="lucide:map" width={13} />
              <span>{t('zone.banDo', 'World Map')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('regions')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border-0 ${
                viewMode === 'regions'
                  ? 'bg-surface text-primary shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
            >
              <Icon icon="lucide:pie-chart" width={13} />
              <span>{t('zone.chauLuc', 'Regional Share')}</span>
            </button>
          </div>

          {/* Year Filter Select */}
          <div className="relative inline-flex items-center shrink-0">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange?.(e.target.value)}
              className="h-7.5 pl-2.5 pr-6 text-xs font-semibold rounded-md border border-border/80 bg-surface text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors shadow-2xs"
              aria-label={t('article.namXuatBan', 'Publication Year')}
            >
              <option value="All">{t('zone.tatCaCacNam', 'All Years')}</option>
              {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <Icon
              icon="lucide:chevron-down"
              width={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center flex-1 min-h-[460px] space-y-4">
          <Skeleton className="w-full h-80 rounded-xl" />
          <div className="flex gap-4 w-full justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      ) : viewMode === 'map' ? (
        /* ================= MAP VIEW ================= */
        <div className="flex-1 flex flex-col justify-between pt-3 relative min-h-[460px]">
          {/* Zoom and Reset Controls */}
          <div className="absolute top-4 right-2 z-10 flex flex-col gap-1 bg-surface/90 backdrop-blur-xs p-1 rounded-lg border border-border shadow-2xs">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
              className="p-1.5 rounded text-foreground hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
            >
              <Icon icon="lucide:plus" width={14} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="p-1.5 rounded text-foreground hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
            >
              <Icon icon="lucide:minus" width={14} />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset View"
              aria-label="Reset View"
              className="p-1.5 rounded text-foreground hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
            >
              <Icon icon="lucide:rotate-ccw" width={13} />
            </button>
          </div>

          {/* Active selection banner if country selected */}
          {selectedCountry && (
            <div className="absolute top-4 left-2 z-10 inline-flex items-center gap-2 bg-surface/95 backdrop-blur-xs py-1 px-2.5 rounded-lg border border-primary/40 shadow-xs text-xs">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-foreground">
                {selectedCountry.name || selectedCountry.code}
              </span>
              <span className="font-mono text-muted-foreground text-[11px]">
                ({Number(selectedCountry.article_count || 0).toLocaleString()} articles)
              </span>
              <button
                type="button"
                onClick={() => onSelectCountry?.(selectedCountry)}
                className="text-muted-foreground hover:text-foreground ml-1 p-0.5 border-0 bg-transparent cursor-pointer"
                title="Deselect"
              >
                <Icon icon="lucide:x" width={12} />
              </button>
            </div>
          )}

          {/* The Interactive Map */}
          <div
            className="flex-1 w-full flex items-center justify-center overflow-hidden rounded-lg bg-surface-muted/20"
            onMouseMove={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              setTooltipPos({
                x: e.clientX - bounds.left,
                y: e.clientY - bounds.top
              });
            }}
          >
            <ComposableMap
              projection="geoEqualEarth"
              width={800}
              height={440}
              projectionConfig={{
                scale: 155,
                center: [0, 15]
              }}
              className="w-full h-auto select-none"
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={(pos) => setPosition(pos)}
                minZoom={1}
                maxZoom={6}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const country = getCountryDataForGeo(geo);
                      const isSelected = selectedCountry && country && (
                        selectedCountry.zone_id === country.zone_id ||
                        selectedCountry.code === country.code
                      );

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getGeoFill(geo, country)}
                          stroke={isSelected ? '#0369a1' : '#ffffff'}
                          strokeWidth={isSelected ? 1.5 : 0.5}
                          className="transition-colors duration-150 cursor-pointer outline-none"
                          onMouseEnter={() => {
                            if (country) {
                              setHoveredCountry(country);
                            } else {
                              setHoveredCountry({
                                name: geo.properties.name,
                                article_count: 0
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onClick={() => {
                            if (country) {
                              onSelectCountry?.(country);
                            }
                          }}
                          style={{
                            default: { outline: 'none' },
                            hover: {
                              fill: isSelected ? '#0284c7' : country ? '#0ea5e9' : '#cbd5e1',
                              outline: 'none',
                              cursor: country ? 'pointer' : 'default'
                            },
                            pressed: { outline: 'none' }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Floating Hover Tooltip */}
          {hoveredCountry && (
            <div
              className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-2 bg-popover/95 text-popover-foreground border border-border px-3 py-2 rounded-lg shadow-md backdrop-blur-xs text-xs whitespace-nowrap transition-all duration-75"
              style={{
                left: `${Math.max(80, Math.min(tooltipPos.x, 700))}px`,
                top: `${Math.max(40, tooltipPos.y - 12)}px`
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  icon={`circle-flags:${getCountryFlagCode(hoveredCountry)}`}
                  width={16}
                  height={16}
                  className="rounded-full shadow-2xs"
                />
                <span className="font-bold text-foreground">{hoveredCountry.name}</span>
                {hoveredCountry.rank && (
                  <span className="text-[10px] font-mono font-bold bg-primary-subtle text-primary px-1.5 py-0.2 rounded">
                    #{hoveredCountry.rank}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 text-muted-foreground font-mono text-[11px]">
                <span>Articles:</span>
                <span className="font-bold text-foreground">
                  {Number(hoveredCountry.article_count || 0).toLocaleString()}
                </span>
              </div>
              {hoveredCountry.article_count > 0 && totalWorldArticles > 0 && (
                <div className="flex items-center justify-between gap-4 text-muted-foreground font-mono text-[11px] mt-0.5">
                  <span>Global Share:</span>
                  <span className="font-semibold text-primary">
                    {((Number(hoveredCountry.article_count) / totalWorldArticles) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Activity Density Legend Bar */}
          <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                {t('zone.matDoXuatBan', 'Publication Density')}:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#e2e8f0' }} />
                  <span className="text-[10px]">0</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#bae6fd' }} />
                  <span className="text-[10px]">&lt;10K</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#7dd3fc' }} />
                  <span className="text-[10px]">10K-100K</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#38bdf8' }} />
                  <span className="text-[10px]">100K-1M</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#0284c7' }} />
                  <span className="text-[10px]">1M-5M</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="size-2.5 rounded-xs" style={{ backgroundColor: '#0369a1' }} />
                  <span className="text-[10px] font-semibold text-primary">&gt;5M</span>
                </div>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:mouse-pointer-click" width={12} />
              {t('zone.clickQuocGiaDeXem', 'Click any country to view articles')}
            </span>
          </div>
        </div>
      ) : (
        /* ================= CONTINENTAL / REGIONAL VIEW ================= */
        <div className="pt-3 space-y-3 flex-1 flex flex-col justify-around min-h-[460px]">
          {regionStats.map((reg) => {
            const isDominant = reg.percent > 20;

            return (
              <div
                key={reg.id}
                className="p-3 rounded-lg border border-border/80 bg-surface-muted/30 hover:bg-surface-muted/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="size-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${reg.color}15`, color: reg.color }}
                    >
                      <Icon icon={reg.icon} width={15} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground leading-tight truncate m-0">
                        {reg.name}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {reg.activeCountries} active nations
                        {reg.topCountry && ` · Leading: ${reg.topCountry.name}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {reg.totalArticles.toLocaleString()}
                    </span>
                    <span className="block text-[11px] font-mono font-semibold text-primary">
                      {reg.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="h-2 w-full rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(reg.percent, 1)}%`,
                      backgroundColor: reg.color
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
            <span>
              {t('zone.tongSanLuong', 'Total Output')}:{' '}
              <strong className="text-foreground font-mono">
                {totalWorldArticles.toLocaleString()}
              </strong>{' '}
              articles across all recorded jurisdictions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
