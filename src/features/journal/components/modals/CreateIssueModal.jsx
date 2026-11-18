import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component CreateIssueModal - Cửa sổ Modal bật lên để Admin thêm Số phát hành (Issue) mới vào Volume đang chọn.
 */
export default function CreateIssueModal({
  show,
  handleClose
}) {
  const { t } = useTranslation();
  const { createIssue } = useJournalManagement();

  const [formData, setFormData] = useState({
    issueName: '',
    issueNumber: '',
    publicationYear: new Date().getFullYear()
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
    if (!formData.issueName.trim()) newErrors.issueName = t("journal.tenSoPhatHanhKhongDuocDeTrong", "Tên số phát hành không được để trống");
    if (!formData.issueNumber.trim()) newErrors.issueNumber = t("journal.soHieuDinhDanhKhongDuocTrongVi", "Số hiệu định danh không được trống");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    createIssue({
      issueName: formData.issueName,
      issueNumber: formData.issueNumber,
      publicationYear: parseInt(formData.publicationYear)
    });

    setFormData({
      issueName: '',
      issueNumber: '',
      publicationYear: new Date().getFullYear()
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-base font-semibold text-foreground">
          {t("journal.taoSoPhatHanhMoiCreateNewIssue", "Tạo số phát hành mới")}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit} className="mt-2">
        <Modal.Body className="py-3 space-y-4">
          {/* Tên tiêu đề số / Tên Issue */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground">
              {t("journal.tenIssueIssueName", "Tên số phát hành (Issue Name)")}<span className="text-danger ml-0.5">*</span>
            </label>
            <Input
              type="text"
              name="issueName"
              value={formData.issueName}
              onChange={handleChange}
              placeholder={t("journal.viDuSpecialIssueOnAppliedDeepL", "Ví dụ: Special Issue on Applied Deep Learning")}
              className={errors.issueName ? 'border-danger' : ''}
            />
            {errors.issueName && <p className="text-xs text-danger mt-1">{errors.issueName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Số hiệu định vị số (Issue Number) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.soDinhDanhIssueNumber", "Số hiệu (Issue Number)")}<span className="text-danger ml-0.5">*</span>
              </label>
              <Input
                type="text"
                name="issueNumber"
                value={formData.issueNumber}
                onChange={handleChange}
                placeholder={t("journal.viDuNo1No2Vol3No1", "Ví dụ: No. 1, No. 2...")}
                className={errors.issueNumber ? 'border-danger' : ''}
              />
              {errors.issueNumber && <p className="text-xs text-danger mt-1">{errors.issueNumber}</p>}
            </div>

            {/* Năm phát hành */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-foreground">
                {t("journal.namPhatHanhPublicationYear", "Năm phát hành")}
              </label>
              <Input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            {t("journal.huyBo", "Hủy bỏ")}
          </Button>
          <Button type="submit" size="sm">
            {t("admin.taoIssue", "Tạo Issue")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
