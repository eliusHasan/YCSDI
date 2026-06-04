import {
  AlertCircle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Hash,
  IdCard,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentApi, type CertificateCourseRef, type StudentMeResponse } from "../../services/api";

function courseTitle(courseId: CertificateCourseRef | string): string {
  return typeof courseId === "object" && courseId ? courseId.title : "Document";
}
import { useAuthStore } from "../../stores/auth";

export function StudentDashboard() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [data, setData] = useState<StudentMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await studentApi.me();
        if (!cancelled) setData(data);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message ?? "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-theme-dark text-white flex items-center justify-center">
        <Loader2 className="text-theme-soft animate-spin" size={40} />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-theme-dark text-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={36} />
          <p className="text-red-400 text-sm font-bold uppercase tracking-widest">{error ?? "Unknown error"}</p>
          <button
            onClick={handleLogout}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  const { student, enrollments, certificates, registrationCards, admitCards, marksheets } = data;

  return (
    <main className="min-h-screen bg-theme-dark text-white">
      <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl border border-white/10 overflow-hidden bg-white/5 shrink-0">
              <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-soft/10 border border-theme-soft/20 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-2">
                <Sparkles size={12} />
                Student Portal
              </div>
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">{student.fullName}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1 flex items-center gap-1.5">
                <Hash size={11} /> {student.registrationId}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <SummaryCard
            icon={Hash}
            label="Serial Number"
            value={student.serialNo ?? student.registrationId}
            highlight
          />
          <SummaryCard
            icon={Building2}
            label="Institute"
            value={student.instituteId ? `${student.instituteId.code} — ${student.instituteId.name}` : "Not yet assigned"}
            dimmed={!student.instituteId}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Account"
            value={student.status === "approved" ? "Approved" : student.status === "rejected" ? "Rejected" : "Pending review"}
            dimmed={student.status !== "approved"}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CountCard icon={BookOpen} label="Enrollments" value={enrollments.length} />
          <CountCard icon={IdCard} label="Cards" value={registrationCards.length + admitCards.length} />
          <CountCard icon={GraduationCap} label="Marksheets" value={marksheets.length} />
          <CountCard icon={Award} label="Certificates" value={certificates.length} />
        </div>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-theme-soft" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">My Enrollments</h2>
          </div>

          {enrollments.length === 0 ? (
            <div className="rounded-[32px] bg-white/5 border border-white/10 p-16 text-center">
              <BookOpen className="text-white/20 mx-auto mb-4" size={36} />
              <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No enrollments yet</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">
                {student.status === "pending"
                  ? "Your application is pending review"
                  : "Contact your institute to enroll in courses"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enrollments.map((e) => (
                <article
                  key={e._id}
                  className="relative bg-white/5 border border-white/10 rounded-[28px] overflow-hidden hover:bg-white/[0.07] transition-colors"
                >
                  <div className="aspect-[16/8] overflow-hidden">
                    <img src={e.courseId.imageUrl} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 aspect-[16/8] bg-gradient-to-t from-theme-dark/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-black uppercase tracking-tight">{e.courseId.title}</h3>
                      <EnrollmentBadge status={e.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {e.session && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-theme-soft" />
                          {e.session}
                        </div>
                      )}
                      {e.courseId.duration && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-theme-soft" />
                          {e.courseId.duration}
                        </div>
                      )}
                      {e.courseId.level && (
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={11} className="text-theme-soft" />
                          {e.courseId.level}
                        </div>
                      )}
                      {e.courseId.category && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={11} className="text-theme-soft" />
                          {e.courseId.category}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <DocsGroup
          icon={IdCard}
          title="Registration Cards"
          items={registrationCards.map((d) => ({ id: d._id, title: courseTitle(d.courseId), sub: `Serial ${d.serialNo}`, issuedAt: d.issuedAt, pdfUrl: d.pdfUrl }))}
        />
        <DocsGroup
          icon={FileText}
          title="Admit Cards"
          items={admitCards.map((d) => ({ id: d._id, title: courseTitle(d.courseId), sub: `Serial ${d.serialNo}`, issuedAt: d.issuedAt, pdfUrl: d.pdfUrl }))}
        />
        <DocsGroup
          icon={GraduationCap}
          title="Marksheets"
          items={marksheets.map((d) => ({ id: d._id, title: courseTitle(d.courseId), sub: `CGPA ${d.cgpa.toFixed(2)} · ${d.letterGrade}`, issuedAt: d.issuedAt, pdfUrl: d.pdfUrl }))}
        />
        <DocsGroup
          icon={Award}
          title="Certificates"
          items={certificates.map((d) => ({ id: d._id, title: courseTitle(d.courseId), sub: d.certificateNumber, issuedAt: d.issuedAt, pdfUrl: d.pdfUrl }))}
        />
      </div>
    </main>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
  dimmed?: boolean;
}

function SummaryCard({ icon: Icon, label, value, highlight, dimmed }: SummaryCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        highlight ? "bg-theme-soft/10 border-theme-soft/30" : "bg-white/5 border-white/10"
      }`}
    >
      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2 ${highlight ? "text-theme-soft" : "text-white/40"}`}>
        <Icon size={12} /> {label}
      </div>
      <p className={`text-sm font-black uppercase tracking-wide ${dimmed ? "text-white/40" : ""}`}>{value}</p>
    </div>
  );
}

function CountCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-theme-soft/10 text-theme-soft mb-3">
        <Icon size={16} />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{label}</p>
    </div>
  );
}

interface DocItem {
  id: string;
  title: string;
  sub: string;
  issuedAt: string;
  pdfUrl: string;
}

function DocsGroup({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  items: DocItem[];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Icon className="text-theme-soft" size={18} />
        <h2 className="text-xs font-black uppercase tracking-widest text-white/60">
          {title} ({items.length})
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="rounded-[32px] bg-white/5 border border-white/10 p-10 text-center">
          <Icon className="text-white/20 mx-auto mb-4" size={36} />
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No {title.toLowerCase()} yet</p>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">
            Issued by your institute once available
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((d) => (
            <article key={d.id} className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/[0.08] transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-theme-soft/20 text-theme-soft shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-tight truncate">{d.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-theme-soft mt-1 flex items-center gap-1.5">
                    <Hash size={10} />
                    {d.sub}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3 flex items-center gap-1.5">
                <Calendar size={10} /> Issued {new Date(d.issuedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <a href={d.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                  <ExternalLink size={12} /> View
                </a>
                <a href={d.pdfUrl} download className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
                  <Download size={12} /> Download
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EnrollmentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    active: { label: "Active", classes: "bg-green-500/10 border-green-500/20 text-green-400" },
    completed: { label: "Completed", classes: "bg-theme-soft/10 border-theme-soft/30 text-theme-soft" },
    cancelled: { label: "Cancelled", classes: "bg-white/5 border-white/10 text-white/40" },
  };
  const s = map[status] ?? map.active;
  return (
    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.classes}`}>
      <CheckCircle2 size={10} />
      {s.label}
    </span>
  );
}
