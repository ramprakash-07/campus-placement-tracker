/**
 * MainLayout — wraps Sidebar + TopNav + page content via <Outlet />.
 *
 * Applied to all protected (authenticated) routes.
 * The sidebar can be collapsed on desktop and toggled on mobile.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav  from "./TopNav";

export default function MainLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileOpen(true)} />

        {/* Page content rendered via nested routes */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
