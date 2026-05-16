import { Users, GraduationCap, MapPin, QrCode, TrendingUp } from "lucide-react";

const stats = [
  { 
    label: "Success Stories", 
    value: "100K+", 
    icon: TrendingUp,
    desc: "Enrolled & certified students"
  },
  { 
    label: "Professional Tracks", 
    value: "25+", 
    icon: GraduationCap,
    desc: "Industry-aligned programs"
  },
  { 
    label: "Support Network", 
    value: "Multi", 
    icon: MapPin,
    desc: "Regional branch coverage"
  },
  { 
    label: "Verified System", 
    value: "QR Code", 
    icon: QrCode,
    desc: "Secure certificate lookup"
  },
];

export function StatsSection() {
  return (
    <section className="relative bg-theme-dark py-20 lg:py-24 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-soft/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-soft/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="group flex flex-col items-center text-center"
            >
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-theme-soft/20 rounded-2xl blur-xl group-hover:bg-theme-soft/30 transition-all duration-500" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-theme-soft shadow-2xl transition-transform duration-500 group-hover:-translate-y-1">
                  <stat.icon size={32} strokeWidth={1.5} />
                </div>
              </div>
              
              <p className="text-4xl lg:text-5xl font-black text-theme-soft tracking-tight mb-2">
                {stat.value}
              </p>
              
              <h3 className="text-white font-bold text-lg mb-2">
                {stat.label}
              </h3>
              
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[180px]">
                {stat.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
