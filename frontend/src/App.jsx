import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary       from "./components/ErrorBoundary";
import MainLayout           from "./components/layout/MainLayout";
import ProtectedRoute       from "./components/ProtectedRoute";
import CoordinatorRoute     from "./components/CoordinatorRoute";
import Dashboard            from "./pages/Dashboard";
import Login                from "./pages/Login";
import Register             from "./pages/Register";
import ForgotPassword       from "./pages/ForgotPassword";
import Companies            from "./pages/Companies";
import CompanyDetail        from "./pages/CompanyDetail";
import Records              from "./pages/Records";
import RecordDetail         from "./pages/RecordDetail";
import Profile              from "./pages/Profile";
import Analytics            from "./pages/Analytics";
import QuestionBank         from "./pages/QuestionBank";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorStudents  from "./pages/coordinator/CoordinatorStudents";
import NotFound             from "./pages/NotFound";

/**
 * Root component — sets up client-side routing.
 *
 * Public routes:       /login, /register
 * Layout routes:       /, /companies, /records, /records/:id, /profile, /analytics
 * Coordinator routes:  /coordinator/dashboard, /coordinator/students
 * Fallback:            * → NotFound
 *
 * All authenticated pages share the MainLayout (Sidebar + TopNav + Outlet).
 * They are wrapped in <ProtectedRoute> which redirects to /login when
 * the user is unauthenticated and shows a loading spinner while the
 * initial auth check runs.
 *
 * Coordinator routes are additionally wrapped in <CoordinatorRoute> which
 * checks for coordinator role and shows an "Access Denied" page for students.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* ---- Public (no sidebar) ---- */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ---- Authenticated (with MainLayout: Sidebar + TopNav) ---- */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index            element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="records"   element={<Records />} />
            <Route path="records/:id" element={<RecordDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="profile"   element={<Profile />} />

            {/* ---- Coordinator-only (nested under MainLayout) ---- */}
            <Route element={<CoordinatorRoute />}>
              <Route path="coordinator/dashboard" element={<CoordinatorDashboard />} />
              <Route path="coordinator/students"  element={<CoordinatorStudents />} />
            </Route>
          </Route>

          {/* ---- Catch-all ---- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
