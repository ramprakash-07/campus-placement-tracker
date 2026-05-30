/**
 * AddRoundModal — modal form for creating a new interview round.
 *
 * Fields:
 *   • round_type (dropdown: aptitude, technical, hr, group_discussion, coding)
 *   • outcome (dropdown: pending, passed, failed)
 *   • questions_asked (textarea, optional)
 *
 * On submit, POSTs via roundService, then closes and notifies the parent.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  ListPlus,
  AlertCircle,
} from "lucide-react";
import { createRound } from "../services/roundService";
import { addRoundSchema } from "../utils/validationSchemas";

const ROUND_TYPES = [
  { value: "aptitude", label: "Aptitude" },
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR" },
  { value: "group_discussion", label: "Group Discussion" },
  { value: "coding", label: "Coding" },
];

const OUTCOMES = [
  { value: "pending", label: "Pending" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

const OUTCOME_DOT = {
  pending: "bg-amber-400",
  passed: "bg-emerald-500",
  failed: "bg-red-500",
};

export default function AddRoundModal({ open, onClose, onCreated, placementRecordId }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(addRoundSchema),
    mode: "onChange",
    defaultValues: {
      round_type: "technical",
      outcome: "pending",
      questions_asked: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentOutcome = watch("outcome");

  // Hooks are called above — safe to bail out now.
  if (!open) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        placement_record_id: placementRecordId,
        round_type: data.round_type,
        outcome: data.outcome,
        questions_asked: data.questions_asked?.trim() || null,
      };
      await createRound(payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to add round. Please try again.";
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
              <ListPlus size={18} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Round
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

          {/* Round Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="round-type"
              className="block text-sm font-medium text-gray-700"
            >
              Round Type <span className="text-red-500">*</span>
            </label>
            <select
              id="round-type"
              {...register("round_type")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white appearance-none cursor-pointer"
            >
              {ROUND_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
            {errors.round_type && (
              <p className="text-sm text-red-600">{errors.round_type.message}</p>
            )}
          </div>

          {/* Outcome */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Outcome
            </label>
            <div className="flex gap-2">
              {OUTCOMES.map((o) => {
                const active = currentOutcome === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setValue("outcome", o.value, { shouldValidate: true });
                      setError("");
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                      active
                        ? "border-primary-300 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${OUTCOME_DOT[o.value]}`}
                    />
                    {o.label}
                  </button>
                );
              })}
            </div>
            {errors.outcome && (
              <p className="text-sm text-red-600">{errors.outcome.message}</p>
            )}
          </div>

          {/* Questions Asked */}
          <div className="space-y-1.5">
            <label
              htmlFor="round-questions"
              className="block text-sm font-medium text-gray-700"
            >
              Questions Asked
            </label>
            <textarea
              id="round-questions"
              {...register("questions_asked")}
              rows={4}
              placeholder="e.g. Explain polymorphism, reverse a linked list, tell me about yourself…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white resize-none"
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
              disabled={!isValid || submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Adding…" : "Add Round"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
