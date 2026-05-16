import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    title: "Computer Office Application",
    duration: "3 Months",
    level: "Beginner",
  },
  {
    title: "Graphic Design",
    duration: "4 Months",
    level: "Beginner to Intermediate",
  },
  {
    title: "Web Development",
    duration: "6 Months",
    level: "Professional",
  },
  {
    title: "Digital Marketing",
    duration: "3 Months",
    level: "Career focused",
  },
];

export function PopularCourses() {
  return (
    <section className="bg-[#f8f6f4]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-theme-accent">Popular Courses</p>
            <h2 className="text-[clamp(32px,4vw,52px)] font-black leading-tight text-theme-dark">
              Start with job-ready training.
            </h2>
          </div>
          <Link className="inline-flex items-center gap-2 font-bold text-theme-primary hover:text-theme-dark" to="/courses">
            View all courses
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <article
              className="rounded-lg border border-theme-soft bg-white p-6 shadow-[0_14px_36px_rgba(27,60,83,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(27,60,83,0.14)]"
              key={course.title}
            >
              <p className="mb-4 inline-flex rounded-full bg-theme-soft/70 px-3 py-1 text-xs font-bold text-theme-dark">
                {course.level}
              </p>
              <h3 className="text-xl font-black leading-tight text-theme-dark">{course.title}</h3>
              <p className="mt-4 text-sm font-semibold text-theme-primary">Duration: {course.duration}</p>
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-theme-accent" to="/registration">
                Enroll now
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
