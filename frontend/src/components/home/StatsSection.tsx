const stats = [
  { label: "Students Target", value: "100K+" },
  { label: "Course Categories", value: "25+" },
  { label: "Branch Support", value: "Multi" },
  { label: "Certificate System", value: "QR" },
];

export function StatsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 sm:px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="rounded-lg border border-theme-soft/70 bg-white p-5 shadow-[0_14px_36px_rgba(27,60,83,0.08)]"
            key={stat.label}
          >
            <p className="text-3xl font-black text-theme-dark">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold text-theme-primary">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
