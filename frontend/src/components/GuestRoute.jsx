/**
 * GuestRoute — route guard for guest mode.
 * Checks localStorage for isGuest === "true".
 * If present, renders child routes; otherwise redirects to /login.
 */
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const isGuest = localStorage.getItem("isGuest") === "true";

  if (!isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
