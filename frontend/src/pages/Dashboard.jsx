/**
 * Dashboard page — summary stats + activity feed timeline.
 */
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Layers,
  TrendingUp,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { getActivityFeed } from "../services/questionBankService";
import api from "../services/api";

const ACTION_CONFIG = {
  record_added:   { icon: Plus,    color: "text-emerald-500", bg: "bg-emerald-50", label: "Record Added" },
  round_added:    { icon: Layers,  color: "text-blue-500",    bg: "bg-blue-50",    label: "Round Added" },
  record_updated: { icon: Pencil,  color: "text-amber-500",   bg: "bg-amber-50",   label: "Record Updated" },
  record_deleted: { icon: Trash2,  color: "text-red-500",     bg: "bg-red-50",     label: "Record Deleted" },
};

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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch basic stats from analytics
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

  const statCards = [
    {
      title: "Total Applications",
      value: stats?.total_records ?? "—",
      icon: FileText,
      gradient: "from-primary-500 to-primary-600",
    },
    {
      title: "Companies Applied",
      value: stats?.total_companies ?? "—",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Selection Rate",
      value: stats?.selection_rate != null ? `${stats.selection_rate}%` : "—",
      icon: Layers,
      gradient: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ title, value, icon: Icon, gradient }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {loadingStats ? <Loader2 size={24} className="animate-spin text-gray-300" /> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity feed */}
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

              {/* Timeline items */}
              <div className="space-y-4">
                {activities.map((activity) => {
                  const cfg = ACTION_CONFIG[activity.action_type] || ACTION_CONFIG.record_added;
                  const Icon = cfg.icon;
                  return (
                    <div key={activity.id} className="relative flex items-start gap-4 pl-1">
                      {/* Icon dot */}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${cfg.bg} ring-4 ring-white`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      {/* Content */}
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
