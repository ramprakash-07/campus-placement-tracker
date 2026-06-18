/**
 * Modal — reusable modal dialog with backdrop, ESC key support, and header.
 *
 * Props:
 *   isOpen   — bool, controls visibility
 *   onClose  — fn, called on backdrop click or ESC
 *   title    — string, modal heading
 *   icon     — React component (lucide icon), optional
 *   children — modal body content
 *   maxWidth — string, e.g. "max-w-md" | "max-w-lg" (default "max-w-md")
 */
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = "max-w-md",
}) {
  // ── ESC key handler ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn hidden sm:block"
        onClick={onClose}
      />

      {/* Modal card — full-screen on mobile, centered card on sm+ */}
      <div
        className={`relative w-full h-full sm:h-auto sm:${maxWidth} bg-white sm:rounded-2xl shadow-2xl sm:ring-1 sm:ring-gray-200/60 animate-slideUp sm:max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 sticky top-0 bg-white sm:rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50">
                <Icon size={18} className="text-primary-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
