/**
 * GuestLayout — wraps GuestSidebar + GuestTopNav + page content via <Outlet />.
 * Applied to all /guest/* routes.
 */
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, LogIn } from "lucide-react";
import GuestSidebar from "./GuestSidebar";

/** Map guest pathnames → human-readable titles. */
function getPageTitle(pathname) {
  const titles = {
    "/guest/dashboard":  "Dashboard",
    "/guest/companies":  "Companies",
    "/guest/records":    "Placement Records",
    "/guest/analytics":  "Analytics",
  };
  return titles[pathname] || "Guest";
}

export default function GuestLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <GuestSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top nav — simplified for guest */}
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("isGuest");
              navigate("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 md:pb-4 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav for guest */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200/80 md:hidden">
        <div className="flex items-center justify-around h-14">
          {[
            { to: "/guest/dashboard", label: "Home", icon: "🏠" },
            { to: "/guest/records",   label: "Records", icon: "📋" },
            { to: "/guest/companies", label: "Companies", icon: "🏢" },
            { to: "/guest/analytics", label: "Analytics", icon: "📊" },
          ].map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer
                  ${active ? "text-primary-600" : "text-gray-400"}
                `}
              >
                <span className="text-base">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
