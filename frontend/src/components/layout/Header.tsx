// components/layout/Header.tsx

import { Menu, Mail, Phone, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Result", href: "/result" },
  { label: "All Courses", href: "/courses" },
  // { label: "Verified Institute", href: "/verified-institute" },
  { label: "About Us", href: "/about" },
  { label: "Notices", href: "/notices" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-theme-dark text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:text-base">
          <p className="shrink-0 font-semibold">
            Govt. Reg No: <span className="font-bold">158451</span>
          </p>

          <div className="flex flex-col gap-2 font-medium sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 lg:gap-x-8">
            <a className="flex min-w-0 items-center gap-2" href="mailto:info.ydibd@gmail.com">
              <Mail className="shrink-0" size={18} />
              <span className="break-all sm:break-normal">E-mail: info.ydibd@gmail.com</span>
            </a>

            <a className="flex min-w-0 items-center gap-2" href="tel:+8809638349757">
              <Phone className="shrink-0" size={18} />
              <span>Call Us: +8809638349757, +8809696063511</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:py-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[auto_1fr_auto] lg:gap-5">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-theme-dark text-[11px] font-black text-white ring-2 ring-theme-soft sm:h-12 sm:w-12 sm:text-xs lg:h-14 lg:w-14 lg:text-sm xl:h-16 xl:w-16">
                YCSDI
              </span>

              <div className="min-w-0 text-sm font-bold uppercase leading-[1.05] sm:text-base lg:text-lg xl:text-xl">
                <h1 className="text-theme-dark">Youth Career &</h1>
                <h1 className="text-theme-primary">Skill Development</h1>
                <h1 className="text-theme-accent">Institute</h1>
              </div>
            </Link>

            {/* Desktop Nav Menu */}
            <nav className="hidden min-w-0 items-center justify-center gap-4 whitespace-nowrap text-sm font-medium lg:flex xl:gap-6 xl:text-base 2xl:gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    `border-b-2 pb-1 transition ${
                      isActive
                        ? "border-theme-soft text-theme-dark"
                        : "border-transparent hover:border-theme-soft hover:text-theme-primary"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {/* Desktop Buttons */}
              <div className="hidden items-center gap-3 md:flex lg:gap-3">
                <Link
                  to="/registration"
                  className="rounded-full bg-theme-soft px-4 py-2 text-sm font-medium text-theme-dark transition hover:bg-theme-accent hover:text-white xl:px-6 xl:py-2.5"
                >
                  Registration
                </Link>

                <Link
                  to="/login"
                  className="rounded-full border-2 border-theme-accent px-4 py-2 text-sm font-semibold text-theme-dark transition hover:bg-theme-accent hover:text-white xl:px-6 xl:py-2.5"
                >
                  Login
                </Link>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-theme-soft text-theme-dark lg:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mt-4 rounded-lg border border-theme-soft bg-white p-4 shadow-lg lg:hidden">
              <nav className="grid gap-2 text-sm font-medium sm:text-base">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/"}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 transition ${
                        isActive
                          ? "bg-theme-soft text-theme-dark"
                          : "text-theme-dark hover:bg-theme-soft/40 hover:text-theme-primary"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  to="/registration"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-theme-soft px-4 py-2.5 text-center text-sm font-medium text-theme-dark transition hover:bg-theme-accent hover:text-white"
                >
                  Registration
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border-2 border-theme-accent px-4 py-2.5 text-center text-sm font-semibold text-theme-dark transition hover:bg-theme-accent hover:text-white"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
