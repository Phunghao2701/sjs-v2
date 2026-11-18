import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useZoneStats from '../hooks/useZoneStats';
import { getCountryArticlesApi } from '../api/zone.api';
import GeographyWorldMap from '../components/GeographyWorldMap';
import GeographyRankingTable from '../components/GeographyRankingTable';
import GeographyArticleList from '../components/GeographyArticleList';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import { useAuthStore } from '../../../app/store/authStore';
import { isAuthenticated as checkAuthSession } from '../../../shared/utils/auth';
import { Alert } from '../../../shared/ui/alert';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import './GeographyPage.css';

export default function GeographyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticatedState = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuthSession();
  }, []);

  const {
    countryStats,
    loadingCountries,
    errorCountries,
    fetchCountryStats,
  } = useZoneStats();

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedYear, setSelectedYear] = useState('All');

  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [articlesPage, setArticlesPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const articlesRef = useRef(null);

  useEffect(() => {
    fetchCountryStats({
      limit: 1000,
      year: selectedYear === 'All' ? undefined : selectedYear,
    });
  }, [selectedYear, fetchCountryStats]);

  const fetchArticles = useCallback(async (countryId, pageNum, yearFilter) => {
    setLoadingArticles(true);
    try {
      const params = {
        page: pageNum,
        limit: 10,
      };
      if (yearFilter && yearFilter !== 'All') {
        params.publication_year = Number(yearFilter);
      }
      const res = await getCountryArticlesApi(countryId, params);
      if (res.data && res.data.success !== false) {
        const resData = res.data.data || {};
        setArticles(resData.articles || resData.items || []);
        if (resData.pagination) {
          setTotalArticles(resData.pagination.total || 0);
          setTotalPages(resData.pagination.total_pages || 1);
        }
      }
    } catch (err) {
      console.error(t("zone.loiKhiLayDanhSachBaiBaoCuaQuoc"), err);
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    } finally {
      setLoadingArticles(false);
    }
  }, [t]);

  useEffect(() => {
    if (selectedCountry) {
      fetchArticles(selectedCountry.zone_id, articlesPage, selectedYear);
    } else {
      setArticles([]);
      setTotalArticles(0);
      setTotalPages(1);
    }
  }, [selectedCountry, articlesPage, selectedYear, fetchArticles]);

  const handleSelectCountry = (country) => {
    if (selectedCountry?.zone_id === country.zone_id) {
      setSelectedCountry(null);
      setArticlesPage(1);
    } else {
      setSelectedCountry(country);
      setArticlesPage(1);
      setTimeout(() => {
        articlesRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  const handleDetailClick = (id) => {
    if (!isAuthenticatedState) {
      setShowAuthModal(true);
    } else {
      navigate(`/articles/${id}/visual`);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Workspace", to: "/dashboard" },
          { label: t("zone.phanBoDiaLy", "Geography") }
        ]}
        badge={
          <Badge variant="info" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <Icon icon="lucide:globe" width="14" />
            <span>Worldwide Output</span>
          </Badge>
        }
        title={t("zone.phanBoTapChiTheoQuocGia", "Geographic Distribution of Publications")}
        description={t("zone.xemThongKeSoLuongAnPhamKhoaHoc", "Explore worldwide scientific publication volume, top-producing nations, and country rankings.")}
        actions={
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {t("article.namXuatBan", "Publication Year")}
            </span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setArticlesPage(1);
              }}
              className="h-9 rounded-control border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
            >
              <option value="All">{t("zone.tatCaCacNam", "All Years")}</option>
              {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        }
      />

        {/* Error handling for countries */}
        {errorCountries && (
          <Alert variant="destructive" className="mb-6 items-center">
            <div className="flex-1">
              <strong className="block text-sm font-semibold">{t("zone.loiTaiDuLieu")}</strong>
              <span className="text-xs">{errorCountries}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                fetchCountryStats({
                  limit: 1000,
                  year: selectedYear === 'All' ? undefined : selectedYear,
                })
              }
            >
              {t("article.thuLai")}
            </Button>
          </Alert>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 xl:col-span-8 min-w-0">
            <GeographyWorldMap
              data={countryStats}
              loading={loadingCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              selectedYear={selectedYear}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4 min-w-0">
            <GeographyRankingTable
              data={countryStats}
              loading={loadingCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </div>
        </div>

        {/* Selected Country Articles List */}
        {selectedCountry && (
          <div className="mt-6" ref={articlesRef}>
            <GeographyArticleList
              articles={articles}
              loading={loadingArticles}
              total={totalArticles}
              page={articlesPage}
              totalPages={totalPages}
              onPageChange={setArticlesPage}
              onDetailClick={handleDetailClick}
              countryName={selectedCountry.name}
              onClose={() => setSelectedCountry(null)}
            />
          </div>
        )}

        {/* Login guard modal */}
        <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
      </PageContainer>
    );
  }
