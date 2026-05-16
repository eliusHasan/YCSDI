import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Result", href: "/result" },
  { label: "All Courses", href: "/courses" },
  { label: "Verified Courses", href: "/verified-institute" },
  { label: "About Us", href: "/about" },
];

const socialLinks = ["Facebook", "LinkedIn", "Twitter", "YouTube", "About Us"];

export function Footer() {
  return (
    <footer className="bg-theme-dark text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-14">
        <section>
          <Link to="/" className="mb-5 inline-flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-theme-soft text-xs font-black text-theme-dark ring-2 ring-white/20">
              YCSDI
            </span>
            <span className="text-base font-black uppercase leading-tight text-white">
              <span className="block">Youth Career &</span>
              <span className="block">Skill Development</span>
              <span className="block text-theme-soft">Institute</span>
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-white/75">
            Under the approval supervision of the people's republic of bangladesh
          </p>
          <strong className="mt-5 inline-block text-sm font-bold text-theme-soft">Govt. Reg No: 158451</strong>
        </section>

        <section>
          <h3 className="mb-5 text-lg font-bold text-theme-soft">Quick Link</h3>
          <ul className="grid gap-3 p-0 text-sm text-white/75">
            {quickLinks.map((link) => (
              <li className="list-none" key={link.href}>
                <Link className="transition hover:text-theme-soft" to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-5 text-lg font-bold text-theme-soft">Social Link</h3>
          <ul className="grid gap-3 p-0 text-sm text-white/75">
            {socialLinks.map((link) => (
              <li className="list-none" key={link}>
                <a className="transition hover:text-theme-soft" href="#social">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-5 text-lg font-bold text-theme-soft">Newsletter</h3>
          <p className="max-w-sm text-sm leading-7 text-white/75">
            Subscribe to our newsletter to receive latest news on our services.
          </p>
          <form className="mt-5 flex w-full max-w-sm overflow-hidden rounded-lg bg-white">
            <input
              className="min-h-12 min-w-0 flex-1 border-0 px-4 text-sm text-theme-dark outline-none"
              aria-label="Email address"
              placeholder="Enter Your Email"
              type="email"
            />
            <button
              className="bg-theme-accent px-4 text-sm font-bold text-white transition hover:bg-theme-primary"
              type="submit"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 max-w-sm text-xs leading-6 text-white/60">
            We don't do mail to spam & your mail id is confidential.
          </p>
        </section>
      </div>
      <div className="grid min-h-14 place-items-center bg-theme-primary px-4 text-center text-sm text-white">
        Copyright (c) 2023 Youth Career & Skill Development Institute
      </div>
    </footer>
  );
}
