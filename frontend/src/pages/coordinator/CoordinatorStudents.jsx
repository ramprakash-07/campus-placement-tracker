/**
 * CoordinatorStudents — student management page for coordinators.
 *
 * Displays a table of all students with name, email, join date,
 * record count, and a delete action with confirmation dialog.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Trash2,
  AlertTriangle,
  Loader2,
  Inbox,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { getStudents, deleteStudent } from "../../services/coordinatorService";
import Toast from "../../components/Toast";

/* ── Delete confirmation dialog ──────────────────────────────────────── */
function DeleteDialog({ student, onConfirm, onCancel, deleting }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/60 animate-slideUp p-6 space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mx-auto">
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Student Account
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-700">
              {student.full_name}
            </span>
            's account? This will permanently remove all their placement records
            and rounds. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
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
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton row ────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-4 w-28 rounded-lg bg-gray-200" /></td>
      <td className="px-5 py-4"><div className="h-4 w-36 rounded-lg bg-gray-200" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 rounded-lg bg-gray-200" /></td>
      <td className="px-5 py-4"><div className="h-4 w-10 rounded-lg bg-gray-200" /></td>
      <td className="px-5 py-4"><div className="h-8 w-8 rounded-lg bg-gray-200" /></td>
    </tr>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function CoordinatorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      setToast({
        message: `${deleteTarget.full_name}'s account has been deleted.`,
        type: "success",
      });
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || "Failed to delete student.",
        type: "error",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
          <Users size={22} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Student Management
          </h2>
          <p className="text-sm text-gray-500">
            {students.length} {students.length === 1 ? "student" : "students"}{" "}
            registered
          </p>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="p-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
          <button
            onClick={fetchStudents}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Name", "Email", "Joined", "Records", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────────── */}
      {!loading && !error && students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
            <Inbox size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            No students registered
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">
            No student accounts have been created on the platform yet.
          </p>
        </div>
      )}

      {/* ── Students table ───────────────────────────────────────────── */}
      {!loading && !error && students.length > 0 && (
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Name", "Email", "Joined", "Records", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="group hover:bg-primary-50/30 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0">
                          <span className="text-xs font-bold text-primary-700">
                            {s.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {s.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {s.email}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                        {new Date(s.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Record Count */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                        {s.record_count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-inset ring-red-600/20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Delete ${s.full_name}'s account`}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing {students.length}{" "}
              {students.length === 1 ? "student" : "students"}
            </p>
          </div>
        </div>
      )}

      {/* ── Delete Dialog ────────────────────────────────────────────── */}
      <DeleteDialog
        student={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
