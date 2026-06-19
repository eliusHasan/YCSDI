import { BadgeCheck, Loader2, Search, ShieldCheck, ShieldX, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicVerifyApi, type VerifyResponse } from "../../services/api";

export function VerifyPage() {
  const { serial: serialParam } = useParams();
  const navigate = useNavigate();
  const [serial, setSerial] = useState(serialParam ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await publicVerifyApi.verify(value.trim());
      setResult(data);
    } catch (e: any) {
      if (e.response?.status === 404)
        setResult({ found: false, message: "No record found for this serial number" });
      else setError(e.response?.data?.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serialParam) void lookup(serialParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialParam]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/verify/${serial.trim()}`);
    if (serial.trim() === serialParam) void lookup(serial);
  };

  const data = result?.result;
  const studentName = result?.student?.fullName;

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      <section className="relative bg-theme-dark pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> Result Verification
          </div>
          <h1 className="text-[clamp(32px,5vw,48px)] font-black text-white leading-tight mb-8">
            Verify a result by <span className="text-theme-soft italic">serial number.</span>
          </h1>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="e.g. 325699869"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-white/30 focus:outline-none focus:border-theme-soft"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 bg-theme-soft text-theme-dark font-black px-8 py-4 rounded-2xl hover:bg-white transition-all">
              <Search size={18} /> Verify
            </button>
          </form>
        </div>
      </section>

      <section className="-mt-20 relative z-10 pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {loading && (
            <div className="bg-white rounded-[32px] p-16 shadow-xl border border-slate-100 flex justify-center">
              <Loader2 className="text-theme-soft animate-spin" size={32} />
            </div>
          )}

          {error && (
            <div className="bg-white rounded-[32px] p-10 shadow-xl border border-slate-100 text-center text-red-500 font-bold uppercase tracking-widest text-sm">
              {error}
            </div>
          )}

          {result && !loading && (
            result.found && data ? (
              <div className="relative bg-white rounded-[32px] shadow-[0_40px_100px_rgba(27,60,83,0.12)] border border-slate-100 overflow-hidden">
                <div className="bg-emerald-500 px-8 py-5 flex items-center gap-3 text-white">
                  <BadgeCheck size={24} />
                  <div>
                    <p className="font-black uppercase tracking-tight">Authentic — {data.student.fullName}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Serial {serial.trim() || serialParam}</p>
                  </div>
                </div>
                <div className="relative px-8 py-10 sm:px-12">
                  <img
                    src="/logo.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute left-1/2 top-1/2 w-2/3 max-w-sm -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
                  />
                  <div className="relative grid gap-8 md:grid-cols-[150px_1fr] md:items-start">
                    <div className="mx-auto w-32 md:mx-0">
                      <div className="aspect-[35/45] w-full overflow-hidden rounded-2xl border-4 border-slate-50 bg-slate-100 shadow-inner">
                        {data.student.photoUrl ? (
                          <img src={data.student.photoUrl} alt={data.student.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <User size={40} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3.5">
                      <Row label="Name of the student" value={data.student.fullName} />
                      <Row label="Roll No" value={data.rollNo} />
                      <Row label="Registration No" value={data.registrationNo} />
                      <Row label="Institution" value={data.institute.name} />
                      <Row label="Course Name" value={data.course.title} />
                      <Row label="Course Duration" value={data.course.duration ?? "—"} />
                      <Row label="Session" value={data.session ?? "—"} />
                      <Row label="Final GPA" value={data.result?.cgpa != null ? data.result.cgpa.toFixed(2) : "—"} />
                    </div>
                  </div>
                </div>
              </div>
            ) : result.found ? (
              <div className="bg-white rounded-[32px] p-12 shadow-xl border border-slate-100 text-center">
                <ShieldCheck className="text-emerald-500 mx-auto mb-4" size={40} />
                <p className="text-theme-dark font-black uppercase tracking-widest">
                  Verified{studentName ? ` — ${studentName}` : ""}
                </p>
                <p className="text-slate-400 text-sm font-medium mt-2">
                  No published result is available for this serial number yet.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-12 shadow-xl border border-slate-100 text-center">
                <ShieldX className="text-red-400 mx-auto mb-4" size={40} />
                <p className="text-theme-dark font-black uppercase tracking-widest">Not Found</p>
                <p className="text-slate-400 text-sm font-medium mt-2">{result.message ?? "No record matches this serial number."}</p>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
      <span className="w-40 shrink-0 text-sm font-black text-theme-dark sm:w-48">{label}</span>
      <span className="text-slate-300">:</span>
      <span className="flex-1 text-sm font-bold text-slate-700">{value}</span>
    </div>
  );
}
