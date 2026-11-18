import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useJournalManagement } from "../hooks/useJournalManagement";
import VolumeList from "../components/VolumeList";
import IssueTable from "../components/IssueTable";
import SwitchJournalModal from "../components/modals/SwitchJournalModal";
import CreateVolumeModal from "../components/modals/CreateVolumeModal";
import CreateIssueModal from "../components/modals/CreateIssueModal";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import PrimaryButton from "../../../shared/components/Button/PrimaryButton";

/**
 * Page RepositoryManagementPage - Màn hình điều phối quản lý Tập (Volume) và Số (Issue) tập trung của Admin.
 * Đáp ứng đầy đủ tiêu chí logic liên kết dữ liệu cha - con trên Mock State.
 */
export default function RepositoryManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // --- LẤY DỮ LIỆU TỪ ZUSTAND STORE ---
  const {
    currentJournal,
    volumes,
    issues,
    selectedVolume,
    setSelectedVolume,
    fetchInitialData
  } = useJournalManagement();

  // --- CÁC STATE ĐIỀU KHIỂN ĐÓNG/MỞ MODAL FORM ---
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Đảm bảo dữ liệu được nạp vào store đầy đủ khi Admin truy cập trang
  useEffect(() => {
    if (!currentJournal) {
      fetchInitialData();
    }
  }, [currentJournal, fetchInitialData]);

  // --- LỌC DỮ LIỆU CẤU TRÚC PHỤ THUỘC (CASCADING FILTER) ---
  const currentVolumes = (volumes || []).filter(v => v.journalId === currentJournal?.id);
  useEffect(() => {
    if (currentVolumes.length > 0 && !selectedVolume) {
      setSelectedVolume(currentVolumes[0].id);
    }
  }, [currentVolumes, selectedVolume, setSelectedVolume]);

  const currentIssues = (issues || []).filter(i => i.volumeId === selectedVolume);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* THANH ĐIỀU HƯỚNG BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button
          type="button"
          onClick={() => navigate("/admin/journals")}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {t("journal.quanLyTapChi")}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{t("journal.khoDuLieuTapSoRepository")}</span>
      </nav>

      {/* KHỐI TIÊU ĐỀ TRANG VÀ THÔNG TIN TẠP CHÍ ĐANG CHỌN */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
            Repository Management
          </span>
          <h1 className="font-display font-bold text-2xl text-foreground mb-1 flex items-center gap-2 mt-0.5">
            <Icon icon="lucide:database" className="text-warning text-xl" />
            {currentJournal ? currentJournal.title : t("journal.dangTaiThongTin")}
          </h1>
          <p className="text-muted-foreground text-sm mb-0">
            {t("journal.maSoIssn")}{" "}
            <span className="font-mono font-medium text-foreground">
              {currentJournal?.issn}
            </span>{" "}
            {t("journal.nguoiPhuTrach")}{" "}
            <span className="font-medium text-foreground">{currentJournal?.publisher}</span>
          </p>
        </div>

        {/* Nút bấm mở Switch Journal Modal để đổi nhanh tạp chí cần cấu hình */}
        <Button variant="outline" className="flex items-center gap-2 shrink-0" onClick={() => setShowSwitchModal(true)}>
          <Icon icon="lucide:refresh-cw" width="15" />
          <span>{t("journal.doiTapChi")}</span>
        </Button>
      </div>

      {/* THẺ TỔNG QUAN THỐNG KÊ NHANH (SUMMARY CARD) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-left">
        <Card className="p-4 bg-surface border border-border shadow-2xs">
          <div className="text-muted-foreground text-xs mb-1 font-medium">{t("journal.tongSoVolumeTap")}</div>
          <h3 className="font-bold text-2xl text-foreground m-0 font-mono">
            {currentVolumes.length}
          </h3>
        </Card>
        <Card className="p-4 bg-surface border border-border shadow-2xs">
          <div className="text-muted-foreground text-xs mb-1 font-medium">{t("journal.tongSoIssuePhatHanh")}</div>
          <h3 className="font-bold text-2xl text-foreground m-0 font-mono">
            {issues.filter(i => currentVolumes.map(v => v.id).includes(i.volumeId)).length}
          </h3>
        </Card>
        <Card className="p-4 bg-surface border border-border shadow-2xs">
          <div className="text-muted-foreground text-xs mb-1 font-medium">{t("journal.trangThaiCauTruc")}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              {t("journal.dongBoMockState")}
            </span>
          </div>
        </Card>
      </div>

      {/* KHU VỰC CHIA ĐÔI GIAO DIỆN CHÍNH (VOLUME BÊN TRÁI - ISSUE BÊN PHẢI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* CỘT BÊN TRÁI: QUẢN LÝ VOLUME */}
        <div className="lg:col-span-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-display font-bold text-base text-foreground mb-0">{t("journal.danhSachCacTapVolumes")}</h5>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={() => setShowVolumeModal(true)}>
              <Icon icon="lucide:plus" width="14" />
              <span>{t("journal.tapMoi")}</span>
            </Button>
          </div>
          <VolumeList volumes={currentVolumes} selectedVolumeId={selectedVolume} onSelectVolume={setSelectedVolume} />
        </div>

        {/* CỘT BÊN PHẢI: QUẢN LÝ CÁC ISSUE THUỘC VOLUME ĐƯỢC CHỌN */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-display font-bold text-base text-foreground mb-0">{t("journal.soPhatHanhIssuesThuocTapDaChon")}</h5>
            <PrimaryButton className="gap-1.5 px-3 py-1.5" disabled={!selectedVolume} onClick={() => setShowIssueModal(true)}>
              <Icon icon="lucide:plus-circle" width="15" />
              <span>{t("journal.soPhatHanhMoi")}</span>
            </PrimaryButton>
          </div>
          <IssueTable issues={currentIssues} />
        </div>
      </div>

      {/* TOÀN BỘ HỆ THỐNG MODAL ĐIỀU KHIỂN BIẾN ĐỘNG STATE TẠI TRANG */}
      <SwitchJournalModal show={showSwitchModal} handleClose={() => setShowSwitchModal(false)} />
      <CreateVolumeModal show={showVolumeModal} handleClose={() => setShowVolumeModal(false)} />
      <CreateIssueModal show={showIssueModal} handleClose={() => setShowIssueModal(false)} />
    </div>
  );
}
