import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center py-10 px-4 overflow-hidden bg-theme-dark">
      {/* High-Impact Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-theme-soft/10 rounded-full blur-[140px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-theme-accent/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Navigation / Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-theme-soft font-black text-[10px] uppercase tracking-[0.3em] mb-6 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Academy
          </Link>
          
          <div className="flex items-center justify-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-theme-soft text-[10px] font-black text-theme-dark shadow-xl ring-2 ring-white/5">
              YCSDI
            </span>
            <div className="text-left">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">Welcome Back.</h1>
              <p className="text-white/30 font-bold uppercase text-[9px] tracking-wider mt-1">Institutional Access</p>
            </div>
          </div>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/20 via-white/5 to-theme-accent/20 rounded-[32px] blur-md opacity-40 group-hover:opacity-100 transition duration-700" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl overflow-hidden">
            
            <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Academic Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                  <input 
                    type="email" 
                    placeholder="Registered email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Password</label>
                  <Link to="#" className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-theme-soft transition-colors">Forgot?</Link>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button className="group relative flex items-center justify-center gap-3 w-full bg-theme-soft hover:bg-white text-theme-dark font-black py-4.5 rounded-xl transition-all duration-500 overflow-hidden shadow-xl shadow-theme-soft/10">
                <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-widest">
                  Secure Sign In
                  <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link 
                to="/registration" 
                className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:text-theme-soft transition-all group"
              >
                Create Student Account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-theme-soft" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-[8px] font-black text-white uppercase tracking-widest">
             <ShieldCheck size={12} />
             Encrypted Access
           </div>
           <div className="w-1 h-1 rounded-full bg-white/20" />
           <div className="text-[8px] font-black text-white uppercase tracking-widest">
             Govt. Approved
           </div>
        </div>
      </div>
    </main>
  );
}
