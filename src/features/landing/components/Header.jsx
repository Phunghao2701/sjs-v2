/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Header.jsx
 */
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../shared/ui/button";
import { Dropdown } from "../../../shared/ui/dropdown-menu";
import { Offcanvas } from "../../../shared/ui/sheet";
import Icon from "../../../shared/components/Icon";
import Logo from "../../../shared/components/Logo";
import useAuth from "../../auth/hooks/useAuth";
import { useUserStore } from "../../../app/store/userStore";
import ROUTES from "../../../app/routes/routePaths";
import { DashboardShellContext } from "../../../shared/components/DashboardShell";

// Single source of truth for supported languages — shared by desktop & mobile switchers.
const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const cleanPathname = pathname.replace(/^\/(vi|en|ja|ko)/, "") || "/";
  const auth = useAuth?.() ?? {
    logout: () => {},
  };
  const { logout } = auth;
  const email = useUserStore((state) => state.email);
  const userRole = auth.user?.role;
  const accountManagementRoute =
    userRole === "ADMINISTRATOR" ? ROUTES.ADMIN_USERS : ROUTES.PROFILE;
  const language = i18n.language || "vi";
  const currentLanguage =
    LANGUAGES.find((lang) => language.startsWith(lang.code)) || LANGUAGES[0];
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const inDashboardShell = useContext(DashboardShellContext);

  useEffect(() => {
    const handleScroll = () => {
      // scroll handling placeholder if needed
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (inDashboardShell) return null;

  const navigateWithLang = (path) => {
    if (path.startsWith("/")) {
      const segments = path.split("/").filter(Boolean);
      if (
        segments.length === 0 ||
        !["vi", "en", "ja", "ko"].includes(segments[0])
      ) {
        navigate(`/${language}${path}`);
        return;
      }
    }
    navigate(path);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("researchpulse_lang", lang);
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && ["vi", "en", "ja", "ko"].includes(segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }
    const newPath = "/" + segments.join("/") + location.search + location.hash;
    navigate(newPath);
  };

  const handleAuthLogin = () => {
    navigateWithLang(ROUTES.LOGIN);
  };

  const handleAuthRegister = () => {
    navigateWithLang(ROUTES.REGISTER);
  };

  const navItems = [
    {
      label: t("author.tongQuan"),
      icon: "lucide:layout-dashboard",
      path: ROUTES.DASHBOARD,
    },
    {
      label: t("landing.duAn"),
      icon: "lucide:folder",
      path: ROUTES.PROJECTS,
    },
    {
      label: t("search"),
      icon: "lucide:search",
      path: ROUTES.CATALOG,
    },
    {
      label: t("articles"),
      icon: "lucide:file-text",
      path: ROUTES.ARTICLES,
    },
    {
      label: t("landing.tacGia"),
      icon: "lucide:users",
      path: ROUTES.AUTHORS,
    },
  ];

  const navLinkStyle = {
    borderBottom: "2px solid transparent",
    color: "var(--text-muted)",
    transition: "color 0.18s ease, border-color 0.18s ease",
    fontWeight: 600,
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 sticky-scrolled"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo Brand */}
          <div
            onClick={() => navigateWithLang(ROUTES.HOME)}
            className="flex items-center text-main font-bold cursor-pointer select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
            }}
          >
            <Logo size={32} />
          </div>

          {/* Hamburger toggle for mobile */}
          <button
            type="button"
            aria-label="Toggle Navigation"
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden border-0 bg-transparent text-main p-1 cursor-pointer flex items-center justify-center"
          >
            <Icon icon="lucide:menu" className="text-2xl text-main" />
          </button>

          {/* Desktop Navigation Link Items */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav className="flex items-center gap-2 mx-auto">
              {navItems.map((item) => {
                const isPrivate =
                  item.path === ROUTES.DASHBOARD ||
                  item.path === ROUTES.PROJECTS;
                if (isPrivate && !email) return null;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigateWithLang(item.path)}
                    className="px-3 py-1 text-sm flex items-center gap-1 bg-transparent cursor-pointer border-0"
                    style={navLinkStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--primary)";
                      e.currentTarget.style.borderBottomColor =
                        "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  type="button"
                  className="border-0 bg-transparent inline-flex items-center justify-center p-0 text-muted-custom cursor-pointer"
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                  aria-label="Mở cài đặt giao diện"
                >
                  <Icon icon="lucide:settings" width="18" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="border border-border shadow-md mt-2 p-1 min-w-[190px]">
                  <div className="px-3 py-2 text-xs font-bold text-main border-b border-border pb-2 mb-1">
                    {t("landing.caiDat")}
                  </div>
                  {LANGUAGES.map((lang) => (
                    <Dropdown.Item
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center justify-between text-xs py-2 px-3 rounded cursor-pointer ${
                        language.startsWith(lang.code) ? "text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language.startsWith(lang.code) && (
                        <Icon
                          icon="lucide:check"
                          className="text-primary text-xs ml-2"
                        />
                      )}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              {/* User Authentication Display/Buttons */}
              {email ? (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    className="border-0 bg-transparent inline-flex items-center justify-center p-0 text-muted-custom hover:text-primary cursor-pointer transition-colors"
                    style={{
                      width: "32px",
                      height: "32px",
                    }}
                    aria-label="Tài khoản người dùng"
                  >
                    <Icon icon="lucide:user" width="18" />
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="border border-border shadow-md mt-2 p-1 min-w-[200px]">
                    <div className="px-3 py-2 text-xs font-bold text-main border-b border-border pb-2 mb-1">
                      <span>{t("landing.nguoiDung")}</span>
                      <div
                        className="text-muted font-normal mt-0.5 truncate text-xs"
                        style={{
                          color: "var(--text-muted)",
                        }}
                      >
                        {email}
                      </div>
                    </div>
                    <Dropdown.Item
                      onClick={() => navigateWithLang(ROUTES.DASHBOARD)}
                      className="flex items-center gap-2 text-xs py-2 px-3 rounded cursor-pointer text-foreground hover:bg-muted/50"
                    >
                      <Icon
                        icon="lucide:layout-dashboard"
                        width="14"
                        className="text-muted-custom"
                      />
                      <span>{t("landing.bangDieuKhien")}</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => navigateWithLang(accountManagementRoute)}
                      className="flex items-center gap-2 text-xs py-2 px-3 rounded cursor-pointer text-foreground hover:bg-muted/50"
                    >
                      <Icon
                        icon="lucide:users"
                        width="14"
                        className="text-muted-custom"
                      />
                      <span>{t("landing.quanTriTaiKhoan")}</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={logout}
                      className="flex items-center gap-2 text-xs py-2 px-3 rounded cursor-pointer text-destructive hover:bg-destructive/10"
                    >
                      <Icon icon="lucide:log-out" width="14" />
                      <span>{t("landing.dangXuat")}</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full px-3 h-8"
                    onClick={handleAuthLogin}
                  >
                    {t("signIn")}
                  </Button>
                  <Button
                    size="sm"
                    className="btn-primary-glow border-0 text-white text-xs rounded-full px-3 h-8"
                    onClick={handleAuthRegister}
                  >
                    {t("signUp")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (Offcanvas) */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className="w-[min(280px,85vw)] bg-card text-foreground"
      >
        <Offcanvas.Header className="border-b border-border py-3 px-4">
          <Offcanvas.Title
            className="flex items-center text-main"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
            }}
          >
            <Logo size={28} fontSize="1rem" />
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="flex flex-col py-3 px-4">
          {/* User profile */}
          {email && (
            <div
              className="flex items-center gap-2 p-2 rounded-lg user-profile-card cursor-pointer transition-colors"
              style={{
                background: "#f8fafc",
                border: "1px solid var(--border)",
              }}
              role="button"
              tabIndex={0}
              onClick={() => {
                setShowMobileMenu(false);
                navigateWithLang(accountManagementRoute);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowMobileMenu(false);
                  navigateWithLang(accountManagementRoute);
                }
              }}
            >
              <div
                className="flex items-center justify-center text-white shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  boxShadow: "0 0 6px rgba(0, 113, 188, 0.15)",
                }}
              >
                <Icon icon="lucide:user" width="16" />
              </div>
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-xs text-main font-bold truncate">
                  {t("landing.nguoiDung")}
                </span>
                <span className="text-muted truncate text-xs mt-0.5">
                  {email}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 justify-between flex-grow mt-3">
            <nav className="flex flex-col gap-1">
              {!!email && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigateWithLang(ROUTES.DASHBOARD);
                    }}
                    className="text-left text-muted-custom hover:text-main py-2 text-sm font-semibold border-b border-border bg-transparent border-0 cursor-pointer"
                  >
                    {t("author.tongQuan")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileMenu(false);
                      navigateWithLang(ROUTES.PROJECTS);
                    }}
                    className="text-left text-muted-custom hover:text-main py-2 text-sm font-semibold border-b border-border bg-transparent border-0 cursor-pointer"
                    style={{
                      color: cleanPathname.startsWith(ROUTES.PROJECTS)
                        ? "var(--primary)"
                        : "var(--text-muted)",
                      fontWeight: cleanPathname.startsWith(ROUTES.PROJECTS)
                        ? 700
                        : 600,
                    }}
                  >
                    {t("landing.duAn")}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  navigateWithLang(ROUTES.CATALOG);
                }}
                className="text-left text-muted-custom hover:text-main py-2 text-sm font-semibold border-b border-border bg-transparent border-0 cursor-pointer"
              >
                {t("search")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  navigateWithLang(ROUTES.ARTICLES);
                }}
                className="text-left text-muted-custom hover:text-main py-2 text-sm font-semibold border-b border-border bg-transparent border-0 cursor-pointer"
                style={{
                  color: cleanPathname.startsWith(ROUTES.ARTICLES)
                    ? "var(--primary)"
                    : "var(--text-muted)",
                  fontWeight: cleanPathname.startsWith(ROUTES.ARTICLES)
                    ? 700
                    : 600,
                }}
              >
                {t("articles")}
              </button>
            </nav>

            <div className="flex flex-col gap-3 mt-auto">
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between py-2 border-t border-b border-border">
                <span className="text-xs font-bold text-main">
                  {t("landing.ngonNgu")}
                </span>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    type="button"
                    className="border-0 bg-transparent inline-flex items-center gap-2 text-xs font-bold p-0 text-main cursor-pointer"
                  >
                    {currentLanguage.label}
                    <Icon icon="lucide:chevron-down" width="14" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="border border-border shadow-md mt-2 p-1 min-w-[170px]">
                    {LANGUAGES.map((lang) => (
                      <Dropdown.Item
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex items-center justify-between text-xs py-2 px-3 rounded cursor-pointer ${
                          language.startsWith(lang.code) ? "text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {language.startsWith(lang.code) && (
                          <Icon
                            icon="lucide:check"
                            className="text-primary text-xs ml-2"
                          />
                        )}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {/* Mobile Auth options */}
              {email ? (
                <Button
                  variant="destructive"
                  className="w-full rounded-full py-2 text-xs font-bold h-9"
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                >
                  {language.startsWith("vi")
                    ? t("landing.dangXuat")
                    : "Sign Out"}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-full py-2.5 text-xs font-bold h-9"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleAuthLogin();
                    }}
                  >
                    {t("signIn")}
                  </Button>
                  <Button
                    className="btn-primary-glow w-full rounded-full py-2.5 text-xs font-bold border-0 text-white h-9"
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleAuthRegister();
                    }}
                  >
                    {t("signUp")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
