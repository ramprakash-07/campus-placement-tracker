/**
 * TopNav — horizontal navigation bar at the top of the main content area.
 *
 * Features:
 *  • Hamburger menu button (mobile only) to toggle the sidebar
 *  • Dynamic page title derived from the current route
 *  • Bell icon placeholder for future notifications
 *  • Logged-in user's name display
 *  • Logout button that calls AuthContext.logout() and redirects to /login
 */
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import SearchBar from "./SearchBar";

/**
 * Map pathname → human-readable page title.
 */
function getPageTitle(pathname) {
  const titles = {
    "/":          "Dashboard",
    "/companies": "Companies",
    "/records":   "My Records",
    "/analytics": "Analytics",
    "/profile":   "Profile",
  };
  return titles[pathname] || pathname.slice(1).replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function TopNav({ onMenuClick }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 lg:px-6">
      {/* ── Left section ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <h1 className="text-lg font-semibold text-gray-800">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* ── Center: Search ─────────────────────────────────────────── */}
      <div className="hidden sm:block flex-1 max-w-md mx-4">
        <SearchBar />
      </div>

      {/* ── Right section ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notification bell (placeholder) */}
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User info — avatar always visible, name hidden on mobile */}
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-xs">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user?.full_name || user?.email || "User"}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
