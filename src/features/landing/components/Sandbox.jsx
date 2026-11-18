/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Sandbox.jsx
 */
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui/button";
import Icon from "../../../shared/components/Icon";
import useSandboxSearch from "../hooks/useSandboxSearch";

const typeConfig = {
  JOURNAL: {
    labelKey: "typeJournal",
    icon: "lucide:book-open",
    variant: "primary",
    textColor: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.2)",
    path: (id) => `/journals/${id}`,
  },
  AUTHOR: {
    labelKey: "typeAuthor",
    icon: "lucide:user",
    variant: "secondary",
    textColor: "#a855f7",
    bgColor: "rgba(168, 85, 247, 0.1)",
    borderColor: "rgba(168, 85, 247, 0.2)",
    path: (id) => `/authors/${id}`,
  },
  ARTICLE: {
    labelKey: "typeArticle",
    icon: "lucide:file-text",
    variant: "success",
    textColor: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
    path: (id) => `/articles/${id}/visual`,
  },
  KEYWORD: {
    labelKey: "typeKeyword",
    icon: "lucide:hash",
    variant: "warning",
    textColor: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.2)",
    path: (id) => `/keywords/${id}`,
  },
  AREA: {
    labelKey: "typeArea",
    icon: "lucide:layers",
    variant: "danger",
    textColor: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
    borderColor: "rgba(236, 72, 153, 0.2)",
  },
  CATEGORY: {
    labelKey: "typeCategory",
    icon: "lucide:tag",
    variant: "info",
    textColor: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
};

const defaultType = {
  labelKey: "search",
  icon: "lucide:help-circle",
  variant: "dark",
  textColor: "#94a3b8",
  bgColor: "rgba(148, 163, 184, 0.1)",
  borderColor: "rgba(148, 163, 184, 0.2)",
};

// Module-level helper: resolve route path for a search item by type.
const getItemPath = (item) => typeConfig[item.type]?.path?.(item.id);

export default function Sandbox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    searchValue,
    setSearchValue,
    isLoading,
    searchResult,
    error,
    handleTagClick,
    handleSearchSubmit,
  } = useSandboxSearch();

  const handleItemClick = useCallback(
    (item) => {
      const targetPath = getItemPath(item);
      if (targetPath) navigate(targetPath);
    },
    [navigate]
  );

  const tags = [
    "LLM",
    "RAG",
    "Transformer",
    "Computer Vision",
    "Reinforcement Learning",
  ];

  return (
    <section id="search-sandbox" className="py-12 bg-dark-bg relative">
      <div className="container mx-auto px-4" style={{ maxWidth: "960px" }}>
        {/* Glowing border card container */}
        <div
          className="p-1 rounded-3xl reveal-scale"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-light) 0%, rgba(255, 255, 255, 0.5) 50%, var(--primary-light) 100%)",
            boxShadow: "0 15px 45px rgba(0, 113, 188, 0.05)",
          }}
        >
          {/* Card Body */}
          <div
            className="rounded-3xl py-12 px-4 sm:p-12 text-center relative overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", zIndex: 1 }}
          >
            {/* Header label */}
            <div
              className="inline-flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase"
              style={{ fontSize: "13px", color: "var(--primary)" }}
            >
              <Icon
                icon="lucide:sparkle"
                className="animate-spin-slow"
                style={{ color: "var(--primary)" }}
              />
              <span>{t("sandboxTitle")}</span>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto mb-4"
              style={{ maxWidth: "720px" }}
            >
              <div
                className="flex items-center rounded-full overflow-hidden p-1.5"
                style={{ backgroundColor: "var(--bg-chip)" }}
              >
                <span
                  className="bg-transparent border-0 px-3 flex items-center justify-center shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon icon="lucide:search" className="text-lg" />
                </span>

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t("sandboxPlaceholder")}
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base py-2.5 px-2 focus:outline-none focus:ring-0 shadow-none"
                  style={{
                    color: "var(--text-main)",
                    backgroundColor: "transparent",
                  }}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-glow rounded-full px-5 py-2.5 text-xs font-bold border-0 flex items-center gap-2 mr-1 h-auto shrink-0 text-white"
                  style={{ fontSize: "13px" }}
                >
                  {isLoading ? (
                    <>
                      <Icon icon="lucide:loader-2" className="animate-spin text-sm" />
                      <span>...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("searchBtn")}</span>
                      <Icon icon="lucide:arrow-right" className="text-sm" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Tag suggestions */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mx-auto"
              style={{ maxWidth: "800px" }}
            >
              <span
                className="text-muted-custom font-bold tracking-wider uppercase flex items-center gap-1"
                style={{ fontSize: "13px" }}
              >
                <Icon icon="lucide:sliders" style={{ fontSize: "13px" }} />
                <span>{t("tryNowLabel")}</span>
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-full sandbox-tag text-xs font-semibold cursor-pointer border border-transparent transition-all"
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Mock Results */}
            {isLoading && (
              <div
                className="mt-6 mx-auto p-4 rounded-2xl flex items-center justify-center gap-2 text-muted-custom"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "var(--bg-chip)",
                  fontSize: "14px",
                }}
              >
                <Icon
                  icon="lucide:database"
                  className="animate-bounce text-lg"
                  style={{ color: "var(--primary)" }}
                />
                <span>Analyzing publications databases...</span>
              </div>
            )}

            {error && (
              <div
                className="mt-6 mx-auto p-4 rounded-2xl text-left"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "rgba(220, 53, 69, 0.05)",
                }}
              >
                <div className="flex items-start gap-3 text-danger">
                  <Icon icon="lucide:alert-circle" className="text-xl mt-1 shrink-0" />
                  <div>
                    <h5 className="font-bold text-main text-sm m-0">
                      API Error
                    </h5>
                    <p
                      className="text-muted-custom mt-1 mb-0"
                      style={{ fontSize: "13px" }}
                    >
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {searchResult && (
              <div
                className="mt-6 mx-auto p-4 rounded-2xl text-left"
                style={{
                  maxWidth: "600px",
                  backgroundColor: "var(--bg-card)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  className="flex items-center justify-between mb-3 pb-2"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-full animate-pulse"
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: searchResult.isRealData
                          ? "#198754"
                          : "#ffc107",
                      }}
                    />
                    <span
                      className="font-bold tracking-wider uppercase"
                      style={{
                        fontSize: "13px",
                        color: searchResult.isRealData ? "#198754" : "#ffc107",
                      }}
                    >
                      {searchResult.isRealData
                        ? t("realData")
                        : "Offline Demo Data"}
                    </span>
                  </div>
                  <span
                    className="text-muted-custom"
                    style={{ fontSize: "13px" }}
                  >
                    {searchResult.isRealData
                      ? t("sourceLiveApi")
                      : "Simulated Sandbox"}
                  </span>
                </div>

                <h4
                  className="font-display font-bold text-main mb-3"
                  style={{ fontSize: "16px" }}
                >
                  {t("resultsFor")} "
                  <span style={{ color: "var(--primary)" }}>
                    {searchResult.keyword}
                  </span>
                  "
                </h4>

                {searchResult.items && searchResult.items.length > 0 ? (
                  <div
                    className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar"
                    style={{ maxHeight: "380px" }}
                  >
                    {searchResult.items.map((item, index) => {
                      const cfg = typeConfig[item.type] || defaultType;
                      const isClickable = Boolean(getItemPath(item));
                      return (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between p-3 rounded-xl transition-all"
                          style={{
                            backgroundColor: "var(--bg-chip)",
                            transition: "all 0.2s ease",
                            cursor: isClickable ? "pointer" : "default",
                          }}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={(e) => {
                            if (item.type === "JOURNAL") {
                              e.currentTarget.style.backgroundColor =
                                "var(--primary-light)";
                            } else {
                              e.currentTarget.style.backgroundColor =
                                "rgba(0, 113, 188, 0.05)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--bg-chip)";
                          }}
                        >
                          <div
                            className="flex items-center gap-3 truncate"
                            style={{ flex: "1 1 auto", minWidth: 0 }}
                          >
                            <div
                              className="p-2 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                color: cfg.textColor,
                                backgroundColor: cfg.bgColor,
                              }}
                            >
                              <Icon icon={cfg.icon} className="text-lg" />
                            </div>
                            <div className="flex flex-col truncate" style={{ minWidth: 0 }}>
                              <span
                                className="font-medium text-main text-sm truncate"
                                style={{
                                  fontSize: "14px",
                                  maxWidth: "380px",
                                }}
                              >
                                {item.title || item.name}
                              </span>
                              {(item.authors?.length > 0 || item.journal?.name) && (
                                <span
                                  className="text-muted-custom truncate text-xs"
                                  style={{ maxWidth: "380px" }}
                                >
                                  {item.authors?.length > 0 && (
                                    <span>
                                      {item.authors.map(a => a.name || a.display_name).slice(0, 3).join(', ')}
                                      {item.authors.length > 3 ? ' et al.' : ''}
                                    </span>
                                  )}
                                  {item.authors?.length > 0 && item.journal?.name && <span> • </span>}
                                  {item.journal?.name && <span className="italic">{item.journal.name}</span>}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            style={{
                              backgroundColor: cfg.bgColor,
                              color: "#000000",
                              border: "none",
                              fontSize: "13px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              padding: "0.35em 0.65em",
                              flexShrink: 0,
                              maxWidth: "140px",
                            }}
                            className="truncate rounded-md ml-2"
                            title={item.subject_area?.name || item.type}
                          >
                            {item.subject_area?.name || t(cfg.labelKey)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-custom">
                    <Icon
                      icon="lucide:search-x"
                      className="text-3xl text-muted-custom mb-2"
                    />
                    <p className="text-sm m-0" style={{ fontSize: "14px" }}>
                      {t("noResults")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
