/**
 * AddRecordModal — modal form for creating a new placement record.
 *
 * Fields:
 *   • company   — searchable dropdown populated from getCompanies()
 *   • role_applied (required)
 *   • academic_year (dropdown: 2022-23 … 2024-25)
 *   • ctc_offered (optional number)
 *   • status (selected | rejected | pending, default pending)
 *
 * On submit, POSTs via recordService, then closes and notifies the parent.
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  FileText,
  AlertCircle,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { createRecord } from "../services/recordService";
import { getCompanies } from "../services/companyService";
import { addRecordSchema } from "../utils/validationSchemas";

const ACADEMIC_YEARS = ["2022-23", "2023-24", "2024-25"];
const STATUSES = ["pending", "selected", "rejected"];

const STATUS_LABEL = {
  pending: "Pending",
  selected: "Selected",
  rejected: "Rejected",
};

const STATUS_DOT = {
  pending: "bg-amber-400",
  selected: "bg-emerald-500",
  rejected: "bg-red-500",
};

export default function AddRecordModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(addRecordSchema),
    mode: "onBlur",
    defaultValues: {
      company_id: "",
      role_applied: "",
      academic_year: ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1],
      ctc_offered: "",
      status: "pending",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Company dropdown state ──────────────────────────────────────────
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Watched values for rendering
  const watchedCompanyId = watch("company_id");
  const watchedStatus = watch("status");

  // Fetch companies when modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setCompaniesLoading(true);
      try {
        const result = await getCompanies({ limit: 100 });
        if (!cancelled) setCompanies(result.data);
      } catch {
        // silently fail — user can still type
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Filter companies by search
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, companySearch]);

  // Selected company name
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === Number(watchedCompanyId)),
    [companies, watchedCompanyId]
  );

  // Hooks are called above — safe to bail out now.
  if (!open) return null;

  const selectCompany = (company) => {
    setValue("company_id", company.id, { shouldValidate: true });
    setCompanySearch("");
    setDropdownOpen(false);
    setError("");
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        company_id: Number(data.company_id),
        role_applied: data.role_applied.trim(),
        academic_year: data.academic_year,
        ctc_offered: data.ctc_offered ? Number(data.ctc_offered) : null,
        status: data.status,
      };
      await createRecord(payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to create record. Please try again.";
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
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50">
              <FileText size={18} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Placement Record
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

          {/* Company — searchable dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Company <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen((prev) => !prev);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-left outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white cursor-pointer"
              >
                <span className={selectedCompany ? "text-gray-900" : "text-gray-400"}>
                  {selectedCompany ? selectedCompany.name : "Select company…"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-xl animate-fadeIn max-h-56 flex flex-col">
                  {/* Search input */}
                  <div className="relative px-3 pt-3 pb-2">
                    <Search
                      size={14}
                      className="absolute left-5.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                      ref={searchRef}
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Search companies…"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20"
                    />
                  </div>

                  {/* Options */}
                  <div className="overflow-y-auto flex-1 px-1.5 pb-1.5">
                    {companiesLoading ? (
                      <div className="flex items-center justify-center py-4 text-sm text-gray-400">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Loading…
                      </div>
                    ) : filteredCompanies.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-400">
                        No companies found
                      </p>
                    ) : (
                      filteredCompanies.map((c) => {
                        const isActive = Number(watchedCompanyId) === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectCompany(c)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer ${
                              isActive
                                ? "bg-primary-50 text-primary-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="flex-1 truncate">{c.name}</span>
                            {c.sector && (
                              <span className="text-xs text-gray-400">{c.sector}</span>
                            )}
                            {isActive && <Check size={14} className="text-primary-600 flex-shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.company_id && (
              <p className="text-sm text-red-600">{errors.company_id.message}</p>
            )}
          </div>

          {/* Role Applied */}
          <div className="space-y-1.5">
            <label htmlFor="record-role" className="block text-sm font-medium text-gray-700">
              Role Applied <span className="text-red-500">*</span>
            </label>
            <input
              id="record-role"
              type="text"
              {...register("role_applied")}
              placeholder="e.g. SDE Intern"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
            />
            {errors.role_applied && (
              <p className="text-sm text-red-600">{errors.role_applied.message}</p>
            )}
          </div>

          {/* Academic Year & CTC — side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Academic Year */}
            <div className="space-y-1.5">
              <label htmlFor="record-year" className="block text-sm font-medium text-gray-700">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                id="record-year"
                {...register("academic_year")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white appearance-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
              {errors.academic_year && (
                <p className="text-sm text-red-600">{errors.academic_year.message}</p>
              )}
            </div>

            {/* CTC Offered */}
            <div className="space-y-1.5">
              <label htmlFor="record-ctc" className="block text-sm font-medium text-gray-700">
                CTC Offered (LPA)
              </label>
              <input
                id="record-ctc"
                type="number"
                step="0.01"
                min="0"
                {...register("ctc_offered")}
                placeholder="e.g. 12.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
              />
              {errors.ctc_offered && (
                <p className="text-sm text-red-600">{errors.ctc_offered.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="flex gap-2">
              {STATUSES.map((s) => {
                const active = watchedStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setValue("status", s, { shouldValidate: true });
                      setError("");
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                      active
                        ? "border-primary-300 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
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
              {submitting ? "Creating…" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
