import { Bell, Calendar, ArrowRight, Download, Megaphone, FileText, Bookmark } from "lucide-react";

const notices = [
  {
    title: "Admission Open for Summer 2024 Batch",
    date: "May 15, 2024",
    category: "Admission",
    desc: "We are pleased to announce that admissions for our upcoming Summer 2024 batch are now officially open. Early bird discounts available.",
    isUrgent: true,
  },
  {
    title: "Final Examination Schedule - Spring 2024",
    date: "May 10, 2024",
    category: "Exam",
    desc: "The final examination schedule for the Spring 2024 session has been published. Students are requested to collect their admit cards.",
    isUrgent: false,
  },
  {
    title: "Eid-ul-Adha Holiday Announcement",
    date: "May 05, 2024",
    category: "Holiday",
    desc: "The institute will remain closed from June 15th to June 22nd on the occasion of Eid-ul-Adha. Regular classes will resume from June 23rd.",
    isUrgent: false,
  },
  {
    title: "New Graphic Design Curriculum Update",
    date: "April 28, 2024",
    category: "Academic",
    desc: "We have updated our Graphic Design curriculum to include advanced AI-driven design tools and modern UX/UI principles.",
    isUrgent: false,
  },
];

export function NoticesPage() {
  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <Bell size={14} className="animate-bounce" />
            Announcement Hub
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            Stay informed with our <br />
            <span className="text-theme-soft italic">latest updates.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
            Important announcements, exam schedules, academic calendars, 
            and official notices from Youth Career & Skills Development Training.
          </p>
        </div>
      </section>

      {/* Notices Feed */}
      <section className="-mt-24 relative z-10 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="space-y-6">
            {notices.map((notice, index) => (
              <article 
                key={index}
                className="group relative bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(27,60,83,0.08)] hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        notice.isUrgent 
                          ? "bg-red-50 text-red-600 border border-red-100" 
                          : "bg-theme-primary/5 text-theme-primary border border-theme-primary/10"
                      }`}>
                        {notice.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <Calendar size={14} />
                        {notice.date}
                      </div>
                    </div>

                    <h2 className="text-xl lg:text-2xl font-black text-theme-dark mb-4 group-hover:text-theme-primary transition-colors">
                      {notice.title}
                    </h2>
                    
                    <p className="text-slate-500 font-medium leading-relaxed mb-6">
                      {notice.desc}
                    </p>

                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-sm font-black text-theme-dark hover:text-theme-accent transition-all">
                        <FileText size={18} />
                        View Full Details
                      </button>
                      <button className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-theme-dark transition-all">
                        <Download size={18} />
                        Download PDF
                      </button>
                    </div>
                  </div>

                  {notice.isUrgent && (
                    <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                      <Megaphone size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Urgent</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* More notices pagination/load */}
          <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-3 px-10 py-5 bg-theme-dark text-theme-soft font-black rounded-2xl hover:bg-theme-accent hover:text-white transition-all shadow-xl shadow-theme-dark/10">
              Load Previous Notices
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Callout */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative p-10 lg:p-16 rounded-[40px] bg-theme-dark text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-soft/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <Bookmark className="mx-auto text-theme-soft mb-6" size={40} />
              <h2 className="text-2xl lg:text-4xl font-black text-white mb-6">Never miss an update.</h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto font-medium">
                Subscribe to our digital notice board to receive instant 
                notifications about admissions, exams, and holidays.
              </p>
              <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-theme-soft/50 transition-all"
                />
                <button className="px-8 py-4 bg-theme-soft text-theme-dark font-black rounded-2xl hover:bg-white transition-all">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
