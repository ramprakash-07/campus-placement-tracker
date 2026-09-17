/**
 * GuestSidebar — minimal navigation for guest mode.
 * Dashboard, Records, Companies, Analytics + Register CTA at bottom.
 */
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  UserPlus,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/guest/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/guest/records",    label: "Records",     icon: FileText },
  { to: "/guest/companies",  label: "Companies",   icon: Building2 },
  { to: "/guest/analytics",  label: "Analytics",   icon: BarChart3 },
];

function NavItem({ to, label, icon: Icon, collapsed, isActive, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        group relative flex items-center gap-3 rounded-lg text-sm font-medium
        transition-all duration-200
        ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}
        ${
          isActive
            ? "bg-primary-600/20 text-primary-400 shadow-sm"
            : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-500" />
      )}
      <Icon size={20} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function GuestSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePath = (to) => location.pathname === to;

  const handleExit = () => {
    localStorage.removeItem("isGuest");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
          border-r border-gray-800/60 shadow-xl
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          hidden md:static md:flex md:translate-x-0
          ${mobileOpen ? "!flex translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/25 flex-shrink-0">
            <span className="text-white font-extrabold text-sm tracking-tight">
              👀
            </span>
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-white leading-tight whitespace-nowrap overflow-hidden">
              Guest Mode
              <br />
              <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">
                Read Only
              </span>
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              collapsed={collapsed}
              isActive={isActivePath(to)}
              onClick={onMobileClose}
            />
          ))}
        </nav>

        {/* Bottom CTA section */}
        <div className="px-3 py-3 space-y-2 border-t border-gray-800/60">
          {/* Register CTA */}
          <NavLink
            to="/register"
            className={`flex items-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200
              bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/25
              ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}
            `}
            title={collapsed ? "Register" : undefined}
          >
            <UserPlus size={18} className="flex-shrink-0" />
            {!collapsed && <span>Register Now</span>}
          </NavLink>

          {/* Back to Login */}
          <button
            onClick={handleExit}
            className={`flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200
              text-gray-400 hover:bg-gray-800/60 hover:text-gray-100 w-full cursor-pointer
              ${collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"}
            `}
            title={collapsed ? "Sign In" : undefined}
          >
            <LogIn size={18} className="flex-shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={onToggle}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
