/**
 * Records page — browse, manage, and add placement records.
 *
 * • Fetches the current user's placement records on mount
 * • Responsive table with columns: Company, Role, Year, CTC, Status, Rounds, Actions
 * • Color-coded status badges (green=selected, red=rejected, yellow=pending)
 * • "Add Record" button opens AddRecordModal
 * • Inline delete with confirmation dialog
 * • Horizontally scrollable table on mobile
 * • Loading skeleton, empty state, and error handling with retry
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import { getRecords, deleteRecord } from "../services/recordService";
import AddRecordModal from "../components/AddRecordModal";
import SkeletonRow from "../components/ui/SkeletonRow";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { useToast } from "../store/ToastContext";

/* ── Status badge styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  selected:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected:
    "bg-red-50 text-red-700 ring-red-600/20",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_DOT = {
  selected: "bg-emerald-500",
  rejected: "bg-red-500",
  pending: "bg-amber-400",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const dot = STATUS_DOT[status] || STATUS_DOT.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

/* ── Table column widths for skeleton ──────────────────────────────── */
const RECORD_SKELETON_WIDTHS = ["w-28", "w-24", "w-16", "w-14", "w-20", "w-8", "w-8"];

/* ── Delete confirmation dialog ──────────────────────────────────────── */
function DeleteDialog({ record, onConfirm, onCancel, deleting }) {
  if (!record) return null;
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
          <h3 className="text-lg font-semibold text-gray-900">Delete Record</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete the placement record for{" "}
            <span className="font-medium text-gray-700">
              {record.company?.name || "this company"}
            </span>
            ? This action cannot be undone.
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
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page component ─────────────────────────────────────────────── */
export default function Records() {
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Pagination via URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const setPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  // ── Fetch records from API ──────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getRecords({ page: currentPage, limit: 10 });
      setRecords(result.data);
      setTotalRecords(result.total);
      setTotalPages(result.pages);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load placement records. Please try again.";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ── Handle delete ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord(deleteTarget.id);
      setDeleteTarget(null);
      addToast({ message: "Record deleted successfully.", type: "success" });
      fetchRecords();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to delete record.";
      setError(msg);
      addToast({ message: msg, type: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
            <FileText size={22} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Placement Records</h2>
            <p className="text-sm text-gray-500">
              {records.length} of {totalRecords} {totalRecords === 1 ? "record" : "records"} tracked
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      {/* ── Error state ──────────────────────────────────────────────── */}
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
            onClick={fetchRecords}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Company", "Role Applied", "Year", "CTC", "Status", "Rounds", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} widths={RECORD_SKELETON_WIDTHS} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && !error && records.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No placement records yet"
          description="Start tracking your placement journey by adding your first record."
          iconBg="bg-primary-50"
          iconColor="text-primary-400"
          actionLabel="Add Record"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* ── Records table ────────────────────────────────────────────── */}
      {!loading && !error && records.length > 0 && (
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Company", "Role Applied", "Year", "CTC", "Status", "Rounds", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => navigate(`/records/${rec.id}`)}
                    className="group hover:bg-primary-50/30 transition-colors cursor-pointer"
                  >
                    {/* Company */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0">
                          <FileText size={14} className="text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                          {rec.company?.name || `Company #${rec.company_id}`}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {rec.role_applied}
                    </td>

                    {/* Academic Year */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                        {rec.academic_year}
                      </span>
                    </td>

                    {/* CTC */}
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {rec.ctc_offered != null
                        ? `₹${Number(rec.ctc_offered).toLocaleString("en-IN")} LPA`
                        : <span className="text-gray-400">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={rec.status} />
                    </td>

                    {/* Rounds count */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                        {rec.rounds?.length || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/records/${rec.id}`);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label={`View details for ${rec.company?.name}`}
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(rec);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label={`Delete record for ${rec.company?.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {records.length} of {totalRecords} {totalRecords === 1 ? "record" : "records"}
            </p>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Add Record Modal ─────────────────────────────────────────── */}
      <AddRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchRecords}
      />

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <DeleteDialog
        record={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
