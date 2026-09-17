/**
 * GuestBanner — yellow info bar shown on all guest pages.
 * Encourages registration with a CTA button.
 */
import { Link } from "react-router-dom";
import { Eye, UserPlus } from "lucide-react";

export default function GuestBanner() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 mb-6 shadow-sm">
      <div className="flex items-center gap-2.5 text-sm text-amber-800">
        <Eye size={18} className="text-amber-600 shrink-0" />
        <span>
          <strong>Guest mode</strong> — data is read-only.
          Register to track your own placements.
        </span>
      </div>
      <Link
        to="/register"
        className="flex items-center gap-1.5 shrink-0 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:scale-[0.97]"
      >
        <UserPlus size={14} />
        Register Now
      </Link>
    </div>
  );
}
