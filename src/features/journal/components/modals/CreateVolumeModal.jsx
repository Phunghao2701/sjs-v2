import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component CreateVolumeModal - Cửa sổ Modal bật lên để Admin tạo Tập (Volume) mới.
 */
export default function CreateVolumeModal({
  show,
  handleClose
}) {
  const { t } = useTranslation();
  const { createVolume } = useJournalManagement();

  const [formData, setFormData] = useState({
    volumeNumber: '',
    publicationYear: new Date().getFullYear(),
    frequency: 'Quarterly',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.volumeNumber.trim()) newErrors.volumeNumber = t("journal.soHieuVolumeKhongDuocTrongViDu", "Số hiệu Volume không được để trống");
    if (!formData.publicationYear) newErrors.publicationYear = t("journal.namXuatBanKhongDuocTrong", "Năm xuất bản không được để trống");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    createVolume({
      volumeNumber: formData.volumeNumber,
      publicationYear: parseInt(formData.publicationYear),
      frequency: formData.frequency,
      description: formData.description
    });

    setFormData({
      volumeNumber: '',
      publicationYear: new Date().getFullYear(),
      frequency: 'Quarterly',
      description: ''
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-base font-semibold text-foreground">
          {t("journal.taoTapMoiCreateNewVolume", "Tạo tập mới (Create New Volume)")}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="mt-2">
        <Modal.Body className="py-3 space-y-4">
          {/* Số hiệu Volume */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              {t("journal.soVolumeVolumeNumber", "Số Volume")}<span className="text-danger ml-0.5">*</span>
            </label>
            <Input
              type="text"
              name="volumeNumber"
              value={formData.volumeNumber}
              onChange={handleChange}
              placeholder={t("journal.viDuVolume3Volume4", "Ví dụ: Volume 3, Volume 4...")}
              className={errors.volumeNumber ? 'border-danger' : ''}
            />
            {errors.volumeNumber && <p className="text-xs text-danger mt-1">{errors.volumeNumber}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Năm xuất bản */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.namXuatBanPublicationYear", "Năm xuất bản")}<span className="text-danger ml-0.5">*</span>
              </label>
              <Input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                className={errors.publicationYear ? 'border-danger' : ''}
              />
              {errors.publicationYear && <p className="text-xs text-danger mt-1">{errors.publicationYear}</p>}
            </div>

            {/* Tần suất ra số */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.tanSuatXuatBanFrequency", "Tần suất xuất bản")}
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
              >
                <option value="Quarterly">{t("journal.hangQuyQuarterly", "Hàng quý (Quarterly)")}</option>
                <option value="Bi-annual">{t("journal.nuaNamMotLanBiannual", "Nửa năm một lần (Bi-annual)")}</option>
                <option value="Annual">{t("journal.hangNamAnnual", "Hàng năm (Annual)")}</option>
              </select>
            </div>
          </div>

          {/* Ghi chú nội bộ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              {t("journal.moTaGhiChuNoiBoInternalNotes", "Mô tả / Ghi chú nội bộ")}
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("journal.nhapCacGhiChuHoacMoTaNganGonVe", "Nhập mô tả ngắn gọn...")}
              className="flex w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            {t("admin.huy", "Hủy")}
          </Button>
          <Button type="submit" size="sm">
            {t("journal.taoVolume", "Tạo Volume")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
