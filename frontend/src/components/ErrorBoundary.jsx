/**
 * ErrorBoundary — catches React rendering errors and shows a fallback UI.
 *
 * Class component (required for componentDidCatch).
 */
import { Component } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200/60 bg-white p-8 shadow-xl text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-red-50 mb-5">
            <AlertOctagon size={32} className="text-red-500" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            An unexpected error occurred. Please try again.
          </p>

          {/* Error message */}
          {this.state.error?.message && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-left">
              <p className="text-xs text-red-600 font-mono break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Home size={16} />
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
