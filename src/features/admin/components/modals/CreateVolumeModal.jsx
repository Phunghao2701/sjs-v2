import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';

/**
 * Component CreateVolumeModal - Cửa sổ Modal bật lên để Admin tạo Tập (Volume) mới.
 * Đáp ứng thiết kế Figma Hình 9.
 */
export default function CreateVolumeModal({
  show,
  handleClose
}) {
  const { t } = useTranslation();
  const { createVolume } = useJournalManagement();

  // Trạng thái quản lý dữ liệu nhập vào của Form
  const [formData, setFormData] = useState({
    volumeNumber: '',
    publicationYear: '2024',
    frequency: 'Quarterly',
    totalExpectedIssues: '4',
    description: ''
  });

  // Quản lý thông báo hiển thị lỗi validate chữ đỏ
  const [errors, setErrors] = useState({});

  /** Xử lý cập nhật text liên tục khi gõ */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /** Kiểm tra dữ liệu Form hợp lệ trước khi submit */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.volumeNumber.trim()) {
      newErrors.volumeNumber = 'Volume number is required';
    }
    if (!formData.publicationYear) {
      newErrors.publicationYear = 'Publication year is required';
    }
    if (!formData.totalExpectedIssues || isNaN(formData.totalExpectedIssues) || parseInt(formData.totalExpectedIssues) <= 0) {
      newErrors.totalExpectedIssues = 'Total expected issues must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Xử lý lưu mảng dữ liệu cục bộ */
  const handleSubmit = e => {
    e.preventDefault();
    if (!validateForm()) return;
    createVolume({
      volumeNumber: formData.volumeNumber,
      publicationYear: parseInt(formData.publicationYear, 10),
      frequency: formData.frequency,
      totalExpectedIssues: parseInt(formData.totalExpectedIssues, 10),
      description: formData.description,
      totalIssues: 0,
      totalArticles: 0
    });

    // Reset sạch form và đóng modal
    setFormData({
      volumeNumber: '',
      publicationYear: '2024',
      frequency: 'Quarterly',
      totalExpectedIssues: '4',
      description: ''
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="text-foreground">
      <Modal.Header closeButton className="border-b-0 pb-0">
        <Modal.Title className="font-display font-bold text-lg text-foreground">Create New Volume</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-left space-y-3">
          {/* Row 1: Volume Number & Publication Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                Volume Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                name="volumeNumber"
                value={formData.volumeNumber}
                onChange={handleChange}
                invalid={!!errors.volumeNumber}
                placeholder={t("admin.egVolume15")}
              />
              {errors.volumeNumber && <p className="text-destructive text-xs mt-1">{errors.volumeNumber}</p>}
            </div>

            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                Publication Year <span className="text-destructive">*</span>
              </label>
              <select
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-lg border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer ${
                  errors.publicationYear ? 'border-destructive' : 'border-border'
                }`}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
              {errors.publicationYear && <p className="text-destructive text-xs mt-1">{errors.publicationYear}</p>}
            </div>
          </div>

          {/* Row 2: Frequency & Total Expected Issues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-annual">Bi-annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                Total Expected Issues <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                name="totalExpectedIssues"
                value={formData.totalExpectedIssues}
                onChange={handleChange}
                invalid={!!errors.totalExpectedIssues}
                placeholder={t("admin.eg4")}
              />
              {errors.totalExpectedIssues && <p className="text-destructive text-xs mt-1">{errors.totalExpectedIssues}</p>}
            </div>
          </div>

          {/* Row 3: Description / Internal Notes */}
          <div>
            <label className="font-medium text-xs text-foreground block mb-1">
              Description / Internal Notes
            </label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("admin.enterAdministrativeNotesOrVolu")}
              className="w-full p-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="border-t-0 pt-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="px-3">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="px-3">
            Create Volume
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
