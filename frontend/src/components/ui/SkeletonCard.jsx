/**
 * SkeletonCard — reusable card-shaped loading skeleton.
 *
 * Variants:
 *  - "default"  — icon + two text lines + body lines
 *  - "stat"     — icon + label + large number
 *  - "compact"  — smaller card with single text line
 *
 * Usage:
 *   <SkeletonCard />
 *   <SkeletonCard variant="stat" />
 */

const variants = {
  default: (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
          <div className="h-3 w-1/3 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-lg bg-gray-100" />
        <div className="h-3 w-2/3 rounded-lg bg-gray-100" />
      </div>
    </div>
  ),

  stat: (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-lg bg-gray-200" />
          <div className="h-7 w-14 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  ),

  compact: (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-lg bg-gray-200" />
          <div className="h-3 w-1/3 rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  ),
};

export default function SkeletonCard({ variant = "default" }) {
  return variants[variant] || variants.default;
}
