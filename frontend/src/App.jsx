import { BrowserRouter, Routes, Route } from "react-router-dom";

import BaseLayout from "./components/BaseLayout";
import Dashboard  from "./pages/Dashboard";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Companies  from "./pages/Companies";
import Records    from "./pages/Records";
import Profile    from "./pages/Profile";
import Analytics  from "./pages/Analytics";
import NotFound   from "./pages/NotFound";

/**
 * Root component — sets up client-side routing.
 *
 * Public routes:  /login, /register
 * Layout routes:  /, /companies, /records, /profile, /analytics
 * Fallback:       * → NotFound
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
            <BaseLayout>
              <Dashboard />
            </BaseLayout>
          }
        />
        <Route
          path="/companies"
          element={
            <BaseLayout>
              <Companies />
            </BaseLayout>
          }
        />
        <Route
          path="/records"
          element={
            <BaseLayout>
              <Records />
            </BaseLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <BaseLayout>
              <Profile />
            </BaseLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <BaseLayout>
              <Analytics />
            </BaseLayout>
          }
        />

        {/* ---- Catch-all ---- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
