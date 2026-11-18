/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared\components\AppToast.jsx
 */
import { useEffect, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { registerToast } from "../utils/toast";
import { useReducedMotion } from 'framer-motion';

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
  const reduceMotion = useReducedMotion();
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

  const config = TOAST_CONFIG[variant] || TOAST_CONFIG.info;

  return (
    <ToastContainer
      position="top-end"
      className="p-4"
      style={{ zIndex: 9999 }}
    >
      <Toast
        show={show}
        autohide
        delay={3500}
        onClose={() => setShow(false)}
        animation={!reduceMotion}
        className="border-0 shadow-lg"
        style={{
          minWidth: 'min(360px, calc(100vw - 2rem))',
          background: config.bg,
          borderLeft: `4px solid ${config.border}`,
          borderRadius: 16,
        }}
      >
        <Toast.Body role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'} className="d-flex align-items-center gap-3 p-3">
          <Icon
            icon={config.icon}
            width={24}
            style={{
              color: config.border,
              flexShrink: 0,
            }}
          />

          <div
            className="flex-grow-1"
            style={{
              color: config.color,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            title="Dismiss notification"
            onClick={() => setShow(false)}
            className="btn btn-sm p-0 border-0 bg-transparent"
          >
            <Icon
              icon="solar:close-circle-outline"
              width={20}
              color="var(--ds-subtle-foreground)"
            />
          </button>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
