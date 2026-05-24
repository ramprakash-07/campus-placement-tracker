/**
 * EmptyState — reusable empty-state placeholder.
 *
 * Displays a centered card with an icon, heading, description,
 * and an optional CTA button. Consistent styling across all pages.
 *
 * Usage:
 *   <EmptyState
 *     icon={Inbox}
 *     title="No records yet"
 *     description="Start by adding your first placement record."
 *     actionLabel="Add Record"
 *     onAction={() => setModalOpen(true)}
 *   />
 */
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-400",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration circle */}
      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${iconBg} mb-4`}>
        <Icon size={28} className={iconColor} />
      </div>

      {/* Decorative dots */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="w-1 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {/* CTA button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
