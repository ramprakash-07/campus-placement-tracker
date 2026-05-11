import { LayoutDashboard, LogIn, UserPlus, Building2, FileText, User, BarChart3, Menu, X, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/companies", label: "Companies",  icon: Building2 },
  { to: "/records",   label: "Records",    icon: FileText },
  { to: "/analytics", label: "Analytics",  icon: BarChart3 },
  { to: "/profile",   label: "Profile",    icon: User },
];

/**
 * Base layout — persistent sidebar + top-bar with a scrollable content area.
 * Wraps all authenticated pages.
 */
export default function BaseLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ---------------------------------------------------------------- */}
      {/* Sidebar — desktop (always visible) + mobile (overlay)            */}
      {/* ---------------------------------------------------------------- */}

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-gray-200
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">
            Placement<br />Tracker
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Main content area                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1).replace(/-/g, " ")}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
