/**
 * Toast — lightweight notification component.
 *
 * Renders a fixed-position toast at the top-right of the viewport.
 * Supports `success` and `error` variants with auto-dismiss.
 *
 * Usage:
 *   <Toast
 *     message="Profile updated!"
 *     type="success"            // "success" | "error"
 *     onClose={() => setToast(null)}
 *     duration={3000}           // optional, default 3000ms
 *   />
 */
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

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
};

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [exiting, setExiting] = useState(false);
  const variant = VARIANTS[type] || VARIANTS.success;
  const IconComponent = variant.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 200); // wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-sm w-full pointer-events-auto">
      <div
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg ${variant.bg} ${variant.border} transition-all duration-200 ${
          exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
        }`}
        style={{ animation: "slideInRight 0.3s ease-out" }}
      >
        <IconComponent size={20} className={`flex-shrink-0 mt-0.5 ${variant.iconColor}`} />
        <p className={`text-sm font-medium flex-1 ${variant.text}`}>{message}</p>
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
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
