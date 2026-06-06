/**
 * CompanyDetail page — detailed view of a single company at /companies/:id.
 *
 * • Company header card (name, sector, website, total visits)
 * • Anonymized placement records table
 * • CTC trend LineChart across academic years
 * • "Add Record" button that pre-fills company in AddRecordModal
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Globe,
  TrendingUp,
  Plus,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileText,
  Layers,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCompany, getCompanyRecords } from "../services/companyService";
import { useToast } from "../store/ToastContext";
import EmptyState from "../components/ui/EmptyState";
import AddRecordModal from "../components/AddRecordModal";

/* ── Status badge styles ─────────────────────────────────────────────── */
const STATUS_STYLES = {
  selected:              "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected:              "bg-red-50 text-red-700 ring-red-600/20",
  pending:               "bg-amber-50 text-amber-700 ring-amber-600/20",
  coordinator_approved:  "bg-blue-50 text-blue-700 ring-blue-600/20",
  coordinator_rejected:  "bg-orange-50 text-orange-700 ring-orange-600/20",
};

const STATUS_LABEL = {
  selected: "Selected",
  rejected: "Rejected",
  pending: "Pending",
  coordinator_approved: "Approved",
  coordinator_rejected: "Rejected (Coord)",
};

/* ── Sector badge ────────────────────────────────────────────────────── */
const SECTOR_STYLES = {
  Tech:       "bg-blue-50 text-blue-700 ring-blue-600/20",
  Finance:    "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Core:       "bg-amber-50 text-amber-700 ring-amber-600/20",
  Consulting: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Other:      "bg-gray-100 text-gray-600 ring-gray-500/20",
};

/* ── Skeleton loader ─────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-32 rounded-lg bg-gray-200" />
            <div className="flex gap-3">
              <div className="h-6 w-20 rounded-full bg-gray-200" />
              <div className="h-6 w-32 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

/* ── Custom chart tooltip ────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-primary-600 mt-1">
        Avg CTC: <span className="font-bold">₹{payload[0].value.toFixed(2)} LPA</span>
      </p>
    </div>
  );
}

/* ── Main page component ─────────────────────────────────────────────── */
export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [company, setCompany] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [companyData, recordsData] = await Promise.all([
        getCompany(id),
        getCompanyRecords(id),
      ]);
      setCompany(companyData);
      setRecords(recordsData);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load company details.";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── CTC trend data ─────────────────────────────────────────────────
  const ctcTrendData = useMemo(() => {
    const byYear = {};
    records.forEach((r) => {
      if (r.ctc_offered != null) {
        const yr = r.academic_year;
        if (!byYear[yr]) byYear[yr] = { sum: 0, count: 0 };
        byYear[yr].sum += Number(r.ctc_offered);
        byYear[yr].count += 1;
      }
    });
    return Object.entries(byYear)
      .map(([year, { sum, count }]) => ({
        year,
        avg_ctc: parseFloat((sum / count).toFixed(2)),
      }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [records]);

  return (
    <div className="space-y-6">
      {/* ── Back button ──────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/companies")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors cursor-pointer group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Companies
      </button>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading && <DetailSkeleton />}

      {/* ── Company header card ──────────────────────────────────────── */}
      {!loading && !error && company && (
        <>
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0">
                <Building2 size={28} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {company.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {company.sector && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                        SECTOR_STYLES[company.sector] || SECTOR_STYLES.Other
                      }`}
                    >
                      {company.sector}
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      <Globe size={14} />
                      <span className="truncate max-w-[200px] hover:underline">
                        {company.website.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg bg-primary-50 mb-2">
                  <Users size={16} className="text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {records.length}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Total Visits</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg bg-emerald-50 mb-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter((r) => r.status === "selected" || r.status === "coordinator_approved").length}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Selections</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg bg-amber-50 mb-2">
                  <Layers size={16} className="text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {records.reduce((sum, r) => sum + (r.rounds?.length || 0), 0)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Total Rounds</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-9 h-9 mx-auto rounded-lg bg-violet-50 mb-2">
                  <FileText size={16} className="text-violet-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {ctcTrendData.length > 0
                    ? `₹${(
                        records
                          .filter((r) => r.ctc_offered != null)
                          .reduce((s, r) => s + Number(r.ctc_offered), 0) /
                        records.filter((r) => r.ctc_offered != null).length
                      ).toFixed(1)}`
                    : "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Avg CTC (LPA)</p>
              </div>
            </div>
          </div>

          {/* ── CTC Trend Chart ──────────────────────────────────────── */}
          {ctcTrendData.length > 1 && (
            <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
                  <TrendingUp size={16} className="text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  CTC Trend Across Academic Years
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={ctcTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avg_ctc"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Records table section ────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
                  <FileText size={16} className="text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  Placement Records
                </h3>
                <span className="ml-1 text-xs text-gray-400">
                  ({records.length})
                </span>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
              >
                <Plus size={16} />
                Add Record
              </button>
            </div>

            {/* Empty state */}
            {records.length === 0 && (
              <div className="p-6">
                <EmptyState
                  icon={FileText}
                  title="No placement records yet"
                  description={`No placement records exist for ${company.name}. Start by adding the first one.`}
                  iconBg="bg-primary-50"
                  iconColor="text-primary-400"
                  actionLabel="Add Record"
                  onAction={() => setModalOpen(true)}
                />
              </div>
            )}

            {/* Table */}
            {records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role Applied
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        CTC (LPA)
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Rounds
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-medium text-gray-900">
                          {record.role_applied}
                        </td>
                        <td className="px-6 py-3.5 text-gray-600">
                          {record.academic_year}
                        </td>
                        <td className="px-6 py-3.5 text-gray-600">
                          {record.ctc_offered != null
                            ? `₹${Number(record.ctc_offered).toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
                              STATUS_STYLES[record.status] || STATUS_STYLES.pending
                            }`}
                          >
                            {STATUS_LABEL[record.status] || record.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Layers size={14} className="text-gray-400" />
                            {record.rounds?.length || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary footer */}
            {records.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
                <p className="text-xs text-gray-400">
                  Showing {records.length}{" "}
                  {records.length === 1 ? "record" : "records"} • Data is
                  anonymized
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Add Record Modal ─────────────────────────────────────────── */}
      <AddRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
