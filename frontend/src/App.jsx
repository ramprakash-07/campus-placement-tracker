import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout      from "./components/layout/MainLayout";
import ProtectedRoute  from "./components/ProtectedRoute";
import Dashboard       from "./pages/Dashboard";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import Companies       from "./pages/Companies";
import Records         from "./pages/Records";
import RecordDetail    from "./pages/RecordDetail";
import Profile         from "./pages/Profile";
import Analytics       from "./pages/Analytics";
import NotFound        from "./pages/NotFound";

/**
 * Root component — sets up client-side routing.
 *
 * Public routes:  /login, /register
 * Layout routes:  /, /companies, /records, /records/:id, /profile, /analytics
 * Fallback:       * → NotFound
 *
 * All authenticated pages share the MainLayout (Sidebar + TopNav + Outlet).
 * They are wrapped in <ProtectedRoute> which redirects to /login when
 * the user is unauthenticated and shows a loading spinner while the
 * initial auth check runs.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Public (no sidebar) ---- */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---- Authenticated (with MainLayout: Sidebar + TopNav) ---- */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index          element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="records"   element={<Records />} />
          <Route path="records/:id" element={<RecordDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile"   element={<Profile />} />
        </Route>

        {/* ---- Catch-all ---- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
