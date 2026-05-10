import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["Total Applications", "Companies Applied", "Selection Rate"].map(
          (title, i) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
            </div>
          )
        )}
      </div>

      <p className="text-sm text-gray-400">
        Data will populate once the dashboard is wired to the analytics API.
      </p>
    </div>
  );
}
