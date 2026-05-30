/**
 * AddCompanyModal — modal form for creating a new company.
 *
 * Fields: name (required), sector (dropdown), website (optional).
 * On submit, POSTs to the API via companyService, then closes and
 * notifies the parent to refresh the list.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Building2, AlertCircle } from "lucide-react";
import { createCompany } from "../services/companyService";
import { addCompanySchema } from "../utils/validationSchemas";

const SECTORS = ["Tech", "Finance", "Core", "Consulting", "Other"];

export default function AddCompanyModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(addCompanySchema),
    mode: "onChange",
    defaultValues: { name: "", sector: "", website: "" },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Hooks are called above — safe to bail out now.
  if (!open) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: data.name.trim(),
        sector: data.sector || null,
        website: data.website.trim() || null,
      };
      await createCompany(payload);
      reset();
      onCreated(); // refresh parent list
      onClose(); // close modal
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to create company. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* ── Modal card ───────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50">
              <Building2 size={18} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Company
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* API Error alert */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 animate-fadeIn">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-gray-700"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="company-name"
              type="text"
              {...register("name")}
              placeholder="e.g. Google"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Sector */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-sector"
              className="block text-sm font-medium text-gray-700"
            >
              Sector
            </label>
            <select
              id="company-sector"
              {...register("sector")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white appearance-none cursor-pointer"
            >
              <option value="">Select sector…</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-website"
              className="block text-sm font-medium text-gray-700"
            >
              Website
            </label>
            <input
              id="company-website"
              type="url"
              {...register("website")}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Creating…" : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
