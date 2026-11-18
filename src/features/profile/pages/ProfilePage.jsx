import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { Icon } from "@iconify/react";
import useAuth from "../../auth/hooks/useAuth";
import { isAuthenticated as isAuthenticatedUtil } from "../../../shared/utils/auth";
import { PageContainer, PageHeader } from "../../../shared/ui/page-layout";
import { Card } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { StatePanel } from "../../../shared/ui/state-panel";
import { Skeleton } from "../../../shared/ui/skeleton";

export default function ProfilePage() {
  const { t } = useTranslation();
  const {
    user,
    isAuthenticated,
    fetchProfile,
    updateProfile,
    deleteAccount,
    isLoading,
    error,
  } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    gender: true,
    date_of_birth: "",
    url_image: "",
  });

  const computedIsAuthenticated = useMemo(() => {
    if (user) return true;
    if (isAuthenticated) return true;
    return false;
  }, [isAuthenticated, user]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const shouldFetch = computedIsAuthenticated || (await isAuthenticatedUtil());
      if (!cancelled && shouldFetch) {
        try {
          await fetchProfile();
        } catch (e) {
          // Keep UI stable if request fails
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [computedIsAuthenticated, fetchProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "",
        gender: user.gender ?? true,
        date_of_birth: (() => {
          const v = user.date_of_birth;
          if (!v) return "";
          if (typeof v === "string") {
            if (v.includes("T")) return v.slice(0, 10);
            return v;
          }
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          return String(v);
        })(),
        url_image: user.url_image || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        url_image: formData.url_image,
      });
      alert(t("profile.capNhatThanhCong"));
    } catch (err) {
      console.error(err);
      alert(t("profile.capNhatThatBai"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteAccount) {
      try {
        await deleteAccount();
        alert(t("profile.xoaTaiKhoanThanhCong"));
        navigate("/login");
      } catch (err) {
        console.error(err);
        alert(t("profile.xoaTaiKhoanThatBai"));
      }
    } else {
      alert(t("profile.chucNangXoaTaiKhoanDangChoBack"));
    }
    setShowDeleteModal(false);
  };

  if (isLoading && !user) {
    return (
      <div className="min-vh-100 flex flex-col text-foreground">
        <PageContainer className="flex-1 max-w-5xl py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-4 p-5 flex flex-col items-center space-y-4">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </Card>
            <Card className="md:col-span-8 p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-vh-100 flex flex-col grid-bg text-foreground">
        <div className="flex-1 flex items-center justify-center p-6 max-w-lg mx-auto w-full">
          <StatePanel
            variant="error"
            icon={<Icon icon="lucide:alert-circle" width="32" className="text-danger" />}
            title={t("profile.daXayRaLoi")}
            description={error}
            className="w-full"
            actions={
              <Button onClick={() => fetchProfile()}>
                {t("article.thuLai")}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageContainer className="py-6 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: t("navigation.workspace", "Workspace"), to: "/dashboard" },
          { label: t("profile.hoSoCaNhan", "Personal Profile") }
        ]}
        title={t("profile.hoSo", "Profile")}
        description={t("profile.quanLyThongTinCaNhanVaThietLap", "Manage your personal information and account settings.")}
      />

      {!computedIsAuthenticated ? (
        <StatePanel
          variant="neutral"
          icon={<Icon icon="lucide:user-check" width="36" className="text-muted-foreground" />}
          title={t("profile.vuiLongDangNhap")}
          description={t("profile.banCanDangNhapDeXemVaQuanLyHoS")}
          actions={
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/login")}>
                {t("signIn")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/register")}>
                {t("profile.dangKi")}
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar info */}
          <Card className="lg:col-span-4 p-5 flex flex-col items-center text-center">
            <div className="relative mb-3">
              {formData.url_image ? (
                <img
                  src={formData.url_image}
                  alt="avatar"
                  className="size-20 rounded-full object-cover ring-2 ring-primary/20"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <span
                className={`size-20 rounded-full bg-primary-subtle text-primary text-xl font-bold items-center justify-center ring-2 ring-primary/20 ${
                  formData.url_image ? "hidden" : "flex"
                }`}
              >
                {formData.first_name
                  ? formData.first_name.charAt(0).toUpperCase()
                  : formData.last_name
                  ? formData.last_name.charAt(0).toUpperCase()
                  : "U"}
              </span>
            </div>

            <h2 className="m-0 text-base font-semibold text-foreground">
              {formData.last_name} {formData.first_name}
            </h2>

            <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="secondary" className="text-xs">
                {formData.role || t("auth.nhaNghienCuu", "Researcher")}
              </Badge>
              <Badge
                variant={user?.is_active ?? true ? "success" : "secondary"}
                className="text-xs"
              >
                {user?.is_active ?? true ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="w-full my-4 border-t border-border" />

            <div className="w-full text-left space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("admin.hoatDong", "Activity")}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("profile.duAnDangTheoDoi", "Monitored Projects")}</span>
                <span className="font-bold font-mono text-foreground">
                  {user?.followed_projects_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("profile.tuKhoaDaLuu", "Saved Keywords")}</span>
                <span className="font-bold font-mono text-foreground">
                  {user?.saved_keywords_count || 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Profile Edit Card & Danger Zone */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="m-0 text-base font-semibold text-foreground">
                  {t("profile.thongTinTaiKhoan", "Account Information")}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("profile.capNhatThongTinDinhDanh", "Update your personal credentials and research account settings.")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("profile.ho", "Last Name")}
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    maxLength={40}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("profile.ten", "First Name")}
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    maxLength={25}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("auth.diaChiEmail", "Email Address")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="flex h-10 w-full rounded-control border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("profile.vaiTroChucDanh", "Role / Title")}
                  </label>
                  <input
                    type="text"
                    value={formData.role || t("auth.nhaNghienCuu", "Researcher")}
                    readOnly
                    className="flex h-10 w-full rounded-control border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("profile.gioiTinh", "Gender")}
                  </label>
                  <select
                    value={formData.gender ? "male" : "female"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === "male" })}
                    className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                  >
                    <option value="male">{t("auth.nam", "Male")}</option>
                    <option value="female">{t("auth.nu", "Female")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t("profile.ngaySinh", "Date of Birth")}
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  {t("profile.avatarUrl", "Avatar Image URL")}
                </label>
                <input
                  type="text"
                  value={formData.url_image}
                  onChange={(e) => setFormData({ ...formData, url_image: e.target.value })}
                  placeholder="https://example.com/avatar.png"
                  className="flex h-10 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-xs focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} isLoading={isSaving} loadingText={t("dangXuLy", "Saving...")} className="gap-2">
                  <Icon icon="lucide:save" width={16} aria-hidden="true" />
                  <span>{t("admin.luuThayDoi", "Save Changes")}</span>
                </Button>
              </div>
            </Card>

            {/* Danger Zone Card */}
            <Card className="p-5 border-danger/30 bg-danger-subtle/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="m-0 text-sm font-semibold text-danger">Danger Zone</h4>
                  <p className="mt-1 mb-0 text-xs text-muted-foreground">
                    {t("profile.hanhDongNaySeXoaTaiKhoanVinhVi", "This action will permanently delete your account.")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="self-start sm:self-auto shrink-0 gap-1.5"
                >
                  <Icon icon="lucide:trash-2" width={14} aria-hidden="true" />
                  <span>{t("profile.xoaTaiKhoan", "Delete Account")}</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>

      {/* Confirmation Modal */}
      <Modal
        show={showDeleteModal && isAuthenticated}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-base font-semibold text-danger">
            {t("profile.xacNhanXoaTaiKhoan")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-sm text-muted-foreground m-0">
            {t("profile.banCoChacMuonXoaTaiKhoanNayKho")}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            {t("admin.huy")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t("profile.xoaTaiKhoan")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
