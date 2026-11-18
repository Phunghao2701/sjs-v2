import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component AddJournalModal - Form cửa sổ bật lên để Admin khởi tạo một Tạp chí mới.
 */
export default function AddJournalModal({
  show,
  handleClose
}) {
  const { t } = useTranslation();
  const { addJournal } = useJournalManagement();

  const [formData, setFormData] = useState({
    title: '',
    issn: '',
    onlineIssn: '',
    publisher: '',
    subjectCategory: '',
    subjectArea: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("admin.tenTapChiKhongDuocDeTrong", "Tên tạp chí không được để trống");
    if (!formData.issn.trim()) newErrors.issn = t("admin.issnKhongDuocDeTrong", "ISSN không được để trống");
    if (!formData.publisher.trim()) newErrors.publisher = t("admin.nhaXuatBanKhongDuocDeTrong", "Nhà xuất bản không được để trống");
    if (!formData.subjectCategory) newErrors.subjectCategory = t("admin.vuiLongChonDanhMucNghienCuu", "Vui lòng chọn danh mục nghiên cứu");
    if (!formData.subjectArea.trim()) newErrors.subjectArea = t("admin.linhVucNghienCuuCuTheKhongDuoc", "Lĩnh vực nghiên cứu không được để trống");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addJournal(formData);
    setFormData({
      title: '',
      issn: '',
      onlineIssn: '',
      publisher: '',
      subjectCategory: '',
      subjectArea: ''
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-base font-semibold text-foreground">
          {t("journal.themTapChiMoi", "Thêm tạp chí mới")}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="mt-2">
        <Modal.Body className="py-4 space-y-4">
          {/* Tên Journal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              {t("journal.tenTapChiJournalTitle", "Tên tạp chí")}<span className="text-danger ml-0.5">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("journal.nhapTenChinhThucCuaTapChi", "Nhập tên chính thức của tạp chí...")}
              className={errors.title ? 'border-danger' : ''}
            />
            {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
          </div>

          {/* ISSN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                Print ISSN <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                name="issn"
                value={formData.issn}
                onChange={handleChange}
                placeholder={t("journal.viDu19374771", "Ví dụ: 1937-4771")}
                className={errors.issn ? 'border-danger' : ''}
              />
              {errors.issn && <p className="text-xs text-danger mt-1">{errors.issn}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                Online ISSN
              </label>
              <Input
                type="text"
                name="onlineIssn"
                value={formData.onlineIssn}
                onChange={handleChange}
                placeholder={t("journal.viDu1937478x", "Ví dụ: 1937-478X")}
              />
            </div>
          </div>

          {/* Nhà xuất bản */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              {t("admin.nhaXuatBanPublisher", "Nhà xuất bản")}<span className="text-danger ml-0.5">*</span>
            </label>
            <Input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder={t("journal.nhapTenNhaXuatBan", "Nhập tên nhà xuất bản...")}
              className={errors.publisher ? 'border-danger' : ''}
            />
            {errors.publisher && <p className="text-xs text-danger mt-1">{errors.publisher}</p>}
          </div>

          {/* Danh mục và Lĩnh vực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.danhMucSubjectCategory", "Danh mục")}<span className="text-danger ml-0.5">*</span>
              </label>
              <select
                name="subjectCategory"
                value={formData.subjectCategory}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-control border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary ${
                  errors.subjectCategory ? 'border-danger' : 'border-border'
                }`}
              >
                <option value="">{t("journal.chonDanhMuc", "-- Chọn danh mục --")}</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Environmental Science">Environmental Science</option>
                <option value="Medical Science">Medical Science</option>
                <option value="Social Sciences">Social Sciences</option>
              </select>
              {errors.subjectCategory && <p className="text-xs text-danger mt-1">{errors.subjectCategory}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.linhVucSubjectArea", "Lĩnh vực")}<span className="text-danger ml-0.5">*</span>
              </label>
              <Input
                type="text"
                name="subjectArea"
                value={formData.subjectArea}
                onChange={handleChange}
                placeholder={t("journal.viDuArtificialIntelligence", "Ví dụ: Artificial Intelligence")}
                className={errors.subjectArea ? 'border-danger' : ''}
              />
              {errors.subjectArea && <p className="text-xs text-danger mt-1">{errors.subjectArea}</p>}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            {t("journal.huyBo", "Hủy bỏ")}
          </Button>
          <Button type="submit" size="sm">
            {t("journal.taoTapChi", "Tạo tạp chí")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
