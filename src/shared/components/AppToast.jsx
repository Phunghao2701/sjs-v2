/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\AppToast.jsx
 */
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { registerToast } from "../utils/toast";

const TOAST_CONFIG = {
  success: {
    icon: "solar:check-circle-bold",
    bg: "var(--ds-success-subtle)",
    border: "var(--ds-success)",
    color: "var(--ds-success)",
  },
  error: {
    icon: "solar:close-circle-bold",
    bg: "var(--ds-danger-subtle)",
    border: "var(--ds-danger)",
    color: "var(--ds-danger)",
  },
  warning: {
    icon: "solar:danger-triangle-bold",
    bg: "var(--ds-warning-subtle)",
    border: "var(--ds-warning)",
    color: "var(--ds-warning)",
  },
  info: {
    icon: "solar:info-circle-bold",
    bg: "var(--ds-primary-subtle)",
    border: "var(--ds-primary)",
    color: "var(--ds-primary-hover)",
  },
};

export default function AppToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");

  useEffect(() => {
    registerToast(({ message, variant = "info" }) => {
      setMessage(message);
      setVariant(variant);
      setShow(true);
    });
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setShow(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [show, message]);

  if (!show) return null;

  const config = TOAST_CONFIG[variant] || TOAST_CONFIG.info;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] pointer-events-auto transition-all duration-200"
      style={{ minWidth: "min(360px, calc(100vw - 2rem))" }}
    >
      <div
        className="flex items-center gap-3 p-3.5 rounded-2xl shadow-lg border-l-4"
        style={{
          background: config.bg,
          borderLeftColor: config.border,
        }}
        role={variant === "error" ? "alert" : "status"}
        aria-live={variant === "error" ? "assertive" : "polite"}
      >
        <Icon
          icon={config.icon}
          width={24}
          style={{
            color: config.border,
            flexShrink: 0,
          }}
        />

        <div
          className="flex-1 text-sm font-medium leading-relaxed"
          style={{ color: config.color }}
        >
          {message}
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          title="Dismiss notification"
          onClick={() => setShow(false)}
          className="p-1 rounded-md text-subtle-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Icon icon="solar:close-circle-outline" width={20} />
        </button>
      </div>
    </div>
  );
}
