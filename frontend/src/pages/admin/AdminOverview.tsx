import {
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  Loader2,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminStatsApi, type AdminStats } from "../../services/api";

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await adminStatsApi.get();
        setStats(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="text-theme-soft animate-spin" size={32} />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-10 text-white/40 text-sm font-bold uppercase tracking-widest">Failed to load stats.</div>;
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
            <LayoutDashboard size={14} />
            Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight">Overview.</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">Institute-wide summary at a glance</p>
        </div>

        {/* Primary stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            to="/admin/students"
            icon={GraduationCap}
            label="Students"
            value={stats.students.total}
            sub={`${stats.students.approved} approved · ${stats.students.pending} pending`}
            highlight
          />
          <StatCard to="/admin/courses" icon={BookOpen} label="Courses" value={stats.courses.total} sub={`${stats.courses.published} published`} />
          <StatCard to="/admin/institutes" icon={Building2} label="Institutes" value={stats.institutes.total} sub={`${stats.institutes.active} active`} />
          <StatCard to="/admin/staff" icon={UsersRound} label="Staff" value={stats.staff.total} sub="members" />
        </div>

        {/* Documents issued */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-theme-soft" size={16} />
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Documents Issued ({stats.documents.total})</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DocStat icon={IdCard} label="Registration Cards" value={stats.documents.registration} />
            <DocStat icon={FileText} label="Admit Cards" value={stats.documents.admit} />
            <DocStat icon={GraduationCap} label="Marksheets" value={stats.documents.marksheet} />
            <DocStat icon={Award} label="Certificates" value={stats.documents.certificate} />
          </div>
        </div>

        {/* Recent registrations */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-theme-soft" size={16} />
              <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Recent Registrations</h2>
            </div>
            <Link to="/admin/students" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-theme-soft transition-colors">
              View all →
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden">
            {stats.recentStudents.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-sm font-bold uppercase tracking-widest">No registrations yet</div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.recentStudents.map((s) => (
                  <div key={s._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                    <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-white/5 shrink-0">
                      <img src={s.photoUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black uppercase tracking-wide truncate">{s.fullName}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">
                        {s.registrationId}
                        {s.preferredCourseId?.title ? ` · ${s.preferredCourseId.title}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
}

function StatCard({ to, icon: Icon, label, value, sub, highlight }: StatCardProps) {
  return (
    <Link
      to={to}
      className={`group rounded-[24px] p-5 border transition-all ${
        highlight ? "bg-theme-soft/10 border-theme-soft/30 hover:bg-theme-soft/15" : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${highlight ? "bg-theme-soft/20 text-theme-soft" : "bg-white/5 text-theme-soft"}`}>
          <Icon size={20} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-theme-soft transition-colors">Open →</span>
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{label}</p>
      <p className="text-[10px] font-bold text-white/30 mt-2">{sub}</p>
    </Link>
  );
}

function DocStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center gap-2 text-theme-soft mb-3">
        <Icon size={16} />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-500/10 border-green-500/20 text-green-400",
    pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rejected: "bg-red-500/10 border-red-500/20 text-red-400",
  };
  return (
    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}
