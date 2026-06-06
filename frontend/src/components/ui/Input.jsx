/**
 * Input — reusable text input component with label, icon, and error display.
 *
 * Props:
 *   label     — string, field label
 *   error     — string, error message (shown in red below input)
 *   required  — bool, shows red asterisk
 *   id        — string, HTML id
 *   icon      — React component (lucide icon), optional left icon
 *   className — additional classes for wrapper
 *   ...rest   — passed to <input> (type, placeholder, value, onChange, etc.)
 *
 * Supports forwardRef for react-hook-form register().
 */
import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, required, id, icon: Icon, className = "", ...rest },
  ref
) {
  const inputClasses = `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white ${
    error ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-gray-50/50"
  } ${Icon ? "pl-9" : ""}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={16} />
          </span>
        )}
        <input ref={ref} id={id} className={inputClasses} {...rest} />
      </div>
      {error && (
        <p className="text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
