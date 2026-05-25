/**
 * Pagination — reusable pagination control.
 *
 * Shows prev/next buttons and up to 5 page numbers with ellipsis.
 * Handles edge cases for first/last pages.
 *
 * Props:
 *  - currentPage: number (1-indexed)
 *  - totalPages: number
 *  - onPageChange: (page: number) => void
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Build the visible page numbers array (max 5 + ellipsis).
 */
function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  if (current <= 3) {
    pages.push(1, 2, 3, 4, "…", total);
  } else if (current >= total - 2) {
    pages.push(1, "…", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "…", current - 1, current, current + 1, "…", total);
  }

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center w-9 h-9 text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              page === currentPage
                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
