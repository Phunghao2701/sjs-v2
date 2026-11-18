import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

export default function AddJournalModal({
  show,
  handleClose
}) {
  const { t: _t } = useTranslation();
  const {
    addJournal
  } = useJournalManagement();
  const [formData, setFormData] = useState({
    title: '',
    issn: '',
    onlineIssn: '',
    publisher: '',
    subjectCategory: '',
    subjectArea: '',
    aimScope: '',
    visibility: 'Public',
    broadCategory: 'Technology',
    specificResearchArea: ''
  });
  const [publishers, setPublishers] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [zones, setZones] = useState({
    countryZoneId: 1,
    regionZoneId: 2
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      const loadData = async () => {
        setLoading(true);
        try {
          const {
            getPublishersApi,
            getSubjectAreasApi,
            getSubjectCategoriesApi
          } = await import('../../../journal/api/journalApi');
          const {
            getCountryStatsApi,
            getRegionStatsApi
          } = await import('../../../zone/api/zone.api');
          const [pubRes, countryRes, regionRes, areaRes, catRes] = await Promise.all([
            getPublishersApi({ page: 1, limit: 5000 }),
            getCountryStatsApi({ limit: 1 }),
            getRegionStatsApi({ limit: 1 }),
            getSubjectAreasApi({ page: 1, limit: 5000 }),
            getSubjectCategoriesApi({ page: 1, limit: 5000 })
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
          if (pubs.length > 0 && !formData.publisher) {
            setFormData(prev => ({
              ...prev,
              publisher: pubs[0].publisher_id || pubs[0].id
            }));
          }
        } catch (e) {
          console.error("Error loading dependencies for AddJournalModal:", e);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [show]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("admin.tenTapChiKhongDuocDeTrong");
    if (!formData.issn.trim()) newErrors.issn = t("admin.maSoIssnKhongDuocDeTrong");
    if (!formData.publisher) newErrors.publisher = t("admin.vuiLongChonNhaXuatBan");
    if (!formData.subjectCategory) newErrors.subjectCategory = t("admin.vuiLongChonDanhMucChinh");
    if (!formData.subjectArea) newErrors.subjectArea = t("admin.linhVucNghienCuuCuTheKhongDuoc");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const selectedPub = publishers.find(p => String(p.publisher_id || p.id) === String(formData.publisher));
      const payload = {
        display_name: formData.title,
        publisher_id: parseInt(formData.publisher),
        country: parseInt(zones.countryZoneId),
        region: parseInt(zones.regionZoneId),
        title: formData.title,
        issn: formData.issn,
        onlineIssn: formData.onlineIssn,
        aimScope: formData.aimScope,
        visibility: formData.visibility,
        subjectCategory: formData.subjectCategory,
        subjectArea: formData.subjectArea,
        publisher_name: selectedPub ? selectedPub.display_name : 'Trending System Press'
      };
      await addJournal(payload);
      setFormData({
        title: '',
        issn: '',
        onlineIssn: '',
        publisher: publishers[0]?.publisher_id || publishers[0]?.id || '',
        subjectCategory: '',
        subjectArea: '',
        aimScope: '',
        visibility: 'Public',
        broadCategory: 'Technology',
        specificResearchArea: ''
      });
      handleClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      const errorDetail = err.response?.data?.detail ? `\nChi tiết: ${err.response.data.detail}` : '';
      alert(t("admin.loiTaoTapChi") + " " + errorMsg + errorDetail);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="text-foreground">
      <Modal.Header closeButton className="border-b-0 pb-0">
        <Modal.Title className="font-display font-bold text-xl text-foreground">{t("admin.themJournalMoi")}</Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-4 text-left space-y-4">
          {/* Tên Journal */}
          <div>
            <label className="font-medium text-xs text-foreground block mb-1">
              {t("admin.tenJournal")}<span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              invalid={!!errors.title}
              placeholder={t("admin.nhapTenJournalDayDu")}
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Row 2: Mã ISSN & Danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("admin.maIssn")}<span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                name="issn"
                value={formData.issn}
                onChange={handleChange}
                invalid={!!errors.issn}
                placeholder={t("admin.viDu12345678")}
              />
              {errors.issn && <p className="text-destructive text-xs mt-1">{errors.issn}</p>}
            </div>
            
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("typeCategory")}<span className="text-destructive">*</span>
              </label>
              <select
                name="subjectCategory"
                value={formData.subjectCategory}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                  errors.subjectCategory ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">{t("admin.chonDanhMuc")}</option>
                {Array.from(new Map(subjectCategories.map(cat => {
                  const catName = cat.display_name || cat.name || cat.category_name || String(cat.id);
                  return [catName, { ...cat, _catName: catName }];
                })).values()).map(cat => (
                  <option key={cat.subject_category_id || cat.id || cat._catName} value={cat._catName}>
                    {cat._catName}
                  </option>
                ))}
              </select>
              {errors.subjectCategory && <p className="text-destructive text-xs mt-1">{errors.subjectCategory}</p>}
            </div>
          </div>

          {/* Row 3: Nhà xuất bản & Lĩnh vực nghiên cứu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("admin.nhaXuatBan")}<span className="text-destructive">*</span>
              </label>
              <select
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                  errors.publisher ? 'border-destructive' : 'border-border'
                }`}
              >
                {loading ? (
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
            
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("typeArea")}<span className="text-destructive">*</span>
              </label>
              <select
                name="subjectArea"
                value={formData.subjectArea}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                  errors.subjectArea ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="">{t("admin.chonLinhVuc")}</option>
                {Array.from(new Map(subjectAreas.map(area => {
                  const areaName = area.display_name || area.name || area.subject_area_name || String(area.id);
                  return [areaName, { ...area, _areaName: areaName }];
                })).values()).map(area => (
                  <option key={area.subject_area_id || area.id || area._areaName} value={area._areaName}>
                    {area._areaName}
                  </option>
                ))}
              </select>
              {errors.subjectArea && <p className="text-destructive text-xs mt-1">{errors.subjectArea}</p>}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-t-0 pt-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="px-4">{t("admin.huy")}</Button>
          <Button type="submit" size="sm" className="px-4">
            + Create Journal
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
