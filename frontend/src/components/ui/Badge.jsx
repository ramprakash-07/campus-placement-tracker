/**
 * Badge — reusable badge/pill component with color variants.
 *
 * Props:
 *   variant   — "success" | "error" | "warning" | "info" | "default" (default "default")
 *   text      — string to display
 *   className — additional classes
 */

const VARIANT_CLASSES = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  error:   "bg-red-50 text-red-700 ring-red-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  info:    "bg-blue-50 text-blue-700 ring-blue-600/20",
  default: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export default function Badge({ variant = "default", text, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.default}
        ${className}`}
    >
      {text}
    </span>
  );
}
