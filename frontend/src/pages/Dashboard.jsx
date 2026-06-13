/**
 * Dashboard page — KPI cards, activity feed, records-by-year chart, recent records.
 *
 * Layout: 12-column responsive grid
 *  Top:          4 KPI cards (full width)
 *  Bottom-left:  Records per year BarChart (col-span-7)
 *  Bottom-right: Recent records mini table (col-span-5)
 *  Middle:       Activity feed (full width)
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Layers,
  TrendingUp,
  IndianRupee,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getActivityFeed } from "../services/questionBankService";
import api from "../services/api";

/* ── Action config for activity timeline ─────────────────────────────── */
const ACTION_CONFIG = {
  record_added:   { icon: Plus,    color: "text-emerald-500", bg: "bg-emerald-50",  label: "Record Added" },
  round_added:    { icon: Layers,  color: "text-blue-500",    bg: "bg-blue-50",     label: "Round Added" },
  record_updated: { icon: Pencil,  color: "text-amber-500",   bg: "bg-amber-50",    label: "Record Updated" },
  record_deleted: { icon: Trash2,  color: "text-red-500",     bg: "bg-red-50",      label: "Record Deleted" },
};

/* ── Status badge ────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  pending:  "bg-amber-50 text-amber-700",
};

/* ── Relative time helper ────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ── Custom chart tooltip ────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-lg text-sm">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-primary-600 mt-0.5">
        <span className="font-bold">{payload[0].value}</span> records
      </p>
    </div>
  );
}

/* ── Main Dashboard component ────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Fetch summary stats
  useEffect(() => {
    api.get("/analytics/summary")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  // Fetch activity feed
  useEffect(() => {
    getActivityFeed()
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoadingActivity(false));
  }, []);

  // Fetch records by year
  useEffect(() => {
    api.get("/analytics/records-by-year")
      .then(({ data }) => setYearData(data))
      .catch(() => {})
      .finally(() => setLoadingChart(false));
  }, []);

  // Fetch recent records (last 5)
  useEffect(() => {
    api.get("/placement-records", { params: { page: 1, limit: 5 } })
      .then(({ data }) => setRecentRecords(data.data || []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  const kpiCards = [
    {
      title: "Total Records",
      value: stats?.total_records ?? "—",
      icon: FileText,
      gradient: "from-primary-500 to-primary-600",
      bg: "bg-primary-50",
    },
    {
      title: "Selection Rate",
      value: stats?.selection_rate != null ? `${stats.selection_rate}%` : "—",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Avg CTC Offered",
      value: stats?.avg_ctc ? `₹${stats.avg_ctc} LPA` : "—",
      icon: IndianRupee,
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Rounds",
      value: stats?.total_rounds ?? "—",
      icon: Layers,
      gradient: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      {/* ── KPI Cards (4 across) ──────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ title, value, icon: Icon, gradient }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
              {loadingStats
                ? <Loader2 size={24} className="animate-spin text-gray-300" />
                : value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bottom grid: Chart + Recent Records ───────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* ── Records per Year BarChart (7 cols) ─────────────────────── */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
              <BarChart3 size={16} className="text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Records by Academic Year</h3>
          </div>
          {loadingChart ? (
            <div className="flex items-center justify-center h-56">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : yearData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-sm text-gray-400">
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Recently Added Records (5 cols) ────────────────────────── */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary-600" />
              <h3 className="text-base font-semibold text-gray-900">Recent Records</h3>
            </div>
            <Link
              to="/records"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {loadingRecent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-gray-300" />
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No records yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentRecords.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/records/${rec.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rec.company?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{rec.role_applied}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        STATUS_STYLES[rec.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {rec.status}
                    </span>
                    <ExternalLink
                      size={14}
                      className="text-gray-300 group-hover:text-primary-500 transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Activity Feed (full width) ────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary-600" />
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
          </div>
        </div>

        {loadingActivity && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        )}

        {!loadingActivity && activities.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No activity yet. Start by adding placement records.
          </div>
        )}

        {!loadingActivity && activities.length > 0 && (
          <div className="px-5 py-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

              <div className="space-y-4">
                {activities.map((activity) => {
                  const cfg = ACTION_CONFIG[activity.action_type] || ACTION_CONFIG.record_added;
                  const Icon = cfg.icon;
                  return (
                    <div key={activity.id} className="relative flex items-start gap-4 pl-1">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${cfg.bg} ring-4 ring-white`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-gray-700">
                          {activity.description || cfg.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {timeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
