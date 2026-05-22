/**
 * Sidebar — persistent navigation panel.
 *
 * Features:
 *  • Logo ("CPT") with branding gradient
 *  • Nav links with lucide-react icons for Dashboard, Companies,
 *    My Records, Analytics, Profile
 *  • Coordinator-only section with "Coordinator Dashboard" and "Students"
 *  • Active route highlighting via react-router-dom useLocation
 *  • Collapses to icon-only on mobile; toggle button expands it
 *  • Smooth slide-in/out animation with backdrop overlay on mobile
 */
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  User,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",   icon: LayoutDashboard },
  { to: "/companies", label: "Companies",   icon: Building2 },
  { to: "/records",   label: "My Records",  icon: FileText },
  { to: "/analytics", label: "Analytics",   icon: BarChart3 },
  { to: "/profile",   label: "Profile",     icon: User },
];

const COORDINATOR_NAV_ITEMS = [
  { to: "/coordinator/dashboard", label: "Coordinator Dashboard", icon: LayoutDashboard },
  { to: "/coordinator/students",  label: "Students",              icon: Users },
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
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-500" />
      )}
      <Icon size={20} className="flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const { role } = useAuth();

  const isActivePath = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
          border-r border-gray-800/60 shadow-xl
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ── Logo / Brand ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25 flex-shrink-0">
            <span className="text-white font-extrabold text-sm tracking-tight">
              CPT
            </span>
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-white leading-tight whitespace-nowrap overflow-hidden">
              Campus Placement
              <br />
              <span className="text-primary-400 text-xs font-semibold tracking-widest uppercase">
                Tracker
              </span>
            </span>
          )}
        </div>

        {/* ── Navigation Links ──────────────────────────────────────── */}
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

          {/* ── Coordinator Section ──────────────────────────────────── */}
          {role === "coordinator" && (
            <>
              {/* Separator */}
              <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 px-1">
                  <hr className="flex-1 border-gray-700/60" />
                  {!collapsed && (
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      Coordinator
                    </span>
                  )}
                  <hr className="flex-1 border-gray-700/60" />
                </div>
              </div>

              {COORDINATOR_NAV_ITEMS.map(({ to, label, icon }) => (
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
            </>
          )}
        </nav>

        {/* ── Collapse toggle (desktop only) ────────────────────────── */}
        <div className="hidden lg:block px-3 py-3 border-t border-gray-800/60">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
