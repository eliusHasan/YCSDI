import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, type Role } from "../../stores/auth";
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

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
