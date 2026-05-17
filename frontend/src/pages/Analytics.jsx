/**
 * Analytics page — multi-section dashboard with charts and summary stats.
 *
 * Section 1: Summary cards (total companies, total rounds, selection rate %)
 * Section 2: Package Distribution — BarChart (avg CTC by company, min/max dots)
 * Section 3: Top Companies Visiting Campus — Horizontal bar chart by frequency
 * Section 4: Round-wise Dropout Rates (All Students) — RadarChart
 * Section 5: My Round Performance — PieChart (passed vs failed)
 *
 * Each section fetches data independently with its own loading state.
 */
import { useState, useEffect } from "react";
import {
  BarChart3,
  Building2,
  Layers,
  TrendingUp,
  Package,
  Users,
  Target,
  PieChart as PieChartIcon,
  Inbox,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Legend,
  ReferenceDot,
} from "recharts";
import {
  getSummary,
  getPackages,
  getTopCompanies,
  getDropoutRates,
  getMyRoundPerformance,
} from "../services/analyticsService";

/* ── Color palette ───────────────────────────────────────────────────── */
const INDIGO = {
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4F46E5",
  700: "#4338ca",
  800: "#3730a3",
};

const PIE_COLORS = {
  passed: "#10b981",
  failed: "#ef4444",
  pending: "#f59e0b",
};

const HORIZONTAL_BAR_COLORS = [
  INDIGO[600],
  INDIGO[500],
  INDIGO[400],
  INDIGO[300],
  INDIGO[700],
  INDIGO[800],
  "#7c3aed",
  "#6d28d9",
  "#8b5cf6",
  "#a78bfa",
];

const ROUND_TYPE_LABELS = {
  aptitude: "Aptitude",
  technical: "Technical",
  hr: "HR",
  group_discussion: "Group Discussion",
  coding: "Coding",
};

/* ── Skeleton loaders ────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-lg bg-gray-200" />
          <div className="h-7 w-14 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ height = 300 }) {
  return (
    <div
      className="rounded-2xl border border-gray-200/60 bg-white shadow-sm animate-pulse"
      style={{ height }}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-5 w-48 rounded-lg bg-gray-200" />
      </div>
      <div className="p-6 flex items-end justify-center gap-3" style={{ height: height - 80 }}>
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
          <div
            key={i}
            className="rounded-t-lg bg-gray-100"
            style={{ width: 32, height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Empty state component ───────────────────────────────────────────── */
function EmptyChart({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
        <Inbox size={22} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

/* ── Summary stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bgFrom, bgTo }) {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${bgFrom} ${bgTo} flex-shrink-0`}
        >
          <Icon size={20} className={color} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Chart section wrapper ───────────────────────────────────────────── */
function ChartSection({ icon: Icon, title, iconBg, iconColor, children }) {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Custom tooltips ─────────────────────────────────────────────────── */
function PackageTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      <div className="space-y-0.5 text-gray-600">
        <p>
          Avg CTC:{" "}
          <span className="font-medium text-indigo-600">
            ₹{data?.avg_ctc?.toFixed(2)} LPA
          </span>
        </p>
        {data?.min_ctc != null && (
          <p>
            Min: <span className="font-medium">₹{data.min_ctc?.toFixed(2)} LPA</span>
          </p>
        )}
        {data?.max_ctc != null && (
          <p>
            Max: <span className="font-medium">₹{data.max_ctc?.toFixed(2)} LPA</span>
          </p>
        )}
      </div>
    </div>
  );
}

function TopCompanyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900">{payload[0]?.payload?.company}</p>
      <p className="text-gray-600">
        Visits:{" "}
        <span className="font-medium text-indigo-600">{payload[0]?.value}</span>
      </p>
    </div>
  );
}

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{data?.label}</p>
      <div className="space-y-0.5 text-gray-600">
        <p>
          Dropout Rate:{" "}
          <span className="font-medium text-red-600">
            {data?.dropout_rate_percent}%
          </span>
        </p>
        <p>
          Failed: {data?.failed} / {data?.total}
        </p>
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900 capitalize">{entry.name}</p>
      <p className="text-gray-600">
        Count:{" "}
        <span className="font-medium" style={{ color: entry.payload?.fill }}>
          {entry.value}
        </span>
      </p>
    </div>
  );
}

/* ── Custom legend for pie chart ─────────────────────────────────────── */
function CustomPieLegend({ payload }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-4">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── MAIN COMPONENT ──────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */
export default function Analytics() {
  // ── Section 1: Summary ──────────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // ── Section 2: Packages ─────────────────────────────────────────────
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // ── Section 3: Top companies ────────────────────────────────────────
  const [topCompanies, setTopCompanies] = useState([]);
  const [topLoading, setTopLoading] = useState(true);

  // ── Section 4: Dropout rates ────────────────────────────────────────
  const [dropout, setDropout] = useState([]);
  const [dropoutLoading, setDropoutLoading] = useState(true);

  // ── Section 5: My round performance ─────────────────────────────────
  const [performance, setPerformance] = useState([]);
  const [perfLoading, setPerfLoading] = useState(true);

  // ── Fetch all data independently ────────────────────────────────────
  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));

    getPackages()
      .then(setPackages)
      .catch(() => {})
      .finally(() => setPackagesLoading(false));

    getTopCompanies()
      .then((data) => {
        // sort descending by visit_count
        setTopCompanies(data.sort((a, b) => b.visit_count - a.visit_count));
      })
      .catch(() => {})
      .finally(() => setTopLoading(false));

    getDropoutRates()
      .then((data) =>
        setDropout(
          data.map((d) => ({
            ...d,
            label: ROUND_TYPE_LABELS[d.round_type] || d.round_type,
          }))
        )
      )
      .catch(() => {})
      .finally(() => setDropoutLoading(false));

    getMyRoundPerformance()
      .then((data) => {
        // Aggregate into passed/failed/pending counts
        let passed = 0;
        let failed = 0;
        let pending = 0;
        data.forEach((d) => {
          passed += d.total - d.failed;
          failed += d.failed;
        });
        const pieData = [];
        if (passed > 0) pieData.push({ name: "passed", value: passed });
        if (failed > 0) pieData.push({ name: "failed", value: failed });
        setPerformance(pieData);
      })
      .catch(() => {})
      .finally(() => setPerfLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
          <BarChart3 size={22} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">
            Track your placement performance and campus trends
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Section 1: Summary Cards                                       */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : summary ? (
          <>
            <StatCard
              icon={Building2}
              label="Companies Applied"
              value={summary.total_companies}
              color="text-primary-600"
              bgFrom="from-primary-50"
              bgTo="to-primary-100"
            />
            <StatCard
              icon={Layers}
              label="Rounds Attended"
              value={summary.total_rounds}
              color="text-violet-600"
              bgFrom="from-violet-50"
              bgTo="to-violet-100"
            />
            <StatCard
              icon={TrendingUp}
              label="Selection Rate"
              value={`${summary.selection_rate}%`}
              color="text-emerald-600"
              bgFrom="from-emerald-50"
              bgTo="to-emerald-100"
            />
          </>
        ) : (
          <div className="sm:col-span-3 text-center text-sm text-gray-400 py-4">
            Unable to load summary data.
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Section 2: Package Distribution                                */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {packagesLoading ? (
        <ChartSkeleton height={400} />
      ) : (
        <ChartSection
          icon={Package}
          title="Package Distribution"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        >
          {packages.length === 0 ? (
            <EmptyChart message="No package data available. Add placement records with CTC values to see the chart." />
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={packages}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="company"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  label={{
                    value: "CTC (LPA)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#94a3b8" },
                  }}
                />
                <Tooltip content={<PackageTooltip />} cursor={{ fill: "#eef2ff" }} />
                <Bar
                  dataKey="avg_ctc"
                  name="Avg CTC"
                  fill={INDIGO[500]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                {/* Min/Max dot markers */}
                {packages.map((entry, idx) => (
                  <ReferenceDot
                    key={`min-${idx}`}
                    x={entry.company}
                    y={entry.min_ctc}
                    r={4}
                    fill={INDIGO[300]}
                    stroke="#fff"
                    strokeWidth={2}
                    isFront
                  />
                ))}
                {packages.map((entry, idx) => (
                  <ReferenceDot
                    key={`max-${idx}`}
                    x={entry.company}
                    y={entry.max_ctc}
                    r={4}
                    fill={INDIGO[700]}
                    stroke="#fff"
                    strokeWidth={2}
                    isFront
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
          {packages.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: INDIGO[500] }}
                />
                Avg CTC
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: INDIGO[300] }}
                />
                Min CTC
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: INDIGO[700] }}
                />
                Max CTC
              </span>
            </div>
          )}
        </ChartSection>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Section 3: Top Companies Visiting Campus                       */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {topLoading ? (
        <ChartSkeleton height={400} />
      ) : (
        <ChartSection
          icon={Users}
          title="Top Companies Visiting Campus"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        >
          {topCompanies.length === 0 ? (
            <EmptyChart message="No company visit data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(250, topCompanies.length * 48)}>
              <BarChart
                data={topCompanies}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="company"
                  type="category"
                  tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip content={<TopCompanyTooltip />} cursor={{ fill: "#eef2ff" }} />
                <Bar
                  dataKey="visit_count"
                  name="Visits"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {topCompanies.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={HORIZONTAL_BAR_COLORS[idx % HORIZONTAL_BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Section 4 & 5: Two charts side by side on larger screens        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Section 4: Dropout Rates (Radar) ───────────────────────── */}
        {dropoutLoading ? (
          <ChartSkeleton height={420} />
        ) : (
          <ChartSection
            icon={Target}
            title="Round-wise Dropout Rates (All Students)"
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          >
            {dropout.length === 0 ? (
              <EmptyChart message="No round data available to calculate dropout rates." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dropout}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<RadarTooltip />} />
                  <Radar
                    name="Dropout Rate"
                    dataKey="dropout_rate_percent"
                    stroke={INDIGO[600]}
                    fill={INDIGO[400]}
                    fillOpacity={0.35}
                    strokeWidth={2}
                    dot={{ r: 4, fill: INDIGO[600], strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </ChartSection>
        )}

        {/* ── Section 5: My Round Performance (Pie) ──────────────────── */}
        {perfLoading ? (
          <ChartSkeleton height={420} />
        ) : (
          <ChartSection
            icon={PieChartIcon}
            title="My Round Performance"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          >
            {performance.length === 0 ? (
              <EmptyChart message="No round performance data yet. Add rounds to your placement records." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={performance}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {performance.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend content={<CustomPieLegend />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartSection>
        )}
      </div>
    </div>
  );
}
