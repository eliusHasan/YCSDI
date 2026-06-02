import {
  ArrowRight,
  BarChart,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Tag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicCourseApi, type Course } from "../../services/api";

function formatPrice(n: number) {
  return `${n.toLocaleString("en-BD")} BDT`;
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await publicCourseApi.list();
        if (!cancelled) setCourses(data);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message ?? "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [query, courses]);

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <BookOpen size={14} />
            Professional Catalog
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            Find the program that <br />
            <span className="text-theme-soft italic">defines your future.</span>
          </h1>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft to-theme-accent rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white rounded-[20px] p-2 shadow-2xl">
              <div className="pl-4 pr-3 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for courses (e.g. Web Development...)"
                className="flex-1 bg-transparent border-none outline-none py-3 text-theme-dark font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-20 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="bg-white rounded-[32px] p-20 flex justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Loader2 className="text-theme-accent animate-spin" size={40} />
            </div>
          ) : error ? (
            <div className="bg-white rounded-[32px] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-red-500 font-bold uppercase tracking-widest text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <BookOpen className="text-slate-300 mx-auto mb-4" size={40} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                {courses.length === 0 ? "No courses available yet" : "No courses match your search"}
              </p>
              <p className="text-slate-400 text-xs mt-2">
                {courses.length === 0
                  ? "Check back soon for our upcoming programs"
                  : "Try a different keyword"}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <Link
                  key={course._id}
                  to={`/courses/${course.slug}`}
                  className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(27,60,83,0.12)] hover:-translate-y-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src={course.imageUrl}
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/60 via-transparent to-transparent opacity-60" />
                    {course.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-theme-dark uppercase tracking-wider shadow-sm">
                          {course.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl bg-theme-soft text-theme-dark text-sm font-black shadow-lg">
                        {formatPrice(course.offerPrice ?? course.price)}
                      </span>
                      {course.offerPrice !== undefined && (
                        <span className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-500 line-through shadow-lg">
                          {formatPrice(course.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-8">
                    {(course.duration || course.level) && (
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        {course.duration && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            <Clock size={14} className="text-theme-soft" />
                            {course.duration}
                          </div>
                        )}
                        {course.duration && course.level && <div className="w-1 h-1 rounded-full bg-slate-200" />}
                        {course.level && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            <BarChart size={14} className="text-theme-soft" />
                            {course.level}
                          </div>
                        )}
                      </div>
                    )}

                    <h3 className="text-xl font-black text-theme-dark leading-tight mb-3 group-hover:text-theme-primary transition-colors duration-300">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">{course.description}</p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      {course.category ? (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                          <Tag size={14} className="text-theme-soft" />
                          <span className="uppercase tracking-widest">{course.category}</span>
                        </div>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-2 text-sm font-black text-theme-dark group-hover:text-theme-primary transition-all">
                        View Details
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-24 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-theme-dark tracking-tight mb-8">
                Why study at our <br />
                <span className="text-theme-accent">Skill Academy?</span>
              </h2>
              <div className="grid gap-6">
                {[
                  "Government recognized certifications",
                  "Expert mentors from the industry",
                  "Practical, project-based learning",
                  "Flexible online & offline sessions",
                  "Lifetime career support & guidance",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-soft/20">
                      <CheckCircle2 className="text-theme-accent" size={16} />
                    </div>
                    <span className="font-bold text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-theme-dark rounded-[40px] p-10 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-4">Start your journey today</h3>
                <p className="text-white/60 mb-8 leading-relaxed font-medium">
                  Don't wait for the right opportunity, create it. Register now for our upcoming batch and take the
                  first step towards a professional career.
                </p>
                <Link
                  to="/registration"
                  className="inline-flex h-14 items-center px-8 bg-theme-soft text-theme-dark font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-theme-soft/10"
                >
                  Apply for Admission
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-theme-soft/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
