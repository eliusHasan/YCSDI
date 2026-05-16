import { ArrowRight, Award, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = ["Government registered", "Online & offline training", "Certificate verification"];

const metrics = [
  { label: "Career Courses", value: "25+" },
  { label: "Learning Modes", value: "2" },
  { label: "Student Services", value: "24/7" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-theme-dark text-white">
      <img
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40"
        src="/hero-technology1.jpg"
        alt="Digital skill development and technology training"
      />
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(10,77,74,0.85)_0%,rgba(6,44,42,0.98)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(6,44,42,0.4)_0%,transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-theme-dark to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:min-h-[calc(100vh-140px)] lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-theme-soft/30 bg-theme-soft/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-theme-soft backdrop-blur-xl">
            <ShieldCheck size={18} className="text-theme-soft" />
            Empowering Future Leaders
          </div>

          <h1 className="max-w-3xl text-[clamp(36px,5vw,64px)] font-black leading-[1.05] tracking-tight text-white">
            Master the skills that <br className="hidden lg:block" />
            <span className="text-theme-soft italic">define the future.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Unlock your potential with professional-grade training in design, 
            development, and digital strategy. Join thousands of successful graduates.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-theme-soft px-8 text-base font-black text-theme-dark shadow-[0_20px_50px_rgba(226,178,106,0.3)] transition-all duration-300 hover:bg-white hover:-translate-y-1"
              to="/courses"
            >
              Explore Programs
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              className="inline-flex h-14 items-center rounded-2xl border border-white/20 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/40"
              to="/registration"
            >
              Get Started
            </Link>
          </div>

          <div className="mt-12 grid gap-4 text-sm font-semibold text-white/70 sm:grid-cols-3">
            {highlights.map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-soft/20">
                  <CheckCircle2 className="text-theme-soft" size={14} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block relative">
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-theme-soft/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-theme-primary/30 rounded-full blur-3xl" />

          <div className="relative ml-auto max-w-sm rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl xl:max-w-md ring-1 ring-white/10">
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-theme-soft text-theme-dark shadow-lg shadow-theme-soft/20">
                <GraduationCap size={28} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-theme-soft">Premium Academy</p>
                <h2 className="text-xl font-black xl:text-2xl">Elite Training Hub</h2>
              </div>
            </div>

            <div className="grid gap-4 py-8">
              {metrics.map((metric) => (
                <div className="group flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4 transition-colors hover:bg-white/10" key={metric.label}>
                  <span className="text-sm font-bold text-white/60 uppercase tracking-wider">{metric.label}</span>
                  <span className="text-2xl font-black text-theme-soft">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] bg-theme-primary/40 p-6 ring-1 ring-white/10 border border-white/5">
              <div className="mb-3 flex items-center gap-3 text-theme-soft">
                <Award size={22} />
                <span className="text-base font-black">Global Recognition</span>
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                Our certifications are recognized by leading tech firms and 
                government bodies, paving your way to a global career.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
