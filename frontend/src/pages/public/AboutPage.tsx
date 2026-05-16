import { ShieldCheck, Target, Eye, Award, Users, BookOpen, GraduationCap } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Excellence in Training",
    desc: "We maintain the highest standards in our curriculum and instructional delivery.",
  },
  {
    icon: Users,
    title: "Student Centric",
    desc: "Every program is designed to ensure our students achieve their career goals.",
  },
  {
    icon: GraduationCap,
    title: "Industry Aligned",
    desc: "Our courses are constantly updated to meet the demands of the global job market.",
  },
];

export function AboutPage() {
  return (
    <main className="bg-white">
      {/* Page Hero */}
      <section className="relative bg-theme-dark py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-theme-soft/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-theme-soft text-xs font-black uppercase tracking-[0.2em] mb-8">
            <ShieldCheck size={16} />
            Our Identity
          </div>
          <h1 className="text-[clamp(36px,6vw,64px)] font-black text-white leading-[1.05] tracking-tight mb-8">
            Empowering the next <br />
            <span className="text-theme-soft italic">generation of leaders.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium leading-relaxed">
            Youth Career & Skill Development Institute (YCSDI) is a premier academy 
            dedicated to providing high-impact professional training across Bangladesh.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-theme-soft/10 rounded-[40px] blur-2xl group-hover:bg-theme-soft/20 transition-all duration-700 pointer-events-none" />
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden border border-slate-100 shadow-2xl">
                <img 
                  src="/hero-technology1.jpg" 
                  alt="Training environment" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/40 to-transparent" />
              </div>
            </div>

            <div>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-theme-dark text-theme-soft shadow-lg shadow-theme-dark/10">
                    <Target size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-theme-dark mb-4">Our Mission</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      To provide accessible, high-quality skill development programs that empower 
                      individuals to secure meaningful employment and contribute to the 
                      nation's economic growth through digital innovation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-theme-soft text-theme-dark shadow-lg shadow-theme-soft/20">
                    <Eye size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-theme-dark mb-4">Our Vision</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      To be the leading center of excellence for career-focused education in South Asia, 
                      recognized for our commitment to practical learning and industry-leading success rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-primary/10 text-theme-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <BookOpen size={14} className="text-theme-accent" />
              Core Values
            </div>
            <h2 className="text-[clamp(32px,4vw,48px)] font-black text-theme-dark tracking-tight">
              The principles that <span className="text-theme-accent">drive us.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <article 
                key={value.title}
                className="group p-8 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(27,60,83,0.08)] hover:-translate-y-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-theme-dark text-theme-soft mb-6 group-hover:bg-theme-soft group-hover:text-theme-dark transition-colors duration-300">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-theme-dark mb-4">{value.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{value.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Govt. Accreditation */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="p-8 lg:p-12 rounded-[40px] bg-theme-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                 style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10">
              <ShieldCheck className="mx-auto text-theme-soft mb-6" size={48} />
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-4">Government Approved Supervision</h2>
              <p className="text-white/60 mb-8 font-medium max-w-2xl mx-auto">
                YCSDI operates under the approval and supervision of the People's Republic of Bangladesh. 
                Our certifications are recognized nationwide for career advancement.
              </p>
              <div className="inline-block px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-theme-soft font-black uppercase tracking-[0.2em] text-sm">
                Registration No: 158451
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
