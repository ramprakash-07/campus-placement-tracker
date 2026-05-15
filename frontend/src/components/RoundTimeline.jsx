/**
 * RoundTimeline — vertical timeline of interview rounds.
 *
 * Each round card shows:
 *   • Round number & round_type (with icon)
 *   • Outcome badge (color-coded)
 *   • Collapsible accordion for questions_asked
 *
 * Supports inline edit & delete via callbacks.
 */
import { useState } from "react";
import {
  Brain,
  Code2,
  Users,
  HelpCircle,
  ClipboardList,
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

/* ── Round type config ───────────────────────────────────────────────── */
const ROUND_TYPE_CONFIG = {
  aptitude: {
    label: "Aptitude",
    icon: Brain,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
  },
  technical: {
    label: "Technical",
    icon: Code2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
  },
  hr: {
    label: "HR",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
  },
  group_discussion: {
    label: "Group Discussion",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
  },
  coding: {
    label: "Coding",
    icon: ClipboardList,
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
  },
};

const OUTCOME_STYLES = {
  passed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const OUTCOME_DOT = {
  passed: "bg-emerald-500",
  failed: "bg-red-500",
  pending: "bg-amber-400",
};

const ROUND_TYPES = ["aptitude", "technical", "hr", "group_discussion", "coding"];
const OUTCOMES = ["pending", "passed", "failed"];

/* ── Delete confirmation inline dialog ───────────────────────────────── */
function DeleteConfirmDialog({ onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 animate-slideUp p-6 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mx-auto">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">Delete Round</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this round? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Single round card ───────────────────────────────────────────────── */
function RoundCard({ round, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    round_type: round.round_type,
    outcome: round.outcome,
    questions_asked: round.questions_asked || "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const config = ROUND_TYPE_CONFIG[round.round_type] || ROUND_TYPE_CONFIG.technical;
  const IconComponent = config.icon;
  const outcomeStyle = OUTCOME_STYLES[round.outcome] || OUTCOME_STYLES.pending;
  const outcomeDot = OUTCOME_DOT[round.outcome] || OUTCOME_DOT.pending;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onEdit(round.id, {
        round_type: editForm.round_type,
        outcome: editForm.outcome,
        questions_asked: editForm.questions_asked.trim() || null,
      });
      setEditing(false);
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(round.id);
    } catch {
      // error handled by parent
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const cancelEdit = () => {
    setEditForm({
      round_type: round.round_type,
      outcome: round.outcome,
      questions_asked: round.questions_asked || "",
    });
    setEditing(false);
  };

  return (
    <>
      <div className="relative flex gap-4">
        {/* ── Timeline connector ─────────────────────────────────────── */}
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.bg} ring-2 ${config.ring} ring-inset flex-shrink-0 z-10`}
          >
            <IconComponent size={18} className={config.color} />
          </div>
          {/* Vertical line — hidden for the last item via CSS in parent */}
          <div className="w-0.5 flex-1 bg-gray-200 mt-2 timeline-line" />
        </div>

        {/* ── Card body ──────────────────────────────────────────────── */}
        <div className="flex-1 pb-8 min-w-0">
          <div className="group rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-primary-200/60 transition-all duration-200">
            {/* Card header */}
            <div className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-bold text-gray-600 flex-shrink-0">
                  {round.round_number}
                </span>
                {!editing ? (
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {config.label}
                  </h4>
                ) : (
                  <select
                    value={editForm.round_type}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, round_type: e.target.value }))
                    }
                    className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                  >
                    {ROUND_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ROUND_TYPE_CONFIG[t].label}
                      </option>
                    ))}
                  </select>
                )}
                {!editing ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${outcomeStyle}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${outcomeDot}`} />
                    {round.outcome}
                  </span>
                ) : (
                  <select
                    value={editForm.outcome}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, outcome: e.target.value }))
                    }
                    className="text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                  >
                    {OUTCOMES.map((o) => (
                      <option key={o} value={o}>
                        {o.charAt(0).toUpperCase() + o.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Save changes"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Edit round"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Delete round"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Questions accordion */}
            {editing ? (
              <div className="px-5 pb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Questions Asked
                </label>
                <textarea
                  value={editForm.questions_asked}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      questions_asked: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Enter questions asked in this round…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white resize-none"
                />
              </div>
            ) : round.questions_asked ? (
              <>
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="w-full flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50/80 transition-colors cursor-pointer border-t border-gray-100"
                >
                  <HelpCircle size={13} />
                  <span>Questions Asked</span>
                  <ChevronDown
                    size={14}
                    className={`ml-auto transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expanded && (
                  <div className="px-5 pb-4 animate-fadeIn">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {round.questions_asked}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Date */}
          <p className="mt-2 text-xs text-gray-400 pl-1">
            {new Date(round.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(false)}
          deleting={deleting}
        />
      )}
    </>
  );
}

/* ── Timeline container ──────────────────────────────────────────────── */
export default function RoundTimeline({ rounds, onEditRound, onDeleteRound }) {
  if (!rounds || rounds.length === 0) return null;

  // Sort by round_number ascending
  const sorted = [...rounds].sort((a, b) => a.round_number - b.round_number);

  return (
    <div className="relative">
      {sorted.map((round, idx) => (
        <div
          key={round.id}
          className={idx === sorted.length - 1 ? "last-timeline-item" : ""}
          style={
            idx === sorted.length - 1
              ? { "--hide-line": "hidden" }
              : {}
          }
        >
          <RoundCard
            round={round}
            onEdit={onEditRound}
            onDelete={onDeleteRound}
          />
        </div>
      ))}
      <style>{`
        .last-timeline-item .timeline-line {
          display: none;
        }
      `}</style>
    </div>
  );
}
