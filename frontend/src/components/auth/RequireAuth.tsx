import { Navigate, useLocation } from "react-router-dom";
import { roleHome, useAuthStore, type Role } from "../../stores/auth";
import type { ReactNode } from "react";

interface Props {
  roles?: Role[];
  children: ReactNode;
}

export function RequireAuth({ roles, children }: Props) {
  const location = useLocation();
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but on a route meant for a different role → send to their own dashboard.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <>{children}</>;
}

/** Wraps routes that authenticated users shouldn't see (e.g. the login page). */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { token, user } = useAuthStore();
  if (token && user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return <>{children}</>;
}
