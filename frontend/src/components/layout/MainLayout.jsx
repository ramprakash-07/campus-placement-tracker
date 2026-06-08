/**
 * MainLayout — wraps Sidebar + TopNav + BottomNav + page content via <Outlet />.
 *
 * Applied to all protected (authenticated) routes.
 * - Desktop: Sidebar (left) + TopNav (top) + content
 * - Mobile: TopNav (top) + content + BottomNav (bottom), sidebar hidden
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar   from "./Sidebar";
import TopNav    from "./TopNav";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* ── Sidebar (hidden below md, visible on md+) ──────────────── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main content area ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileOpen(true)} />

        {/* Page content — bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 md:pb-4 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ──────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
