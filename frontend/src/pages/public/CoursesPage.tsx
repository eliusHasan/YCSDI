const courses = ["Computer Office Application", "Graphic Design", "Web Development", "Digital Marketing"];

export function CoursesPage() {
  return (
    <section className="mx-auto min-h-[420px] w-[min(1280px,calc(100%-48px))] py-[70px]">
      <p className="mb-2.5 text-lg font-extrabold uppercase text-theme-accent">All Courses</p>
      <h1 className="mb-5 text-[clamp(38px,5vw,68px)] leading-[1.08]">Available Courses</h1>
      <div className="mt-9 grid grid-cols-4 gap-5 max-[1200px]:grid-cols-2 max-[860px]:grid-cols-1">
        {courses.map((course) => (
          <article className="rounded-lg border border-theme-soft/70 bg-white p-6 shadow-[0_14px_36px_rgba(27,60,83,0.08)]" key={course}>
            <h2 className="mb-2.5 text-2xl font-bold">{course}</h2>
            <p className="text-[17px] leading-[1.7] text-theme-primary">Course details, duration, fee, and admission information will appear here.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
