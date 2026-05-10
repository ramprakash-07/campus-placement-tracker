import { FileText } from "lucide-react";

export default function Records() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Placement Records</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Placement records listing will be implemented in an upcoming sprint.
        </p>
      </div>
    </div>
  );
}
