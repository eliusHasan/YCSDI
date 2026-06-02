import {
  ArrowLeft,
  ArrowRight,
  BarChart,
  BookOpen,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { publicCourseApi, type Course } from "../../services/api";

function formatPrice(n: number) {
  return `${n.toLocaleString("en-BD")} BDT`;
}

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const { data } = await publicCourseApi.getBySlug(slug);
        if (!cancelled) setCourse(data);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message ?? "Course not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="bg-[#F9FBFC] min-h-screen flex items-center justify-center">
        <Loader2 className="text-theme-accent animate-spin" size={40} />
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="bg-[#F9FBFC] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="text-slate-300 mx-auto mb-4" size={44} />
          <p className="text-slate-600 font-black uppercase tracking-widest text-sm mb-6">
            {error ?? "Course not found"}
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-theme-dark text-theme-soft font-black uppercase tracking-widest text-xs hover:bg-theme-accent hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const hasDiscount = course.offerPrice !== undefined;

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Hero */}
      <section className="relative bg-theme-dark pt-24 pb-40 lg:pt-28 lg:pb-48 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-theme-soft font-black text-[10px] uppercase tracking-[0.3em] mb-8 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            All Courses
          </Link>

          {course.category && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
              <Tag size={12} />
              {course.category}
            </div>
          )}
          <h1 className="text-[clamp(32px,5vw,52px)] font-black text-white leading-[1.1] max-w-3xl">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-[11px] font-bold text-white/60 uppercase tracking-widest">
            {course.duration && (
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-theme-soft" />
                {course.duration}
              </span>
            )}
            {course.level && (
              <span className="flex items-center gap-2">
                <BarChart size={14} className="text-theme-soft" />
                {course.level}
              </span>
            )}
            {course.subjects && course.subjects.length > 0 && (
              <span className="flex items-center gap-2">
                <ListChecks size={14} className="text-theme-soft" />
                {course.subjects.length} subject{course.subjects.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="-mt-28 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.6fr_0.8fr] gap-8 items-start">
            {/* Left column */}
            <div className="space-y-8">
              <div className="rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_20px_50px_rgba(27,60,83,0.10)] bg-white">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-2xl font-black text-theme-dark tracking-tight mb-6 flex items-center gap-3">
                  <BookOpen className="text-theme-accent" size={24} />
                  About this course
                </h2>
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              {course.subjects && course.subjects.length > 0 && (
                <div className="bg-white rounded-[32px] p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h2 className="text-2xl font-black text-theme-dark tracking-tight mb-6 flex items-center gap-3">
                    <ListChecks className="text-theme-accent" size={24} />
                    What you'll study
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.subjects.map((subject, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-theme-soft/20 text-theme-accent text-xs font-black">
                          {i + 1}
                        </span>
                        <span className="font-bold text-theme-dark text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — sticky enroll card */}
            <div className="lg:sticky lg:top-8 space-y-6">
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(27,60,83,0.08)]">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-black text-theme-dark">
                    {formatPrice(course.offerPrice ?? course.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm font-bold text-slate-400 line-through mb-1">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  One-time course fee
                </p>

                <Link
                  to="/registration"
                  className="group flex items-center justify-center gap-3 w-full bg-theme-dark hover:bg-theme-accent text-theme-soft hover:text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl text-xs uppercase tracking-widest"
                >
                  Apply for Admission
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="mt-8 space-y-4">
                  {[
                    "Government recognized certificate",
                    "Expert mentors from the industry",
                    "Practical, project-based learning",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="text-theme-accent shrink-0 mt-0.5" size={16} />
                      <span className="text-sm font-bold text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
