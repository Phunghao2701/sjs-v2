import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from '../../../shared/ui/modal';
import { Button, Spinner } from '../../../shared/ui/button';
import { Alert } from '../../../shared/ui/alert';
import { Input } from '../../../shared/ui/input';
import { getProjectsApi, createProjectApi, getProjectByIdApi, updateProjectApi } from '../../project/api/project.api';

export default function AddToProjectModal({
  show,
  onHide,
  journalId,
  onConfirm
}) {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [mode, setMode] = useState('select'); // 'select' | 'create'
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(false);
      setSelectedProjectId('');
      setNewProjectTitle('');
      setMode('select');
      fetchUserProjects();
    }
  }, [show]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjectsApi();
      const list = res.data?.data?.items || res.data?.data || res.data || [];
      const validList = Array.isArray(list) ? list : [];
      setProjects(validList);
      if (validList.length > 0) {
        setSelectedProjectId(validList[0].project_id || '');
      } else {
        setMode('create');
      }
    } catch {
      setError(t("journal.khongTheTaiDanhSachDuAn", "Không thể tải danh sách dự án"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let targetProjectId = selectedProjectId;

      if (mode === 'create') {
        if (!newProjectTitle.trim()) {
          setError(t("journal.vuiLongNhapTenDuAn", "Vui lòng nhập tên dự án"));
          setSubmitting(false);
          return;
        }
        const createRes = await createProjectApi({
          title: newProjectTitle.trim(),
          description: `Project containing journal #${journalId}`,
        });
        const createdProject = createRes.data?.data || createRes.data;
        targetProjectId = createdProject?.project_id || createdProject?.id;
      }

      if (!targetProjectId) {
        throw new Error(t("journal.khongXacDinhDuocDuAn", "Không xác định được dự án"));
      }

      const pRes = await getProjectByIdApi(targetProjectId);
      const pData = pRes.data?.data || pRes.data;
      const currentJournals = Array.isArray(pData?.journal_ids)
        ? pData.journal_ids
        : [];

      if (!currentJournals.includes(Number(journalId))) {
        await updateProjectApi(targetProjectId, {
          journal_ids: [...currentJournals, Number(journalId)],
        });
      }

      setSuccess(true);
      setTimeout(() => {
        if (onConfirm) onConfirm(targetProjectId);
        onHide();
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t("journal.coLoiXayRaKhiLuuVaoDuAn", "Có lỗi xảy ra khi lưu vào dự án"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Icon icon="lucide:folder-plus" className="text-primary h-5 w-5" />
          <span>{t("journal.themTapChiVaoDuAn", "Thêm tạp chí vào dự án")}</span>
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body className="py-4 space-y-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{t("journal.daThemTapChiVaoDuAnThanhCong", "Đã thêm tạp chí vào dự án thành công!")}</Alert>}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
              {t("journal.phuongThuc", "Phương thức")}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="projectMode"
                  id="modeSelect"
                  checked={mode === 'select'}
                  onChange={() => setMode('select')}
                  className="accent-primary"
                />
                <span>{t("journal.chonDuAnDaCo", "Chọn dự án đã có")}</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="projectMode"
                  id="modeCreate"
                  checked={mode === 'create'}
                  onChange={() => setMode('create')}
                  className="accent-primary"
                />
                <span>{t("journal.taoDuAnMoi", "Tạo dự án mới")}</span>
              </label>
            </div>
          </div>

          {mode === 'select' ? (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t("journal.chonDuAnCuaBan", "Chọn dự án của bạn")}
              </label>
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>{t("journal.dangTaiDanhSachDuAn", "Đang tải danh sách dự án...")}</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-muted-foreground text-sm py-2">
                  {t("journal.banChuaCoDuAnNaoVuiLongChonTao", "Bạn chưa có dự án nào, vui lòng chọn Tạo dự án mới.")}
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus:outline-none focus:border-primary"
                >
                  <option value="">{t("journal.chonDuAn", "Chọn dự án")}</option>
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t("journal.tenDuAnMoi", "Tên dự án mới")}
              </label>
              <Input
                type="text"
                placeholder={t("journal.nhapTieuDeDuAnNghienCuu", "Nhập tiêu đề dự án nghiên cứu...")}
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                required
              />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onHide} disabled={submitting}>
            {t("admin.huy", "Hủy")}
          </Button>
          <Button type="submit" size="sm" disabled={submitting || loading || (mode === 'select' && !selectedProjectId) || (mode === 'create' && !newProjectTitle.trim())} isLoading={submitting}>
            {submitting ? t("journal.dangLuu", "Đang lưu...") : t("journal.xacNhan", "Xác nhận")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
