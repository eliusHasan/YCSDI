import { Award, BookOpen, Building2, GraduationCap, LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

const navItems = [
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/institutes", label: "Institutes", icon: Building2 },
  { to: "/admin/staff", label: "Staff", icon: UsersRound },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-theme-dark text-white">
      <div className="flex">
        <aside className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen bg-black/30 border-r border-white/5 flex-col p-6">
          <div className="flex items-center gap-3 mb-12">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-theme-soft text-[10px] font-black text-theme-dark shadow-lg">
              YCSDI
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-theme-soft">Admin Console</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">{user?.userId}</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? "bg-theme-soft text-theme-dark shadow-lg shadow-theme-soft/10"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden border-b border-white/5 bg-black/30 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-theme-soft text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> Admin Console
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-all"
            >
              Sign Out
            </button>
          </div>
          <div className="lg:hidden border-b border-white/5 bg-black/20 px-2 py-2 flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive ? "bg-theme-soft text-theme-dark" : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            ))}
          </div>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
