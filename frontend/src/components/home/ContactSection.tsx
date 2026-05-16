import { Mail, MapPin, PhoneCall, Send, MessageSquare, Clock } from "lucide-react";

const contacts = [
  { icon: PhoneCall, label: "Call", value: "+880 9638 349757" },
  { icon: Mail, label: "Email", value: "info.ydibd@gmail.com" },
  { icon: MapPin, label: "Visit", value: "Dhaka, Bangladesh" },
];

export function ContactSection() {
  return (
    <section className="bg-white py-16 lg:py-20 overflow-hidden border-t border-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Compact Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-primary/10 text-theme-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <MessageSquare size={14} className="text-theme-accent" />
            Direct Consultation
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-theme-dark tracking-tight">
            Ready to <span className="text-theme-accent">Get Started?</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          
          {/* Left: Compact Form Card */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-theme-soft/10 rounded-[32px] blur-xl opacity-50 pointer-events-none" />
            <div className="relative bg-theme-dark rounded-[28px] p-8 shadow-xl ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white">Send Inquiry</h3>
                <span className="text-[10px] font-bold text-theme-soft uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">Fast Response</span>
              </div>

              <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-theme-soft/50 transition-all"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-theme-soft/50 transition-all"
                  />
                </div>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer">
                  <option className="bg-theme-dark text-white/40">Select Interest</option>
                  <option className="bg-theme-dark">IT & Web Development</option>
                  <option className="bg-theme-dark">Graphics & Design</option>
                  <option className="bg-theme-dark">Digital Marketing</option>
                </select>
                <button 
                  type="submit"
                  className="group flex items-center justify-center gap-3 w-full bg-theme-soft hover:bg-white text-theme-dark text-sm font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-theme-soft/10"
                >
                  Submit Application
                  <Send size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </div>

          {/* Right: Streamlined Info */}
          <div className="flex flex-col justify-between py-1">
            <div className="grid gap-4">
              {contacts.map((item) => (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-theme-soft/30" key={item.label}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-theme-dark text-theme-soft">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</h4>
                    <p className="text-base font-black text-theme-dark">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-theme-accent" size={20} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Operational Hours</p>
                  <p className="text-sm font-black text-theme-dark">Sat - Thu: 9AM - 8PM</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-slate-100" />
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Friday</p>
                <p className="text-sm font-black text-theme-accent">Closed</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
