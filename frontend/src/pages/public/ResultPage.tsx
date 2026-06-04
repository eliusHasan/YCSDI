import { Search, ShieldCheck, FileText, Award, CheckCircle2, Printer, Download, Calendar, BookOpen, BadgeCheck, X, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { publicVerifyApi, type PublicResultResponse } from "../../services/api";

export function ResultPage() {
  const [mode, setMode] = useState<"rollreg" | "nid">("rollreg");
  const [roll, setRoll] = useState("");
  const [registration, setRegistration] = useState("");
  const [nid, setNid] = useState("");
  const [data, setData] = useState<PublicResultResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = mode === "nid" ? { nid: nid.trim() } : { roll: roll.trim(), registration: registration.trim() };
      const { data } = await publicVerifyApi.result(params);
      setData(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Could not find a result for those details");
    } finally {
      setLoading(false);
    }
  };

  const showDetails = !!data;
  const r = data?.result;

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden no-print">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Academic Portal
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            {showDetails ? "Official Transcript." : "Check your results &"} <br />
            <span className="text-theme-soft italic">{showDetails ? "Academic Performance" : "verify certifications."}</span>
          </h1>
          {!showDetails && (
            <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
              Access your official academic performance records and verify the
              authenticity of your professional certificates.
            </p>
          )}
        </div>
      </section>

      <section className="-mt-24 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {!showDetails ? (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              <div className="relative group">
                <div className="absolute -inset-4 bg-theme-soft/10 rounded-[48px] blur-3xl opacity-50 pointer-events-none" />
                <div className="relative bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_40px_80px_rgba(27,60,83,0.08)] border border-slate-100">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-dark text-theme-soft">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-theme-dark">Student Result Lookup</h2>
                      <p className="text-slate-500 font-medium text-sm">Look up your marksheet by roll &amp; registration, or by NID / passport number.</p>
                    </div>
                  </div>

                  <form className="grid gap-6" onSubmit={handleSearch}>
                    {/* Lookup mode toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                      {([
                        { key: "rollreg", label: "Roll & Registration" },
                        { key: "nid", label: "NID / Passport" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { setMode(opt.key); setError(null); }}
                          className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            mode === opt.key ? "bg-theme-dark text-theme-soft shadow-lg" : "text-slate-400 hover:text-theme-dark"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {mode === "rollreg" ? (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Roll Number</label>
                          <input
                            type="text"
                            value={roll}
                            onChange={(e) => setRoll(e.target.value)}
                            placeholder="e.g. 1007"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registration Number</label>
                          <input
                            type="text"
                            value={registration}
                            onChange={(e) => setRegistration(e.target.value)}
                            placeholder="e.g. 100023"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">NID / Passport Number</label>
                        <input
                          type="text"
                          value={nid}
                          onChange={(e) => setNid(e.target.value)}
                          placeholder="Enter your NID or passport number"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                        />
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                        <AlertCircle size={18} /> {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="group relative flex items-center justify-center gap-3 w-full bg-theme-dark hover:bg-theme-accent text-theme-soft hover:text-white font-black py-6 rounded-2xl transition-all duration-300 shadow-xl disabled:opacity-60">
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <>Search Result <Search size={20} className="transition-transform group-hover:scale-110" /></>}
                    </button>
                  </form>

                  <div className="mt-10 flex items-start gap-4 p-6 rounded-2xl bg-theme-soft/10 border border-theme-soft/20">
                    <CheckCircle2 className="text-theme-accent shrink-0" size={20} />
                    <p className="text-sm text-theme-dark font-medium leading-relaxed">
                      Results are published after the final examination. If your result is not found,
                      it may not be published yet — please contact your respective branch advisor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 no-print">
                <div className="bg-theme-dark rounded-[40px] p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-theme-soft text-theme-dark mb-6">
                      <Award size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-4">Certificate <br />Verification</h3>
                    <p className="text-white/50 text-sm font-medium leading-relaxed mb-8">
                      Validate the authenticity of any YCSDI document using its unique serial number.
                    </p>
                    <Link to="/verify" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all">
                      <ShieldCheck size={18} />
                      Verify a Document
                    </Link>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-theme-soft/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-theme-dark mb-6">Need Support?</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      If you encounter any issues accessing your records, our support team is available to assist you.
                    </p>
                    <a href="tel:+8809638349757" className="flex items-center gap-3 text-theme-primary font-black text-sm hover:text-theme-accent transition-colors">
                      Contact Registrar &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <button
                onClick={() => setData(null)}
                className="inline-flex items-center gap-2 text-theme-soft font-black text-xs uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors no-print"
              >
                <X size={16} />
                Close Transcript
              </button>

              <div className="bg-white rounded-[40px] shadow-[0_40px_100px_rgba(27,60,83,0.12)] border border-slate-100 overflow-hidden printable-area">
                <div className="bg-theme-dark p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-theme-soft text-sm font-black text-theme-dark">YCSDI</span>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Academic Performance Record</h2>
                      <p className="text-theme-soft/60 text-xs font-black uppercase tracking-[0.3em] mt-1">{data!.institute.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <Printer size={16} /> Print
                    </button>
                    {data!.marksheetUrl && (
                      <a href={data!.marksheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-theme-soft text-theme-dark text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/20">
                        <Download size={16} /> PDF
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-10 grid md:grid-cols-[180px_1fr] gap-10 border-b border-slate-50">
                  <div className="relative group mx-auto md:mx-0">
                    <div className="relative h-[180px] w-[180px] rounded-[28px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                      <img src={data!.student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-3 -right-2 h-10 w-10 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                      <BadgeCheck size={20} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                    <Detail label="Student Name" value={data!.student.fullName} strong />
                    <Detail label="Father's Name" value={data!.student.fatherName} />
                    <Detail label="Roll Number" value={data!.rollNo} accent />
                    <Detail label="Registration" value={data!.registrationNo} accent />
                    <Detail label="Enrolled Course" value={data!.course.title} icon={<BookOpen size={14} className="text-theme-soft" />} />
                    <Detail label="Academic Session" value={data!.session ?? "—"} icon={<Calendar size={14} className="text-theme-soft" />} />
                  </div>
                </div>

                {/* Subject-wise Marksheet Table */}
                <div className="p-6 sm:p-10 bg-slate-50/50">
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-theme-dark text-theme-soft text-[9px] font-black uppercase tracking-[0.2em]">
                          <th className="px-5 py-4">Subject</th>
                          <th className="px-5 py-4 text-center">Full Mark</th>
                          <th className="px-5 py-4 text-center">Obtained</th>
                          <th className="px-5 py-4 text-center">Grade</th>
                          <th className="px-5 py-4 text-right">GP</th>
                        </tr>
                      </thead>
                      <tbody className="text-theme-dark text-sm">
                        {(r?.subjects ?? []).map((s, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3.5 font-bold">{s.name}</td>
                            <td className="px-5 py-3.5 text-center">{s.fullMark}</td>
                            <td className="px-5 py-3.5 text-center font-black">{s.obtainedMark}</td>
                            <td className="px-5 py-3.5 text-center font-black">
                              <span className="inline-block px-3 py-1 rounded-lg bg-theme-primary/5 text-theme-primary">{s.letterGrade}</span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-black text-theme-accent">{s.gradePoint.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-theme-soft/10 text-theme-dark">
                          <td className="px-5 py-4 font-black uppercase tracking-widest text-[11px]">Total / CGPA</td>
                          <td className="px-5 py-4 text-center font-black">{r?.totalFull ?? "—"}</td>
                          <td className="px-5 py-4 text-center font-black">{r?.totalObtained ?? "—"}</td>
                          <td className="px-5 py-4 text-center font-black">{r?.letterGrade ?? "—"}</td>
                          <td className="px-5 py-4 text-right font-black text-theme-accent">{r?.cgpa?.toFixed(2) ?? "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-6 sm:p-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="grid grid-cols-3 gap-12 w-full md:w-auto">
                    <Summary label="Total Marks" value={r ? `${r.totalObtained ?? 0} / ${r.totalFull ?? 0}` : "—"} />
                    <Summary label="CGPA" value={r?.cgpa?.toFixed(2) ?? "—"} accent />
                    <Summary label="Result" value={r && (r.cgpa ?? 0) > 0 ? "Passed" : "—"} status />
                  </div>
                  {data!.serialNo && (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verify Authenticity</p>
                      <Link to={`/verify/${data!.serialNo}`} className="text-[11px] font-black text-theme-dark hover:text-theme-accent">Serial: {data!.serialNo}</Link>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-12 no-print">
                This is a digitally generated transcript. For official purposes, please present the printed
                version with the authorized signature and institution seal.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value, strong, accent, icon }: { label: string; value: string; strong?: boolean; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <p className={`flex items-center gap-2 ${strong ? "text-lg font-black text-theme-dark" : accent ? "text-base font-black text-theme-accent" : "text-base font-bold text-slate-700"}`}>
        {icon}{value}
      </p>
    </div>
  );
}

function Summary({ label, value, accent, status }: { label: string; value: string; accent?: boolean; status?: boolean }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${accent ? "text-theme-accent" : status ? "text-emerald-600 uppercase italic" : "text-theme-dark"}`}>{value}</p>
    </div>
  );
}
