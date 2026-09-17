/**
 * GuestAnalytics — public analytics with charts.
 * Summary from /public/analytics/summary, top companies from /public/analytics/top-companies.
 */
import { useState, useEffect } from "react";
import {
  FileText,
  Building2,
  TrendingUp,
  IndianRupee,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getPublicSummary, getPublicTopCompanies, getPublicRecords } from "../../services/publicService";
import GuestBanner from "../../components/GuestBanner";

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1", "#8b5cf6"];

export default function GuestAnalytics() {
  const [summary, setSummary] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryData, topData, recordsData] = await Promise.all([
          getPublicSummary(),
          getPublicTopCompanies(),
          getPublicRecords(),
        ]);
        setSummary(summaryData);
        setTopCompanies(topData);

        // Build status distribution from records
        const statusCounts = {};
        (recordsData.data || []).forEach((r) => {
          const s = r.status || "unknown";
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });
        setStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({
            name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            value,
          }))
        );
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Records", value: summary?.total_records ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Companies", value: summary?.total_companies ?? 0, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Selection Rate", value: `${summary?.selection_rate ?? 0}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Avg CTC (LPA)", value: summary?.avg_ctc?.toFixed(1) ?? "0.0", icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div>
      <GuestBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies Chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Top Companies by Frequency
          </h2>
          {topCompanies.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCompanies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis
                  dataKey="company"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,.08)",
                  }}
                />
                <Bar
                  dataKey="record_count"
                  name="Records"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Outcome Distribution
          </h2>
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
