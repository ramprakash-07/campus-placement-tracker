/**
 * ToastContainer — renders toast notifications fixed at top-right.
 *
 * Each toast slides in from the right, has a progress bar,
 * and can be manually dismissed.
 *
 * Props:
 *  - toasts: array of { id, message, type, duration }
 *  - onRemove: (id) => void
 */
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const VARIANTS = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    progressBg: "bg-emerald-400",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: XCircle,
    iconColor: "text-red-500",
    progressBg: "bg-red-400",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: Info,
    iconColor: "text-blue-500",
    progressBg: "bg-blue-400",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    progressBg: "bg-amber-400",
  },
};

/* ── Single Toast Item ─────────────────────────────────────────────── */
function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const variant = VARIANTS[toast.type] || VARIANTS.info;
  const IconComponent = variant.icon;

  // Trigger enter animation
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`w-full max-w-sm transition-all duration-300 ease-out ${
        exiting
          ? "opacity-0 translate-x-8 scale-95"
          : entered
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-12 scale-95"
      }`}
    >
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg backdrop-blur-sm ${variant.bg} ${variant.border}`}
      >
        <IconComponent
          size={20}
          className={`flex-shrink-0 mt-0.5 ${variant.iconColor}`}
        />
        <p className={`text-sm font-medium flex-1 ${variant.text}`}>
          {toast.message}
        </p>
        <button
          onClick={handleClose}
          className="p-0.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors cursor-pointer flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-1 h-0.5 rounded-full bg-gray-200/60 mx-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${variant.progressBg}`}
          style={{
            animation: `toastShrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Container ─────────────────────────────────────────────────────── */
export default function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>

      <style>{`
        @keyframes toastShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}
