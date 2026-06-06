/**
 * Button — reusable button component with variants and sizes.
 *
 * Props:
 *   variant  — "primary" | "secondary" | "danger" | "ghost" (default "primary")
 *   size     — "sm" | "md" | "lg" (default "md")
 *   loading  — bool, shows spinner and disables
 *   disabled — bool
 *   children, className, type, onClick, ...rest
 */
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const VARIANT_CLASSES = {
  primary:
    "text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 hover:shadow-lg",
  secondary:
    "text-gray-700 bg-gray-100 hover:bg-gray-200",
  danger:
    "text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 hover:shadow-lg",
  ghost:
    "text-gray-600 bg-transparent hover:bg-gray-100",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
};

const SPINNER_SIZE = { sm: 12, md: 16, lg: 18 };

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    children,
    className = "",
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-semibold transition-all cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
        active:scale-[0.98]
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        ${className}`}
      {...rest}
    >
      {loading && (
        <Loader2
          size={SPINNER_SIZE[size] || 16}
          className="animate-spin"
        />
      )}
      {children}
    </button>
  );
});

export default Button;
