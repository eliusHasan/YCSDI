import { Search, Clock, BarChart, Users, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const allCourses = [
  {
    title: "Computer Office Application",
    duration: "3 Months",
    level: "Beginner",
    students: "1.2k+",
    price: "4,500 BDT",
    category: "Office Productivity",
    image: "/hero-technology1.jpg",
  },
  {
    title: "Graphic Design",
    duration: "4 Months",
    level: "Intermediate",
    students: "850+",
    price: "6,000 BDT",
    category: "Creative Arts",
    image: "/hero-technology2.jpg",
  },
  {
    title: "Web Development",
    duration: "6 Months",
    level: "Professional",
    students: "2.1k+",
    price: "12,000 BDT",
    category: "Software Engineering",
    image: "/hero-technology1.jpg",
  },
  {
    title: "Digital Marketing",
    duration: "3 Months",
    level: "Career Focused",
    students: "1.5k+",
    price: "5,500 BDT",
    category: "Marketing",
    image: "/hero-technology2.jpg",
  },
  {
    title: "Database Management",
    duration: "4 Months",
    level: "Intermediate",
    students: "450+",
    price: "8,000 BDT",
    category: "IT Support",
    image: "/hero-technology1.jpg",
  },
  {
    title: "Network Administration",
    duration: "5 Months",
    level: "Professional",
    students: "320+",
    price: "10,000 BDT",
    category: "IT Support",
    image: "/hero-technology2.jpg",
  },
];

export function CoursesPage() {
  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <BookOpen size={14} />
            Professional Catalog
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            Find the program that <br />
            <span className="text-theme-soft italic">defines your future.</span>
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft to-theme-accent rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white rounded-[20px] p-2 shadow-2xl">
              <div className="pl-4 pr-3 text-slate-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search for courses (e.g. Web Development...)"
                className="flex-1 bg-transparent border-none outline-none py-3 text-theme-dark font-medium placeholder:text-slate-400"
              />
              <button className="hidden sm:block px-8 py-3 bg-theme-dark text-theme-soft font-black rounded-xl hover:bg-theme-accent hover:text-white transition-all">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="-mt-20 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allCourses.map((course) => (
              <article
                key={course.title}
                className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(27,60,83,0.12)] hover:-translate-y-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={course.image}
                    alt={course.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-theme-dark uppercase tracking-wider shadow-sm">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 rounded-xl bg-theme-soft text-theme-dark text-sm font-black shadow-lg">
                      {course.price}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      <Clock size={14} className="text-theme-soft" />
                      {course.duration}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      <BarChart size={14} className="text-theme-soft" />
                      {course.level}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-theme-dark leading-tight mb-6 group-hover:text-theme-primary transition-colors duration-300">
                    {course.title}
                  </h3>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">
                        {course.students} Students
                      </span>
                    </div>

                    <Link
                      to="/registration"
                      className="flex items-center gap-2 text-sm font-black text-theme-dark hover:text-theme-primary transition-all"
                    >
                      Enroll Now
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why study with us summary */}
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
                  "Lifetime career support & guidance"
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
                   Don't wait for the right opportunity, create it. Register now for our 
                   upcoming batch and take the first step towards a professional career.
                 </p>
                 <Link to="/registration" className="inline-flex h-14 items-center px-8 bg-theme-soft text-theme-dark font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-theme-soft/10">
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
