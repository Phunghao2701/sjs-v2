import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';

/**
 * Component CreateIssueModal - Cửa sổ Modal bật lên để Admin thêm Số phát hành (Issue) mới vào Volume đang chọn.
 * Khớp hoàn toàn với thiết kế Figma Hình 7.
 */
export default function CreateIssueModal({
  show,
  handleClose
}) {
  const { t: _t } = useTranslation();
  const {
    createIssue
  } = useJournalManagement();

  // Khởi tạo state cho Form dữ liệu Số phát hành
  const [formData, setFormData] = useState({
    issueName: '',
    issueNumber: '1',
    publicationYear: '2024'
  });

  // Quản lý thông báo lỗi validate dữ liệu bắt buộc điền
  const [errors, setErrors] = useState({});

  /** Theo dõi thay đổi chữ trong form */
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

  /** Hàm thực hiện bắt lỗi dữ liệu bỏ trống */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.issueName.trim()) {
      newErrors.issueName = t("admin.tenIssueKhongDuocDeTrong");
    }
    if (!formData.issueNumber.toString().trim()) {
      newErrors.issueNumber = t("admin.soIssueKhongDuocDeTrong");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Xử lý nhấn nút Tạo Issue */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createIssue({
        issueName: formData.issueName,
        issueNumber: formData.issueNumber,
        publicationYear: parseInt(formData.publicationYear, 10),
        status: 'Scheduled'
      });

      // Clean form và đóng pop-up
      setFormData({
        issueName: '',
        issueNumber: '1',
        publicationYear: '2024'
      });
      handleClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      const errorDetail = err.response?.data?.detail ? `\nChi tiết: ${err.response.data.detail}` : '';
      alert(t("Lỗi tạo Issue: ") + errorMsg + errorDetail);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="text-foreground">
      <Modal.Header closeButton className="border-b-0 pb-0">
        <Modal.Title className="font-display font-bold text-lg text-foreground">{t("admin.taoIssueMoi")}</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-3 text-left space-y-3">
          <p className="text-muted-foreground text-sm mb-3">{t("admin.dienThongTinChiTietDeBatDauMot")}</p>
          
          {/* Tên Issue */}
          <div>
            <label className="font-medium text-xs text-foreground block mb-1">
              {t("admin.tenIssue")}<span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              name="issueName"
              value={formData.issueName}
              onChange={handleChange}
              invalid={!!errors.issueName}
              placeholder={t("admin.viDuSpecialEditionOnAi")}
            />
            {errors.issueName && <p className="text-destructive text-xs mt-1">{errors.issueName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Số Issue */}
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("admin.soIssue")}<span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                name="issueNumber"
                value={formData.issueNumber}
                onChange={handleChange}
                invalid={!!errors.issueNumber}
                placeholder={t("admin.viDu1")}
              />
              {errors.issueNumber && <p className="text-destructive text-xs mt-1">{errors.issueNumber}</p>}
            </div>

            {/* Năm xuất bản */}
            <div>
              <label className="font-medium text-xs text-foreground block mb-1">
                {t("admin.namXuatBan")}
              </label>
              <Input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                placeholder={t("admin.2024")}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-t-0 pt-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="px-3">{t("admin.huy")}</Button>
          <Button type="submit" size="sm" className="px-3">{t("admin.taoIssue")}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
