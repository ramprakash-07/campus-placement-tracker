import { BrowserRouter, Routes, Route } from "react-router-dom";

import BaseLayout      from "./components/BaseLayout";
import ProtectedRoute  from "./components/ProtectedRoute";
import Dashboard       from "./pages/Dashboard";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Companies       from "./pages/Companies";
import Records         from "./pages/Records";
import Profile         from "./pages/Profile";
import Analytics       from "./pages/Analytics";
import NotFound        from "./pages/NotFound";

/**
 * Root component — sets up client-side routing.
 *
 * Public routes:  /login, /register
 * Layout routes:  /, /companies, /records, /profile, /analytics
 * Fallback:       * → NotFound
 *
 * All non-auth pages are wrapped in <ProtectedRoute> which
 * redirects to /login when the user is unauthenticated and
 * shows a loading spinner while the initial auth check runs.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Public (no sidebar) ---- */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---- Authenticated (with sidebar layout) ---- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <Dashboard />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <Companies />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <Records />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <Profile />
              </BaseLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <BaseLayout>
                <Analytics />
              </BaseLayout>
            </ProtectedRoute>
          }
        />

        {/* ---- Catch-all ---- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
