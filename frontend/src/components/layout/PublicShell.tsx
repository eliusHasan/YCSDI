import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { Footer } from "./Footer";
import Header from "./Header";

export function PublicShell() {
  const { token, user } = useAuthStore();

  // Staff are confined to their portal — they have no business on the public site.
  if (token && user?.role === "staff") {
    return <Navigate to="/staff" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
