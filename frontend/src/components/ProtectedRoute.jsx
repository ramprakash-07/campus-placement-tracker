/**
 * ProtectedRoute — guards child components behind authentication.
 *
 * While the auth check is in progress a full-screen loading spinner is shown.
 * Once resolved, unauthenticated users are redirected to /login.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // ── Full-screen spinner while auth state is being resolved ──────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={40}
            className="animate-spin text-primary-600"
          />
          <p className="text-sm font-medium text-gray-500 tracking-wide">
            Checking authentication…
          </p>
        </div>
      </div>
    );
  }

  // ── Redirect unauthenticated users ─────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
