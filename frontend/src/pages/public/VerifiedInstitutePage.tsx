import { Search, ShieldCheck, MapPin, Phone, Globe, CheckCircle2, Building2 } from "lucide-react";

const branches = [
  {
    name: "YCSDI Central Dhaka",
    location: "Mirpur, Dhaka",
    phone: "+880 9638 349757",
    status: "Main Campus",
    isVerified: true,
  },
  {
    name: "YCSDI Chittagong Branch",
    location: "Agrabad, Chittagong",
    phone: "+880 1XXX XXXXXX",
    status: "Regional Branch",
    isVerified: true,
  },
  {
    name: "YCSDI Sylhet Center",
    location: "Zindabazar, Sylhet",
    phone: "+880 1XXX XXXXXX",
    status: "Affiliated Center",
    isVerified: true,
  },
];

export function VerifiedInstitutePage() {
  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Official Directory
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            Verified Academy <br />
            <span className="text-theme-soft italic">Branch Network.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
            Search and confirm the authenticity of our approved learning centers 
            and official branches across the country.
          </p>
        </div>
      </section>

      {/* Directory Search & List */}
      <section className="-mt-20 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="bg-white rounded-[40px] p-6 lg:p-10 shadow-[0_40px_80px_rgba(27,60,83,0.06)] border border-slate-100">
            
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by branch name or location..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft transition-all"
                />
              </div>
              <div className="flex gap-4">
                <select className="bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-theme-dark font-black text-sm appearance-none cursor-pointer focus:outline-none focus:border-theme-soft">
                  <option>All Divisions</option>
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                </select>
                <button className="px-10 py-5 bg-theme-dark text-theme-soft font-black rounded-2xl hover:bg-theme-accent hover:text-white transition-all">
                  Search
                </button>
              </div>
            </div>

            {/* Branch List */}
            <div className="grid gap-6">
              {branches.map((branch) => (
                <article 
                  key={branch.name}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[32px] border border-slate-100 bg-white transition-all hover:border-theme-soft/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-theme-dark/5 text-theme-dark group-hover:bg-theme-dark group-hover:text-theme-soft transition-colors duration-300">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-theme-dark">{branch.name}</h3>
                        {branch.isVerified && (
                          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            <CheckCircle2 size={12} />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-theme-accent" />
                          {branch.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={16} className="text-theme-accent" />
                          {branch.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {branch.status}
                    </span>
                    <button className="px-6 py-3 rounded-xl border border-slate-100 text-[11px] font-black uppercase tracking-widest text-theme-dark hover:bg-theme-dark hover:text-white transition-all">
                      View Center Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Verification Notice */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-theme-soft/10 text-theme-accent mb-8">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black text-theme-dark tracking-tight mb-6">Always Verify Before Enrollment.</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-2xl">
              To ensure you are receiving official YCSDI training and a valid certificate, 
              please only enroll through branches listed in this official directory. 
              If you suspect an unverified center, please report it immediately.
            </p>
            <div className="flex gap-4">
              <a href="tel:+8809638349757" className="px-8 py-4 bg-theme-dark text-theme-soft font-black rounded-2xl hover:bg-theme-accent hover:text-white transition-all">
                Report Center
              </a>
              <a href="#" className="px-8 py-4 border-2 border-slate-100 text-theme-dark font-black rounded-2xl hover:border-theme-dark transition-all">
                Official Certification
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
