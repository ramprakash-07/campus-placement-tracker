/**
 * NotFound (404) page — shown for unmatched routes.
 */
import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {/* Illustration */}
      <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-primary-50 mb-6 shadow-sm">
        <FileQuestion size={48} className="text-primary-400" />
      </div>

      {/* 404 text */}
      <h1 className="text-7xl font-extrabold text-gray-900 tracking-tight">404</h1>
      <h2 className="mt-3 text-xl font-bold text-gray-700">Page not found</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. 
        It might have been moved or doesn&apos;t exist.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
