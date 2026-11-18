import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournalManagement } from '../../journal/hooks/useJournalManagement';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { PageHeader } from '../../../shared/ui/page-layout';

export default function EditJournalPage() {
  const { t: _t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateJournal } = useJournalManagement();
  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  const [formData, setFormData] = useState({
    title: '',
    issn: '',
    onlineIssn: '',
    aimScope: '',
    visibility: 'Public',
    publisher: '',
    subjectCategory: '',
    subjectArea: ''
  });
  const [errors, setErrors] = useState({});
  const [publishers, setPublishers] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [zones, setZones] = useState({
    countryZoneId: 1,
    regionZoneId: 2
  });
  const [loadingDeps, setLoadingDeps] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      setLoadingDeps(true);
      try {
        const {
          getPublishersApi,
          getSubjectAreasApi,
          getSubjectCategoriesApi
        } = await import('../../journal/api/journalApi');
        const {
          getCountryStatsApi,
          getRegionStatsApi
        } = await import('../../zone/api/zone.api');
        const [pubRes, countryRes, regionRes, areaRes, catRes] = await Promise.all([
          getPublishersApi({ page: 1, limit: 100 }),
          getCountryStatsApi({ limit: 1 }),
          getRegionStatsApi({ limit: 1 }),
          getSubjectAreasApi({ page: 1, limit: 100 }),
          getSubjectCategoriesApi({ page: 1, limit: 100 })
        ]);
        const pubs = pubRes.data?.data?.items || pubRes.data?.data || pubRes.data || [];
        setPublishers(pubs);
        const countries = countryRes.data?.data?.items || countryRes.data?.data || [];
        const regions = regionRes.data?.data?.items || regionRes.data?.data || [];
        setZones({
          countryZoneId: countries[0]?.zone_id || countries[0]?.id || 1,
          regionZoneId: regions[0]?.zone_id || regions[0]?.id || 2
        });
        const areas = areaRes.data?.data?.items || areaRes.data?.data || areaRes.data || [];
        const cats = catRes.data?.data?.items || catRes.data?.data || catRes.data || [];
        setSubjectAreas(areas);
        setSubjectCategories(cats);
      } catch (e) {
        console.error("Error loading dependencies for EditJournalPage:", e);
      } finally {
        setLoadingDeps(false);
      }
    };
    loadDependencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleToggleVisibility = () => {
    setFormData(prev => ({
      ...prev,
      visibility: prev.visibility === 'Public' ? 'Private' : 'Public'
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("admin.tenTapChiKhongDuocDeTrong");
    if (!formData.issn.trim()) newErrors.issn = t("admin.maSoIssnKhongDuocDeTrong");
    if (!formData.subjectCategory) newErrors.subjectCategory = t("admin.vuiLongChonDanhMucChinh");
    if (!formData.subjectArea.trim()) newErrors.subjectArea = t("admin.linhVucNghienCuuCuTheKhongDuoc");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let formattedIssn = formData.issn.trim();
    if (/^\d{7}[\dX]$/i.test(formattedIssn.replace(/-/g, ''))) {
      const cleanIssn = formattedIssn.replace(/-/g, '');
      formattedIssn = cleanIssn.slice(0, 4) + '-' + cleanIssn.slice(4).toUpperCase();
    }

    let formattedOnlineIssn = formData.onlineIssn.trim();
    if (formattedOnlineIssn && /^\d{7}[\dX]$/i.test(formattedOnlineIssn.replace(/-/g, ''))) {
      const cleanOnline = formattedOnlineIssn.replace(/-/g, '');
      formattedOnlineIssn = cleanOnline.slice(0, 4) + '-' + cleanOnline.slice(4).toUpperCase();
    }

    const selectedPub = publishers.find(p => String(p.publisher_id || p.id) === String(formData.publisher));
    const payload = {
      display_name: formData.title,
      publisher_id: parseInt(formData.publisher),
      country: parseInt(zones.countryZoneId),
      region: parseInt(zones.regionZoneId),
      title: formData.title,
      issn: formattedIssn,
      onlineIssn: formattedOnlineIssn,
      aimScope: formData.aimScope,
      visibility: formData.visibility,
      subjectCategory: formData.subjectCategory,
      subjectArea: formData.subjectArea,
      publisher_name: selectedPub ? selectedPub.display_name : 'Trending System Press',
      publisher: formData.publisher
    };
    
    try {
      await updateJournal(id, payload);
      navigate(`${basePath}/journals`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert(t("admin.loiCapNhatTapChi") + " " + errorMsg);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left">
      <PageHeader
        breadcrumbs={[
          { label: 'Journals', to: `${basePath}/journals` },
          { label: 'Edit Journal' }
        ]}
        title="Edit Journal"
        description="Modify general information, editorial settings, and visibility for your journal."
      />

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8">
            <Card className="p-6 bg-surface border border-border rounded-xl shadow-2xs">
              <h5 className="font-display font-bold text-foreground border-b border-border pb-3 mb-4 text-base">
                General Information
              </h5>

              {/* Journal Title */}
              <div className="mb-4">
                <label className="font-medium text-xs text-foreground block mb-1.5">
                  Journal Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t("admin.egJournalOfComputerScience")}
                  className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary ${
                    errors.title ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              {/* ISSN inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-medium text-xs text-foreground block mb-1.5">
                    Print ISSN <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="issn"
                    value={formData.issn}
                    onChange={handleChange}
                    placeholder={t("admin.eg15493636")}
                    className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary ${
                      errors.issn ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.issn && <p className="text-destructive text-xs mt-1">{errors.issn}</p>}
                </div>
                <div>
                  <label className="font-medium text-xs text-foreground block mb-1.5">
                    Online ISSN
                  </label>
                  <input
                    type="text"
                    name="onlineIssn"
                    value={formData.onlineIssn}
                    onChange={handleChange}
                    placeholder={t("admin.eg1937478x")}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Aim & Scope */}
              <div>
                <label className="font-medium text-xs text-foreground block mb-1.5">
                  Aim and Scope
                </label>
                <textarea
                  rows={6}
                  name="aimScope"
                  value={formData.aimScope}
                  onChange={handleChange}
                  placeholder={t("admin.describeTheEditorialAimsScopes")}
                  className="w-full p-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary resize-y"
                />
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Visibility Card */}
            <Card className="p-6 bg-surface border border-border rounded-xl shadow-2xs">
              <h5 className="font-display font-bold text-foreground border-b border-border pb-3 mb-3 text-base">
                Visibility
              </h5>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-bold text-foreground text-sm mb-0.5">Publicly Listed</div>
                  <small className="text-muted-foreground text-xs">Visible in main index</small>
                </div>
                <input
                  type="checkbox"
                  id="visibility-switch"
                  checked={formData.visibility === 'Public'}
                  onChange={handleToggleVisibility}
                  className="rounded border-border text-primary focus:ring-0 cursor-pointer size-4"
                />
              </div>
            </Card>

            {/* Editorial Board Card */}
            <Card className="p-6 bg-surface border border-border rounded-xl shadow-2xs">
              <h5 className="font-display font-bold text-foreground border-b border-border pb-3 mb-4 text-base">
                Editorial Board
              </h5>

              {/* Publisher Select Dropdown */}
              <div className="mb-4">
                <label className="font-medium text-xs text-foreground block mb-1.5">
                  {t("admin.nhaXuatBanPublisher")}<span className="text-destructive">*</span>
                </label>
                <select
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                    errors.publisher ? 'border-destructive' : 'border-border'
                  }`}
                >
                  {loadingDeps ? (
                    <option>{t("admin.dangTaiDanhSachNhaXuatBan")}</option>
                  ) : publishers.length === 0 ? (
                    <option value="">{t("admin.khongCoNhaXuatBanNao")}</option>
                  ) : (
                    publishers.map(pub => (
                      <option key={pub.publisher_id || pub.id} value={pub.publisher_id || pub.id}>
                        {pub.display_name}
                      </option>
                    ))
                  )}
                </select>
                {errors.publisher && <p className="text-destructive text-xs mt-1">{errors.publisher}</p>}
              </div>

              {/* Category Selector */}
              <div className="mb-4">
                <label className="font-medium text-xs text-foreground block mb-1.5">
                  Broad Category <span className="text-destructive">*</span>
                </label>
                <select
                  name="subjectCategory"
                  value={formData.subjectCategory}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                    errors.subjectCategory ? 'border-destructive' : 'border-border'
                  }`}
                >
                  <option value="">-- Choose category --</option>
                  {Array.from(new Map(subjectCategories.map(cat => [cat.display_name || cat.name, cat])).values()).map(cat => (
                    <option key={cat.subject_category_id || cat.id || cat.display_name} value={cat.display_name || cat.name}>
                      {cat.display_name || cat.name}
                    </option>
                  ))}
                </select>
                {errors.subjectCategory && <p className="text-destructive text-xs mt-1">{errors.subjectCategory}</p>}
              </div>

              {/* Specific Research Area */}
              <div>
                <label className="font-medium text-xs text-foreground block mb-1.5">
                  Specific Research Area <span className="text-destructive">*</span>
                </label>
                <select
                  name="subjectArea"
                  value={formData.subjectArea}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                    errors.subjectArea ? 'border-destructive' : 'border-border'
                  }`}
                >
                  <option value="">-- Choose area --</option>
                  {Array.from(new Map(subjectAreas.map(area => [area.display_name || area.name, area])).values()).map(area => (
                    <option key={area.subject_area_id || area.id || area.display_name} value={area.display_name || area.name}>
                      {area.display_name || area.name}
                    </option>
                  ))}
                </select>
                {errors.subjectArea && <p className="text-destructive text-xs mt-1">{errors.subjectArea}</p>}
              </div>
            </Card>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button type="button" variant="outline" className="py-2 px-5" onClick={() => navigate(`${basePath}/journals`)}>
            Cancel Changes
          </Button>
          <Button type="submit" className="py-2 px-5">
            Update Journal
          </Button>
        </div>
      </form>
    </div>
  );
}
