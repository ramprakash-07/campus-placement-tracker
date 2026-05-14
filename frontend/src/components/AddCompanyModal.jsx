/**
 * AddCompanyModal — modal form for creating a new company.
 *
 * Fields: name (required), sector (dropdown), website (optional).
 * On submit, POSTs to the API via companyService, then closes and
 * notifies the parent to refresh the list.
 */
import { useState } from "react";
import { X, Loader2, Building2, AlertCircle } from "lucide-react";
import { createCompany } from "../services/companyService";

const SECTORS = ["Tech", "Finance", "Core", "Consulting", "Other"];

export default function AddCompanyModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", sector: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ───────────────────────────────────────
    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        sector: form.sector || null,
        website: form.website.trim() || null,
      };
      await createCompany(payload);
      setForm({ name: "", sector: "", website: "" });
      onCreated();   // refresh parent list
      onClose();     // close modal
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error alert */}
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
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Google"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
            />
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
              name="sector"
              value={form.sector}
              onChange={handleChange}
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
              name="website"
              type="url"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
            />
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
              disabled={submitting}
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
