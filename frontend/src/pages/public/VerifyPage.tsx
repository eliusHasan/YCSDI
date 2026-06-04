import { BadgeCheck, ExternalLink, Loader2, Search, ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicVerifyApi, type VerifyResponse } from "../../services/api";

function refName(value: unknown, key: string): string {
  if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)[key]);
  }
  return "—";
}

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
      if (e.response?.status === 404) setResult({ found: false, message: "No document found for this serial number" });
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

  const doc = result?.document;

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      <section className="relative bg-theme-dark pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> Document Verification
          </div>
          <h1 className="text-[clamp(32px,5vw,48px)] font-black text-white leading-tight mb-8">
            Verify a document by <span className="text-theme-soft italic">serial number.</span>
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
            result.found && doc ? (
              <div className="bg-white rounded-[32px] shadow-[0_40px_100px_rgba(27,60,83,0.12)] border border-slate-100 overflow-hidden">
                <div className="bg-emerald-500 px-8 py-5 flex items-center gap-3 text-white">
                  <BadgeCheck size={24} />
                  <div>
                    <p className="font-black uppercase tracking-tight">Authentic {result.label}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Serial {doc.serialNo}</p>
                  </div>
                </div>
                <div className="p-8 grid sm:grid-cols-2 gap-x-10 gap-y-5">
                  <Field label="Student" value={refName(doc.studentId, "fullName")} />
                  <Field label="Registration ID" value={refName(doc.studentId, "registrationId")} />
                  <Field label="Course" value={refName(doc.courseId, "title")} />
                  <Field label="Institute" value={refName(doc.instituteId, "name")} />
                  <Field label="Issued On" value={new Date(doc.issuedAt).toLocaleDateString()} />
                  <Field label="Document Type" value={result.label ?? ""} />
                </div>
                <div className="px-8 pb-8">
                  <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-theme-dark text-theme-soft font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-theme-accent hover:text-white transition-all">
                    <ExternalLink size={16} /> View Document PDF
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] p-12 shadow-xl border border-slate-100 text-center">
                <ShieldX className="text-red-400 mx-auto mb-4" size={40} />
                <p className="text-theme-dark font-black uppercase tracking-widest">Not Found</p>
                <p className="text-slate-400 text-sm font-medium mt-2">{result.message ?? "No document matches this serial number."}</p>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-base font-black text-theme-dark">{value}</p>
    </div>
  );
}
