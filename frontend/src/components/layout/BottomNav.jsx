/**
 * BottomNav — mobile-only bottom navigation bar (visible below md breakpoint).
 *
 * Shows 4 primary nav icons: Dashboard, Records, Analytics, Profile.
 * Active route highlighting via useLocation.
 */
import { LayoutDashboard, FileText, BarChart3, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const BOTTOM_NAV_ITEMS = [
  { to: "/",          label: "Home",      icon: LayoutDashboard },
  { to: "/records",   label: "Records",   icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile",   label: "Profile",   icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200/80 dark:border-gray-800 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {BOTTOM_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active
                  ? "text-primary-600"
                  : "text-gray-400 active:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
