// components/layout/Header.tsx

import { Menu, Mail, Phone, X, ShieldCheck, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore, type Role } from "../../stores/auth";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Result", href: "/result" },
  { label: "All Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Notices", href: "/notices" },
];

const dashboardByRole: Record<Role, { to: string; label: string }> = {
  admin: { to: "/admin", label: "Admin Panel" },
  staff: { to: "/staff", label: "Staff Panel" },
  student: { to: "/student", label: "My Dashboard" },
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const dashboard = user ? dashboardByRole[user.role] : null;

  return (
    <header className="w-full relative z-[100]">
      {/* Premium Top Bar */}
      <div className="bg-theme-dark text-white py-2.5 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-theme-soft">
              <ShieldCheck size={14} />
              Govt. Registered Academy
            </div>
            <span className="hidden sm:block text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Reg: 158451</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[11px] font-black uppercase tracking-widest text-white/60">
            <a className="flex items-center gap-2 transition-colors hover:text-theme-soft" href="mailto:info.ydibd@gmail.com">
              <Mail className="text-theme-soft" size={14} />
              info.ydibd@gmail.com
            </a>
            <a className="flex items-center gap-2 transition-colors hover:text-theme-soft" href="tel:+8809638349757">
              <Phone className="text-theme-soft" size={14} />
              +880 9638 349757
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Navbar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-5">
          <div className="flex items-center justify-between gap-8">
            {/* Elite Logo */}
            <Link to="/" className="flex items-center gap-4 group">
              <img
                src="/logo.png"
                alt="YCSDI logo"
                className="h-12 w-12 shrink-0 object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-base font-black uppercase leading-none tracking-tight text-theme-dark">Youth Career <span className="text-theme-accent">&</span> Skills</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-accent">Development Training</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    `relative text-[13px] font-black uppercase tracking-widest transition-all duration-300 pb-1 ${
                      isActive
                        ? "text-theme-dark"
                        : "text-slate-400 hover:text-theme-dark"
                    } group`
                  }
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-theme-soft transition-all duration-300 group-hover:w-full" />
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Premium Buttons */}
              <div className="hidden md:flex items-center gap-3">
                {dashboard ? (
                  <Link
                    to={dashboard.to}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-theme-dark hover:text-white hover:shadow-lg hover:shadow-theme-soft/20"
                  >
                    <LayoutDashboard size={14} />
                    {dashboard.label}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/registration"
                      className="px-6 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-theme-dark hover:text-white hover:shadow-lg hover:shadow-theme-soft/20"
                    >
                      Register Now
                    </Link>
                    <Link
                      to="/login"
                      className="px-6 py-3 rounded-xl border-2 border-slate-100 text-theme-dark text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:border-theme-dark hover:bg-theme-dark hover:text-white"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Toggle */}
              <button
                type="button"
                className="lg:hidden grid h-11 w-11 place-items-center rounded-xl border border-slate-100 text-theme-dark hover:bg-slate-50 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Overlay Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <nav className="grid gap-3 mb-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/"}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                        isActive
                          ? "bg-theme-dark text-theme-soft"
                          : "text-slate-500 hover:bg-slate-50 hover:text-theme-dark"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {dashboard ? (
                <Link
                  to={dashboard.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest shadow-lg shadow-theme-soft/10"
                >
                  <LayoutDashboard size={16} />
                  {dashboard.label}
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/registration"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center h-14 rounded-2xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest shadow-lg shadow-theme-soft/10"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center h-14 rounded-2xl border-2 border-slate-100 text-theme-dark text-[11px] font-black uppercase tracking-widest"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
