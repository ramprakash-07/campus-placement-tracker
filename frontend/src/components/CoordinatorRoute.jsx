/**
 * CoordinatorRoute — route guard for coordinator-only pages.
 *
 * • If not authenticated → redirect to /login
 * • If authenticated but not coordinator → "Access Denied" UI
 * • If authenticated + coordinator → render <Outlet />
 */
import { Navigate, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../store/AuthContext";

export default function CoordinatorRoute() {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();

  // Still checking auth — show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not a coordinator
  if (role !== "coordinator") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md text-center">
          {/* Card */}
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-xl p-8 space-y-5">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mx-auto">
              <ShieldOff size={28} className="text-red-500" />
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Access Restricted
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                This page is for placement coordinators only.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Action */}
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Coordinator — render nested routes
  return <Outlet />;
}
