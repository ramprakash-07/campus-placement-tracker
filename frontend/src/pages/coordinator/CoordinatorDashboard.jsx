/**
 * CoordinatorDashboard — overview page for placement coordinators.
 *
 * Sections:
 *  1. KPI cards — total students, total records, selection rate, avg CTC
 *  2. Pending Approvals queue — records needing coordinator decision
 *  3. All Student Records table — full record list with status badges
 */
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { getStudents, updateRecordStatus } from "../../services/coordinatorService";
import { getSummary, getPackages } from "../../services/analyticsService";
import { getRecords } from "../../services/recordService";
import Toast from "../../components/Toast";
import SkeletonRow from "../../components/ui/SkeletonRow";
import EmptyState from "../../components/ui/EmptyState";

/* ── Status badge styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  selected: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  coordinator_approved: "bg-blue-50 text-blue-700 ring-blue-600/20",
  coordinator_rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const STATUS_DOT = {
  selected: "bg-emerald-500",
  rejected: "bg-red-500",
  pending: "bg-amber-400",
  coordinator_approved: "bg-blue-500",
  coordinator_rejected: "bg-rose-500",
};

const STATUS_LABEL = {
  selected: "Selected",
  rejected: "Rejected",
  pending: "Pending",
  coordinator_approved: "Approved",
  coordinator_rejected: "Rejected (Coord)",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const dot = STATUS_DOT[status] || STATUS_DOT.pending;
  const label = STATUS_LABEL[status] || status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ── KPI Stat Card ───────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, loading }) {
  const gradients = {
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };
  const shadows = {
    indigo: "shadow-indigo-500/20",
    violet: "shadow-violet-500/20",
    emerald: "shadow-emerald-500/20",
    amber: "shadow-amber-500/20",
  };

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[color]} ${shadows[color]} shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-16 rounded-lg bg-gray-200 animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}



/* ── Main component ──────────────────────────────────────────────────── */
export default function CoordinatorDashboard() {
  // KPI data
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [avgCtc, setAvgCtc] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Records data
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");

  // Approve/Reject mutation state
  const [pendingMutationId, setPendingMutationId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // ── Fetch KPI data ──────────────────────────────────────────────────
  const fetchKpis = useCallback(async () => {
    setKpiLoading(true);
    try {
      const [studentsData, summaryData, packagesData] = await Promise.all([
        getStudents(),
        getSummary(),
        getPackages(),
      ]);
      setStudents(studentsData);
      setSummary(summaryData);

      // Compute average of avg_ctc across all companies
      if (packagesData.length > 0) {
        const total = packagesData.reduce((sum, p) => sum + (p.avg_ctc || 0), 0);
        setAvgCtc((total / packagesData.length).toFixed(2));
      } else {
        setAvgCtc("0");
      }
    } catch {
      // KPI errors are non-blocking
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // ── Fetch all records ───────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    setError("");
    try {
      const data = await getRecords();
      setRecords(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load placement records."
      );
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpis();
    fetchRecords();
  }, [fetchKpis, fetchRecords]);

  // ── Approve / Reject handler ────────────────────────────────────────
  const handleStatusUpdate = async (recordId, newStatus) => {
    setPendingMutationId(recordId);
    try {
      await updateRecordStatus(recordId, newStatus);
      setToast({
        message:
          newStatus === "coordinator_approved"
            ? "Record approved"
            : "Record rejected",
        type: "success",
      });
      // Refresh records
      await fetchRecords();
      await fetchKpis();
    } catch (err) {
      setToast({
        message:
          err.response?.data?.detail || "Failed to update record status.",
        type: "error",
      });
    } finally {
      setPendingMutationId(null);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────
  const pendingRecords = records.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
          <LayoutDashboard size={22} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coordinator Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Platform-wide placement overview
          </p>
        </div>
      </div>

      {/* ── Section 1: KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={students.length}
          color="indigo"
          loading={kpiLoading}
        />
        <StatCard
          icon={FileText}
          label="Total Records"
          value={summary?.total_companies ?? 0}
          color="violet"
          loading={kpiLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Selection Rate"
          value={`${summary?.selection_rate ?? 0}%`}
          color="emerald"
          loading={kpiLoading}
        />
        <StatCard
          icon={IndianRupee}
          label="Avg CTC (LPA)"
          value={`₹${avgCtc ?? 0}`}
          color="amber"
          loading={kpiLoading}
        />
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
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

      {/* ── Section 2: Pending Approvals ─────────────────────────────── */}
      {!recordsLoading && pendingRecords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Approvals
            </h3>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-amber-600/20">
              {pendingRecords.length}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-200/60 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-amber-50/40 border-b border-amber-100">
                    {["Student", "Company", "Role", "Year", "CTC", "Status", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingRecords.map((rec) => {
                    const isMutating = pendingMutationId === rec.id;
                    return (
                      <tr key={rec.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">
                          {rec.user_id}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {rec.company?.name || `#${rec.company_id}`}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {rec.role_applied}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                            {rec.academic_year}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">
                          {rec.ctc_offered != null
                            ? `₹${Number(rec.ctc_offered).toLocaleString("en-IN")} LPA`
                            : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={rec.status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(rec.id, "coordinator_approved")}
                              disabled={isMutating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isMutating ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(rec.id, "coordinator_rejected")}
                              disabled={isMutating}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-inset ring-red-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isMutating ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <XCircle size={14} />
                              )}
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: All Student Records ───────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          All Student Records
        </h3>

        {/* Loading */}
        {recordsLoading && (
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {["Student", "Company", "Role", "Year", "CTC", "Status", "Coord. Status", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={8} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty */}
        {!recordsLoading && !error && records.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No placement records yet"
            description="Students haven't added any placement records to the platform."
            iconBg="bg-primary-50"
            iconColor="text-primary-400"
          />
        )}

        {/* Table */}
        {!recordsLoading && !error && records.length > 0 && (
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {["Student", "Company", "Role", "Year", "CTC", "Status", "Coord. Status", "Actions"].map(
                      (h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((rec) => {
                    const isMutating = pendingMutationId === rec.id;
                    const isDecided =
                      rec.status === "coordinator_approved" ||
                      rec.status === "coordinator_rejected";

                    return (
                      <tr key={rec.id} className="group hover:bg-primary-50/30 transition-colors">
                        {/* Student */}
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {rec.user_id}
                        </td>

                        {/* Company */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0">
                              <FileText size={14} className="text-primary-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                              {rec.company?.name || `#${rec.company_id}`}
                            </span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {rec.role_applied}
                        </td>

                        {/* Year */}
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

                        {/* Company Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={rec.status} />
                        </td>

                        {/* Coordinator Status */}
                        <td className="px-5 py-4">
                          {isDecided ? (
                            <StatusBadge status={rec.status} />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-gray-50 text-gray-500 ring-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Awaiting
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          {isDecided ? (
                            <span className="text-xs text-gray-400">Decided</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStatusUpdate(rec.id, "coordinator_approved")}
                                disabled={isMutating}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isMutating ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={12} />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(rec.id, "coordinator_rejected")}
                                disabled={isMutating}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-inset ring-red-600/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isMutating ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <XCircle size={12} />
                                )}
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40">
              <p className="text-xs text-gray-400">
                Showing {records.length} {records.length === 1 ? "record" : "records"}
              </p>
            </div>
          </div>
        )}
      </div>

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
