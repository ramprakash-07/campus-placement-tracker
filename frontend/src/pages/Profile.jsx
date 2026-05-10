import { User } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Profile management will be implemented in an upcoming sprint.
        </p>
      </div>
    </div>
  );
}
