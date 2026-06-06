/**
 * Select — reusable select dropdown component with label and error display.
 *
 * Props:
 *   label     — string, field label
 *   error     — string, error message (shown in red below select)
 *   required  — bool, shows red asterisk
 *   id        — string, HTML id
 *   children  — <option> elements
 *   className — additional classes for wrapper
 *   ...rest   — passed to <select> (value, onChange, etc.)
 *
 * Supports forwardRef for react-hook-form register().
 */
import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { label, error, required, id, children, className = "", ...rest },
  ref
) {
  const selectClasses = `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white appearance-none cursor-pointer ${
    error ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-gray-50/50"
  }`;

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
      <select ref={ref} id={id} className={selectClasses} {...rest}>
        {children}
      </select>
      {error && (
        <p className="text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
