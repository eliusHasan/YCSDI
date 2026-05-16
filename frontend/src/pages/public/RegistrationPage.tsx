import { User, Mail, Phone, BookOpen, UserPlus, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Industry-leading curriculum",
  "Professional certifications",
  "Career & placement support",
  "Project-based learning"
];

export function RegistrationPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center py-10 px-4 overflow-hidden bg-theme-dark">
      {/* High-Impact Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-theme-accent/10 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-theme-soft/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Navigation / Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-theme-soft font-black text-[10px] uppercase tracking-[0.3em] mb-6 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          
          <div className="flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[9px] font-black uppercase tracking-widest mb-3">
              <UserPlus size={12} />
              Admission Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Create Account.</h1>
          </div>
        </div>

        {/* Glassmorphism Registration Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/20 via-white/5 to-theme-accent/20 rounded-[32px] blur-md opacity-40 group-hover:opacity-100 transition duration-700" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl overflow-hidden">
            
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              {/* Benefits Sidebar (Inside Card) */}
              <div className="hidden lg:block space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-soft">Academy Perks</h3>
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5">
                      <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-theme-soft/20 text-theme-soft">
                        <CheckCircle2 size={10} />
                      </div>
                      <span className="text-white/70 text-[10px] font-bold uppercase tracking-wide">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mt-6">
                  <ShieldCheck className="text-theme-soft mb-2" size={20} />
                  <p className="text-[9px] text-white/40 font-black uppercase leading-relaxed tracking-wider">
                    Join 100K+ professionals <br /> in our global network.
                  </p>
                </div>
              </div>

              {/* Form Area */}
              <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Full Legal Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                    <input 
                      type="text" 
                      placeholder="e.g. Abdullah Al Mamun"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Email</label>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="email" 
                        placeholder="name@mail.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Phone</label>
                    <div className="relative group/input">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="tel" 
                        placeholder="+880 1XXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Admission Track</label>
                  <div className="relative group/input">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all appearance-none cursor-pointer">
                      <option className="bg-theme-dark">Software Engineering</option>
                      <option className="bg-theme-dark">Creative Design</option>
                      <option className="bg-theme-dark">Digital Marketing</option>
                    </select>
                  </div>
                </div>

                <button className="group relative flex items-center justify-center gap-3 w-full bg-theme-soft hover:bg-white text-theme-dark font-black py-4.5 rounded-xl transition-all duration-500 overflow-hidden shadow-xl shadow-theme-soft/10 mt-2">
                  <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-widest">
                    Submit Application
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:text-theme-soft transition-all group"
              >
                Already have an account? Sign In
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-theme-soft" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}