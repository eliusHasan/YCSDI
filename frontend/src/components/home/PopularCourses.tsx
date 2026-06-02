import { ArrowRight, BarChart, Clock, Loader2, Sparkles, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicCourseApi, type Course } from "../../services/api";

function formatPrice(n: number) {
  return `${n.toLocaleString("en-BD")} BDT`;
}

export function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await publicCourseApi.list();
        if (!cancelled) setCourses(data.slice(0, 4));
      } catch {
        // Silent fallback — popular section just hides on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && courses.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-[#F9FBFC] py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-theme-soft/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-theme-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-soft/20 text-theme-primary text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles size={14} className="text-theme-accent" />
              Featured Programs
            </div>
            <h2 className="text-[clamp(32px,5vw,52px)] font-black leading-[1.1] text-theme-dark tracking-tight">
              Build high-demand skills with <br className="hidden md:block" />
              <span className="text-theme-accent">professional training.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Our curriculum is designed by industry experts to ensure you gain the practical experience needed to
              excel in today's competitive job market.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="text-theme-accent animate-spin" size={36} />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, index) => (
              <Link
                key={course._id}
                to={`/courses/${course.slug}`}
                className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(27,60,83,0.12)] hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={course.imageUrl}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  {course.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-theme-dark uppercase tracking-wider shadow-sm">
                        {course.category}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 text-white/40 text-sm font-black italic">
                    0{index + 1}
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-7">
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

                  <h3 className="text-xl font-black text-theme-dark leading-tight mb-4 group-hover:text-theme-primary transition-colors duration-300">
                    {course.title}
                  </h3>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Tag size={14} className="text-theme-soft" />
                      <span>{formatPrice(course.offerPrice ?? course.price)}</span>
                    </div>

                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-theme-dark group-hover:bg-theme-soft group-hover:text-theme-dark transition-all duration-300">
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <Link
            to="/courses"
            className="group inline-flex items-center gap-4 text-lg font-black text-theme-dark hover:text-theme-primary transition-all duration-300"
          >
            <span>Explore All Courses</span>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-theme-dark/10 group-hover:border-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-all duration-300">
              <ArrowRight size={22} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
