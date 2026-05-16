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
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        src="/hero-technology.jpg"
        alt="Digital skill development and technology training"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,60,83,0.96)_0%,rgba(27,60,83,0.86)_42%,rgba(35,76,106,0.58)_72%,rgba(27,60,83,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-theme-dark to-transparent" />

      <div className="relative mx-auto grid min-h-[430px] max-w-7xl items-center gap-5 px-4 py-8 sm:min-h-[480px] sm:px-6 sm:py-10 lg:h-[calc(100svh-165px)] lg:min-h-[420px] lg:max-h-[540px] lg:grid-cols-[1.08fr_0.92fr] lg:py-5">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-theme-soft backdrop-blur-md">
            <ShieldCheck size={17} />
            Govt. Reg No: 158451
          </div>

          <h1 className="max-w-3xl text-[clamp(32px,4.5vw,56px)] font-black leading-[1] tracking-normal">
            Build skills that move your career forward.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base lg:text-[17px]">
            Professional course management, student enrollment, verified results,
            and certificate services for practical career development in Bangladesh.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-theme-soft px-5 text-sm font-black text-theme-dark shadow-[0_18px_40px_rgba(210,193,182,0.28)] transition hover:bg-white"
              to="/courses"
            >
              Browse Courses
              <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-theme-dark"
              to="/registration"
            >
              Registration
            </Link>
          </div>

          <div className="mt-5 grid gap-2 text-xs font-semibold text-white/90 sm:grid-cols-3">
            {highlights.map((item) => (
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1.5 backdrop-blur-sm" key={item}>
                <CheckCircle2 className="shrink-0 text-theme-soft" size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="ml-auto max-w-sm rounded-2xl border border-white/18 bg-white/12 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl xl:max-w-md">
            <div className="flex items-center gap-3 border-b border-white/15 pb-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-theme-soft text-theme-dark">
                <GraduationCap size={22} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-theme-soft">Institute Platform</p>
                <h2 className="text-lg font-black xl:text-xl">Career-ready learning</h2>
              </div>
            </div>

            <div className="grid gap-2 py-3">
              {metrics.map((metric) => (
                <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2" key={metric.label}>
                  <span className="text-xs font-semibold text-white/75 xl:text-sm">{metric.label}</span>
                  <span className="text-lg font-black text-theme-soft">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-theme-dark/70 p-3.5 ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2 text-theme-soft">
                <Award size={18} />
                <span className="text-sm font-black">Certificate & result support</span>
              </div>
              <p className="text-xs leading-5 text-white/75 xl:text-sm">
                Built for course admission, progress tracking, result lookup, and
                certificate verification workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
