import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useGeoDistribution } from '../hooks/useGeoDistribution';
import { mapFiltersToQueryParams } from '../services/globalEcosystem.service';
import apiClient from '../../../shared/api/axios';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';
import { Card } from '../../../../shared/ui/card';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive ISO 3166-1 alpha-2 → react-simple-maps country name mapping
const NAME_MAP = {
  'US': 'United States of America',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'VN': 'Vietnam',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'South Korea',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'PT': 'Portugal',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'RO': 'Romania',
  'HU': 'Hungary',
  'GR': 'Greece',
  'IE': 'Ireland',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'TR': 'Turkey',
  'IN': 'India',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'CA': 'Canada',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
  'IR': 'Iran',
  'IQ': 'Iraq',
};

const REVERSE_NAME_MAP = Object.entries(NAME_MAP).reduce((acc, [code, name]) => {
  if (!acc[name]) acc[name] = code;
  return acc;
}, {});

// Register country aliases
REVERSE_NAME_MAP['United States'] = 'US';
REVERSE_NAME_MAP['United States of America'] = 'US';
REVERSE_NAME_MAP['USA'] = 'US';
REVERSE_NAME_MAP['South Korea'] = 'KR';
REVERSE_NAME_MAP['Korea'] = 'KR';
REVERSE_NAME_MAP['Russian Federation'] = 'RU';
REVERSE_NAME_MAP['Russia'] = 'RU';
REVERSE_NAME_MAP['Viet Nam'] = 'VN';
REVERSE_NAME_MAP['Vietnam'] = 'VN';
REVERSE_NAME_MAP['United Arab Emirates'] = 'AE';
REVERSE_NAME_MAP['UAE'] = 'AE';
REVERSE_NAME_MAP['United Kingdom'] = 'GB';
REVERSE_NAME_MAP['UK'] = 'GB';

const INTENSITY_COLORS = {
  PEAK: '#005A96',
  HIGH: '#0071BC',
  MEDIUM: '#3393CB',
  LOW: '#66B1D9'
};

const getIntensityColor = (intensity) => {
  if (typeof intensity === 'number') {
    if (intensity > 80) return '#005A96';
    if (intensity > 60) return '#0071BC';
    if (intensity > 40) return '#3393CB';
    return '#66B1D9';
  }
  return INTENSITY_COLORS[String(intensity)?.toUpperCase()] || '#6B7280';
};

export default function GlobalHeatMapSection({
  selectedCountryCode = '',
  onCountryChange,
}) {
  const { t } = useTranslation();
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [allZones, setAllZones] = useState({ regions: [], countries: [] });
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load all system zones/countries for complete dropdown selection
  useEffect(() => {
    let isMounted = true;
    apiClient.get('/analytics/zones')
      .then(res => {
        if (!isMounted) return;
        const data = res?.data?.data || res?.data || { regions: [], countries: [] };
        setAllZones(data);
      })
      .catch(err => console.error('Failed to fetch zones for heatmap:', err));
    return () => { isMounted = false; };
  }, []);

  const queryParams = mapFiltersToQueryParams(filters);
  const regionalQueryParams = useMemo(() => ({
    ...queryParams,
    country: selectedCountryCode
  }), [queryParams, selectedCountryCode]);

  const { data: mapData, isLoading: isGeoLoading, error: geoError } = useGeoDistribution(projectId, queryParams, refreshTrigger);
  const { data: regionalData, isFetching: isRegionalLoading } = useGeoDistribution(
    projectId,
    regionalQueryParams,
    refreshTrigger,
    { enabled: Boolean(selectedCountryCode) }
  );

  // When selected country code is active, regional data is passed via props 'data'
  const isRegionMode = Boolean(selectedCountryCode);

  // Sync selected country code when filters.zone changes
  useEffect(() => {
    if (!filters.zone || filters.zone === 'Global Distribution') {
      onCountryChange('');
      return;
    }

    const normalized = String(filters.zone).trim();
    let foundCode = REVERSE_NAME_MAP[normalized];

    if (!foundCode && Array.isArray(allZones?.countries)) {
      const match = allZones.countries.find(
        c => c.name.toLowerCase() === normalized.toLowerCase() || c.code.toLowerCase() === normalized.toLowerCase()
      );
      if (match) foundCode = match.code;
    }

    if (!foundCode && normalized.length === 2) {
      foundCode = normalized.toUpperCase();
    }

    if (foundCode) {
      onCountryChange(foundCode);
    } else {
      // If zone is a Region (e.g. 'Western Europe'), clear specific country so regional view is shown
      onCountryChange('');
    }
  }, [filters.zone, allZones]);

  // Parse global distribution list
  const heatMapData = useMemo(() => {
    if (!mapData) return {};
    return mapData.reduce((acc, item) => {
      const code = item.countryCode || item.country;
      const name = NAME_MAP[code] || item.countryName || code;
      const dataObj = {
        intensity: item.intensity,
        count: item.count,
        intensityLabel: item.intensityLabel
      };
      if (name) acc[name] = dataObj;
      if (code) acc[code] = dataObj;
      return acc;
    }, {});
  }, [mapData]);

  // Extract comprehensive country options for dropdown selector
  const availableCountries = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (Array.isArray(allZones?.countries)) {
      for (const c of allZones.countries) {
        if (!seen.has(c.code)) {
          seen.add(c.code);
          list.push({ code: c.code, name: c.name || NAME_MAP[c.code] || c.code });
        }
      }
    }

    if (Array.isArray(mapData)) {
      for (const item of mapData) {
        const code = item.countryCode || item.country;
        if (code && !seen.has(code)) {
          seen.add(code);
          list.push({ code, name: NAME_MAP[code] || item.countryName || code });
        }
      }
    }

    for (const [code, name] of Object.entries(NAME_MAP)) {
      if (!seen.has(code)) {
        seen.add(code);
        list.push({ code, name });
      }
    }

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allZones, mapData]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery || searchQuery === selectedCountryName) return availableCountries;
    const q = searchQuery.toLowerCase().trim();
    return availableCountries.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [availableCountries, searchQuery, selectedCountryName]);

  const currentCountryData = useMemo(() => {
    if (!selectedCountryCode && !selectedCountryName) return null;
    return heatMapData[selectedCountryCode] || heatMapData[selectedCountryName] || null;
  }, [selectedCountryCode, selectedCountryName, heatMapData]);

  // Sync state with parent country code parameter
  useEffect(() => {
    if (selectedCountryCode) {
      const match = availableCountries.find(c => c.code === selectedCountryCode);
      const name = match?.name || NAME_MAP[selectedCountryCode] || selectedCountryCode;
      setSelectedCountryName(name);
      setSearchQuery(name);
    } else {
      setSelectedCountryName('');
      setSearchQuery('');
    }
  }, [selectedCountryCode, availableCountries]);

  const getFillColor = (geoName) => {
    const code = REVERSE_NAME_MAP[geoName];
    if (selectedCountryCode && (code === selectedCountryCode || geoName === selectedCountryName)) {
      return '#005A96'; // Highlight selected country
    }
    const item = heatMapData[geoName] || (code && heatMapData[code]);
    if (!item?.intensity || !item?.count) return '#444F5D'; // Dark slate blue/gray for countries without data
    return getIntensityColor(item.intensity);
  };

  const handleCountryClick = (geo) => {
    const geoName = geo.properties.name;
    const alpha2 = REVERSE_NAME_MAP[geoName];
    if (!alpha2) return;

    if (selectedCountryCode === alpha2) {
      onCountryChange('');
    } else {
      onCountryChange(alpha2);
    }
  };

  const handleReset = () => {
    onCountryChange('');
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      onCountryChange('');
      return;
    }
    const match = availableCountries.find(
      c => c.code.toLowerCase() === query || c.name.toLowerCase().includes(query)
    );
    if (match) {
      onCountryChange(match.code);
    }
  };

  // Find max count for rendering progress track percentages
  const maxRegionCount = useMemo(() => {
    if (!isRegionMode || !Array.isArray(regionalData) || regionalData.length === 0) return 0;
    return Math.max(...regionalData.map(item => Number(item.count) || 0));
  }, [regionalData, isRegionMode]);

  if (isGeoLoading) {
    return (
      <Card className="world-heatmap-container dashboard-card bg-surface border-border shadow-card rounded-card p-5">
        <LoadingSkeleton height="500px" />
      </Card>
    );
  }

  if (geoError) {
    return (
      <Card className="world-heatmap-container dashboard-card bg-surface border-border shadow-card rounded-card p-5">
        <InlineErrorState 
          message={t('dashboard.mapError', 'Failed to load geographical map')}
          onRetry={refreshData}
        />
      </Card>
    );
  }

  return (
    <Card className="world-heatmap-container dashboard-card bg-surface border-border shadow-card rounded-card p-5">
      <div className="world-heatmap-header">
        <div>
          <h2 className="world-heatmap-title">{t('dashboard.geoHeatMap', 'Geographical Heat Map')}</h2>
          <p className="world-heatmap-subtitle">
            {selectedCountryCode
              ? `${t('dashboard.viewingDetails', 'Viewing details')}: ${selectedCountryName}`
              : t('dashboard.geoHeatMapSub', 'Global research output intensity by jurisdiction')}
          </p>
        </div>
        <div className="world-heatmap-actions" ref={dropdownRef} style={{ position: 'relative' }}>
          <div className="country-search-wrapper" style={{ minWidth: '240px' }}>
            <FiSearch className="search-icon" onClick={handleSearchSubmit} style={{ cursor: 'pointer' }} />
            <input
              type="text"
              placeholder={t('dashboard.searchCountry', 'Search country...')}
              className="country-search-input"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                  setIsDropdownOpen(false);
                }
              }}
            />
            {selectedCountryCode && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleReset}
                title="Clear selection"
              >
                <FiX />
              </button>
            )}
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              title="Toggle list"
              tabIndex={-1}
            >
              <FiChevronDown style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>
          </div>

          {isDropdownOpen && (
            <div
              className="country-dropdown-menu"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                width: '100%',
                minWidth: '240px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                zIndex: 100,
                padding: '4px'
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: !selectedCountryCode ? '#38bdf8' : '#e2e8f0',
                  fontWeight: !selectedCountryCode ? '600' : '400',
                  background: !selectedCountryCode ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                }}
                onClick={() => {
                  onCountryChange('');
                  setIsDropdownOpen(false);
                }}
              >
                {t('dashboard.allCountries', 'All Countries (Global)')}
              </div>
              {filteredCountries.map((c) => {
                const isSelected = selectedCountryCode === c.code;
                return (
                  <div
                    key={c.code}
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: isSelected ? '#38bdf8' : '#cbd5e1',
                      fontWeight: isSelected ? '600' : '400',
                      background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      onCountryChange(c.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>{c.code}</span>
                  </div>
                );
              })}
              {filteredCountries.length === 0 && (
                <div style={{ padding: '8px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                  No country found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="world-heatmap-content">
        <div className="map-wrapper" style={{ position: 'relative' }}>
          <ComposableMap
            projection="geoEqualEarth"
            className="react-simple-map"
            width={800}
            height={450}
            projectionConfig={{
              scale: 160,
              center: [0, 0]
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name;
                  const alpha2 = REVERSE_NAME_MAP[geoName];
                  const isSelected = selectedCountryCode && alpha2 === selectedCountryCode;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={`global-heatmap-country${isSelected ? ' is-selected' : ''}`}
                      stroke="#2B333F"
                      strokeWidth={0.5}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        '--geo-fill': getFillColor(geoName),
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Top-Right Info Card Overlay */}
          {selectedCountryCode && selectedCountryName && (
            <div className="country-detail-card font-sans">
              <div className="country-detail-header">
                <div className="country-detail-flag-code">{selectedCountryCode}</div>
                <button
                  className="country-detail-close"
                  onClick={handleReset}
                  aria-label="Close details"
                >
                  <FiX />
                </button>
              </div>
              <div className="country-detail-name">{selectedCountryName}</div>
              <div className="country-detail-divider"></div>

              {/* National Summary Stats */}
              <div
                className="country-summary-stats"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  marginBottom: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', fontWeight: 600 }}>Total Output</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {currentCountryData?.count ? currentCountryData.count.toLocaleString() : '0 papers'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', fontWeight: 600 }}>Activity Density</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginTop: '2px',
                      backgroundColor: currentCountryData?.intensity
                        ? getIntensityColor(currentCountryData.intensity)
                        : '#475569',
                      color: '#ffffff'
                    }}
                  >
                    {currentCountryData?.intensityLabel || (currentCountryData?.count > 0 ? 'Active' : 'No Data')}
                  </span>
                </div>
              </div>

              {(isRegionalLoading && selectedCountryCode !== '') ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <div className="province-spinner"></div>
                  <span className="text-xs text-neutral-400">{t('dashboard.loadingRegionalDetails', 'Loading regional details...')}</span>
                </div>
              ) : (!regionalData || regionalData.length === 0) ? (
                <div className="py-4 text-center text-xs text-neutral-400">
                  {t('dashboard.noRegionalData', 'No regional data found for this country.')}
                </div>
              ) : (
                <div className="region-map-list-preview max-h-56 overflow-y-auto pr-1">
                  {regionalData.map((item, index) => {
                    const color = getIntensityColor(item.intensityLabel || item.intensity);
                    const percentage = maxRegionCount
                      ? Math.max(6, ((Number(item.count) || 0) / maxRegionCount) * 100)
                      : 6;

                    return (
                      <div className="region-map-mini-row" key={item.regionCode || index}>
                        <div className="region-map-mini-label">
                          <span title={item.regionName || item.regionCode}>
                            {item.regionName || item.regionCode || 'Unknown'}
                          </span>
                          <small>{item.count?.toLocaleString() || 0}</small>
                        </div>
                        <div className="region-map-mini-track">
                          <div
                            className="region-map-mini-fill"
                            style={{
                              width: `${percentage}%`,
                              background: color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="country-detail-hint">Click close or click country to deselect</p>
            </div>
          )}

          <div className="activity-density-legend">
            <span className="legend-title">ACTIVITY DENSITY</span>
            <div className="legend-gradient">
              <div className="gradient-step" style={{ background: '#66B1D9' }}></div>
              <div className="gradient-step" style={{ background: '#3393CB' }}></div>
              <div className="gradient-step" style={{ background: '#0071BC' }}></div>
              <div className="gradient-step" style={{ background: '#005A96' }}></div>
            </div>
            <div className="legend-labels">
              <span>LOW</span>
              <span>PEAK</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
