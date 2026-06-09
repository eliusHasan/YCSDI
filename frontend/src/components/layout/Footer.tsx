import { Link as RouterLink } from "react-router-dom";
import { Mail, Send, ShieldCheck, ArrowRight, Globe, Share2, MessageSquare, Play } from "lucide-react";

const quickLinks = [
  { label: "Our Programs", href: "/courses" },
  { label: "Verify Results", href: "/result" },
  { label: "Verified Certificates", href: "/verified-institute" },
  { label: "Career Notices", href: "/notices" },
  { label: "About Academy", href: "/about" },
];

const socialLinks = [
  { icon: Globe, href: "#", label: "Facebook" },
  { icon: Share2, href: "#", label: "LinkedIn" },
  { icon: MessageSquare, href: "#", label: "Twitter" },
  { icon: Play, href: "#", label: "YouTube" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-theme-dark text-white pt-20 overflow-hidden relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr] pb-16">
          
          {/* Brand & Mission */}
          <section>
            <RouterLink to="/" className="mb-8 inline-flex items-center gap-4 group">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white p-1.5 transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-black/20">
                <img src="/logo.png" alt="YCSDI logo" className="h-full w-full object-contain" />
              </span>
              <span className="text-xl font-black uppercase leading-[1.1] tracking-tight">
                Youth Career <br />
                <span className="text-theme-soft italic">Academy.</span>
              </span>
            </RouterLink>
            <p className="max-w-xs text-sm leading-relaxed text-white/50 mb-8 font-medium">
              A premier institution dedicated to bridge the gap between education and 
              industry requirements through practical skills and professional training.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-theme-soft text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={16} />
              Govt. Reg No: 158451
            </div>
          </section>

          {/* Navigation */}
          <section>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.2em] text-theme-soft">Academy</h3>
            <ul className="grid gap-4 p-0 text-sm font-semibold">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <RouterLink className="text-white/60 transition-colors hover:text-white flex items-center gap-2 group" to={link.href}>
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-theme-soft" />
                    {link.label}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </section>

          {/* Social Presence (Vertical List) */}
          <section>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.2em] text-theme-soft">Connect</h3>
            <div className="grid gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  className="flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-theme-soft group-hover:text-theme-dark group-hover:border-theme-soft transition-all">
                    <social.icon size={18} />
                  </div>
                  <span className="text-sm font-bold tracking-wide">{social.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.2em] text-theme-soft">Stay Updated</h3>
            <p className="text-sm leading-relaxed text-white/50 mb-6 font-medium">
              Join our mailing list for the latest course updates and career opportunities.
            </p>
            <form className="relative flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all"
                  aria-label="Email address"
                  placeholder="Your Email Address"
                  type="email"
                />
              </div>
              <button
                className="group flex items-center justify-center gap-3 w-full bg-theme-soft hover:bg-white text-theme-dark font-black h-14 rounded-2xl transition-all duration-300 shadow-lg shadow-theme-soft/10"
                type="submit"
              >
                Join Academy
                <Send size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest text-center md:text-left">
            &copy; {currentYear} Youth Career & Skill Development Institute. <br className="sm:hidden" />
            <span className="text-white/10 ml-2 hidden sm:inline">|</span>
            <span className="sm:ml-2">All Rights Reserved.</span>
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
            <RouterLink to="#" className="hover:text-theme-soft transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="#" className="hover:text-theme-soft transition-colors">Terms of Service</RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
