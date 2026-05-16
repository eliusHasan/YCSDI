import { Search, ShieldCheck, FileText, Award, CheckCircle2, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export function ResultPage() {
  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Academic Portal
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            Check your results & <br />
            <span className="text-theme-soft italic">verify certifications.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
            Access your official academic performance records and verify the 
            authenticity of your professional certificates.
          </p>
        </div>
      </section>

      {/* Lookup Section */}
      <section className="-mt-24 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">

            {/* Result Search Card */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-theme-soft/10 rounded-[48px] blur-3xl opacity-50 pointer-events-none" />
              <div className="relative bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_40px_80px_rgba(27,60,83,0.08)] border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-dark text-theme-soft">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-theme-dark">Student Result Lookup</h2>
                    <p className="text-slate-500 font-medium text-sm">Enter your credentials to view your marksheets.</p>
                  </div>
                </div>

                <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Roll Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 10XXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registration Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2024-XXXX-XXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Examination Year</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold focus:outline-none focus:border-theme-soft focus:bg-white transition-all appearance-none cursor-pointer">
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                      </select>
                    </div>
                  </div>

                  <button className="group relative flex items-center justify-center gap-3 w-full bg-theme-dark hover:bg-theme-accent text-theme-soft hover:text-white font-black py-6 rounded-2xl transition-all duration-300 shadow-xl">
                    Search Result
                    <Search size={20} className="transition-transform group-hover:scale-110" />
                  </button>
                </form>

                <div className="mt-10 flex items-start gap-4 p-6 rounded-2xl bg-theme-soft/10 border border-theme-soft/20">
                  <CheckCircle2 className="text-theme-accent shrink-0" size={20} />
                  <p className="text-sm text-theme-dark font-medium leading-relaxed">
                    Results are typically published within 15 working days after the final examination. 
                    If your result is not found, please contact your respective branch advisor.
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Sidebar */}
            <div className="space-y-8">
              <div className="bg-theme-dark rounded-[40px] p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-theme-soft text-theme-dark mb-6">
                    <Award size={24} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-4">Certificate <br />Verification</h3>
                  <p className="text-white/50 text-sm font-medium leading-relaxed mb-8">
                    Validate the authenticity of YCSDI professional certificates 
                    using the unique certificate ID.
                  </p>
                  <Link to="/verified-institute" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all">
                    <QrCode size={18} />
                    Verify Now
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-theme-soft/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              </div>

              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-theme-dark mb-6">Need Support?</h3>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    If you encounter any issues accessing your records, our support 
                    team is available to assist you.
                  </p>
                  <a href="tel:+8809638349757" className="flex items-center gap-3 text-theme-primary font-black text-sm hover:text-theme-accent transition-colors">
                    Contact Registrar &rarr;
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
