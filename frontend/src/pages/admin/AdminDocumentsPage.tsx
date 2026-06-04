import {
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Hash,
  IdCard,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  adminApi,
  documentApi,
  type AdminStudentDetailResponse,
  type DocumentType,
  type Enrollment,
  type IssuedDocument,
  type Student,
} from "../../services/api";

const DOC_META: { type: DocumentType; label: string; icon: typeof FileText; needsMarks: boolean }[] = [
  { type: "registration", label: "Registration Card", icon: IdCard, needsMarks: false },
  { type: "admit", label: "Admit Card", icon: FileText, needsMarks: false },
  { type: "marksheet", label: "Marksheet", icon: GraduationCap, needsMarks: true },
  { type: "certificate", label: "Certificate", icon: Award, needsMarks: true },
];

export function AdminDocumentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [detail, setDetail] = useState<AdminStudentDetailResponse | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await adminApi.getStudents();
        setStudents(data.filter((s) => s.status === "approved" && !s.banned));
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, []);

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const { data } = await documentApi.studentDetail(id);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (studentId) void loadDetail(studentId);
    else setDetail(null);
  }, [studentId]);

  const options = useMemo(
    () => students.map((s) => ({ value: s._id, label: `${s.registrationId} — ${s.fullName}` })),
    [students],
  );

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
            <FileText size={14} />
            Documents
          </div>
          <h1 className="text-3xl font-black tracking-tight">Student Documents.</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
            Enter marks, then issue registration cards, admit cards, marksheets & certificates
          </p>
        </div>

        <div className="max-w-xl">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1 mb-2 block">
            Select an approved student
          </label>
          {loadingStudents ? (
            <Loader2 className="text-theme-soft animate-spin" size={20} />
          ) : (
            <SearchableSelect
              name="student"
              value={studentId}
              onChange={setStudentId}
              options={options}
              placeholder="Pick a student…"
              icon={GraduationCap}
            />
          )}
        </div>

        {loadingDetail && (
          <div className="p-16 flex justify-center">
            <Loader2 className="text-theme-soft animate-spin" size={28} />
          </div>
        )}

        {detail && !loadingDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                <img src={detail.student.photoUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-lg font-black uppercase tracking-tight">{detail.student.fullName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1 flex items-center gap-1.5">
                  <Hash size={11} /> {detail.student.registrationId}
                  {detail.student.instituteId && (
                    <>
                      <Building2 size={11} className="ml-3" />
                      {detail.student.instituteId.code}
                    </>
                  )}
                </p>
              </div>
            </div>

            {detail.enrollments.length === 0 ? (
              <div className="rounded-[28px] bg-white/5 border border-white/10 p-12 text-center">
                <GraduationCap className="text-white/20 mx-auto mb-3" size={32} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No enrollments</p>
              </div>
            ) : (
              detail.enrollments.map((enr) => (
                <EnrollmentPanel
                  key={enr._id}
                  enrollment={enr}
                  documents={detail.documents}
                  onChanged={() => loadDetail(detail.student._id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function findDoc<T extends IssuedDocument>(docs: T[], enrollmentId: string): T | undefined {
  return docs.find((d) => d.enrollmentId === enrollmentId);
}

interface PanelProps {
  enrollment: Enrollment;
  documents: AdminStudentDetailResponse["documents"];
  onChanged: () => void;
}

function EnrollmentPanel({ enrollment, documents, onChanged }: PanelProps) {
  const r = enrollment.result;
  const courseSubjects = enrollment.courseId.subjects ?? [];
  const [identity, setIdentity] = useState({
    rollNo: enrollment.rollNo ?? "",
    registrationNo: enrollment.registrationNo ?? "",
    session: enrollment.session ?? "",
  });
  const [published, setPublished] = useState(r?.published ?? false);
  const [subjects, setSubjects] = useState<{ name: string; fullMark: string; obtainedMark: string }[]>(() => {
    const existing = r?.subjects ?? [];
    const names = courseSubjects.length ? courseSubjects : existing.map((s) => s.name);
    return names.map((name) => {
      const ex = existing.find((s) => s.name === name);
      return { name, fullMark: ex?.fullMark?.toString() ?? "100", obtainedMark: ex?.obtainedMark?.toString() ?? "" };
    });
  });
  const [saving, setSaving] = useState(false);
  const [issuing, setIssuing] = useState<DocumentType | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const setId = (k: keyof typeof identity, v: string) => setIdentity((f) => ({ ...f, [k]: v }));
  const setSubject = (i: number, k: "fullMark" | "obtainedMark", v: string) =>
    setSubjects((arr) => arr.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  const totalObtained = subjects.reduce((a, s) => a + (Number(s.obtainedMark) || 0), 0);
  const totalFull = subjects.reduce((a, s) => a + (Number(s.fullMark) || 0), 0);
  const hasMarks = !!r && r.cgpa !== undefined && (r.subjects?.length ?? 0) > 0;

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await documentApi.patchEnrollment(enrollment._id, {
        rollNo: identity.rollNo || undefined,
        registrationNo: identity.registrationNo || undefined,
        session: identity.session || undefined,
        subjects: subjects.map((s) => ({
          name: s.name,
          fullMark: Number(s.fullMark) || 0,
          obtainedMark: Number(s.obtainedMark) || 0,
        })),
        published,
      });
      setMsg("Saved");
      onChanged();
    } catch (e: any) {
      setMsg(e.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const issue = async (type: DocumentType) => {
    setIssuing(type);
    setMsg(null);
    try {
      await documentApi.issue(type, enrollment._id);
      onChanged();
    } catch (e: any) {
      setMsg(e.response?.data?.message ?? "Issue failed");
    } finally {
      setIssuing(null);
    }
  };

  const removeDoc = async (type: DocumentType, id: string) => {
    if (!confirm(`Delete this ${type} document? (PDF stays on Cloudinary)`)) return;
    try {
      await documentApi.remove(type, id);
      onChanged();
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Delete failed");
    }
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all";
  const labelCls = "text-[9px] font-black uppercase tracking-[0.18em] text-white/40 mb-1 block ml-0.5";

  return (
    <div className="rounded-[28px] bg-white/5 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <p className="text-sm font-black uppercase tracking-tight">{enrollment.courseId.title}</p>
        {r?.cgpa !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-soft/10 border border-theme-soft/30 text-theme-soft text-[10px] font-black uppercase tracking-widest">
            <BadgeCheck size={11} /> CGPA {r.cgpa.toFixed(2)} · {r.letterGrade}
            {r.published ? " · Published" : " · Draft"}
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Identity */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Roll No</label>
            <input className={inputCls} value={identity.rollNo} onChange={(e) => setId("rollNo", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Registration No</label>
            <input className={inputCls} value={identity.registrationNo} onChange={(e) => setId("registrationNo", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Session</label>
            <input className={inputCls} placeholder="Jan 2024 - Dec 2024" value={identity.session} onChange={(e) => setId("session", e.target.value)} />
          </div>
        </div>

        {/* Subject-wise marks */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40 ml-0.5">Subject Marks</p>
          {subjects.length === 0 ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-[11px] font-bold text-amber-300/90">
              This course has no subjects defined. Add subjects to the course (Courses page) to enter marks.
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_90px_90px] gap-px bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                <div className="bg-theme-dark px-3 py-2">Subject</div>
                <div className="bg-theme-dark px-3 py-2 text-center">Full Mark</div>
                <div className="bg-theme-dark px-3 py-2 text-center">Obtained</div>
              </div>
              {subjects.map((s, i) => (
                <div key={s.name} className="grid grid-cols-[1fr_90px_90px] gap-px bg-white/10">
                  <div className="bg-theme-dark/60 px-3 py-2 text-sm font-bold flex items-center">{s.name}</div>
                  <input type="number" value={s.fullMark} onChange={(e) => setSubject(i, "fullMark", e.target.value)}
                    className="bg-theme-dark/60 px-3 py-2 text-sm font-bold text-center focus:outline-none focus:bg-white/10" />
                  <input type="number" value={s.obtainedMark} onChange={(e) => setSubject(i, "obtainedMark", e.target.value)}
                    className="bg-theme-dark/60 px-3 py-2 text-sm font-bold text-center focus:outline-none focus:bg-white/10" />
                </div>
              ))}
              <div className="grid grid-cols-[1fr_90px_90px] gap-px bg-white/10 text-theme-soft text-sm font-black">
                <div className="bg-theme-soft/10 px-3 py-2 uppercase tracking-widest text-[10px] flex items-center">Total</div>
                <div className="bg-theme-soft/10 px-3 py-2 text-center">{totalFull}</div>
                <div className="bg-theme-soft/10 px-3 py-2 text-center">{totalObtained}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/60 cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-theme-soft h-4 w-4" />
            Publish result (visible on public lookup)
          </label>
          <div className="flex items-center gap-3">
            {msg && <span className="text-[10px] font-bold uppercase tracking-widest text-theme-soft">{msg}</span>}
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save marks
            </button>
          </div>
        </div>

        {/* Issue buttons */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
          {DOC_META.map((meta) => {
            const bucket =
              meta.type === "registration" ? documents.registrationCards
              : meta.type === "admit" ? documents.admitCards
              : meta.type === "marksheet" ? documents.marksheets
              : documents.certificates;
            const existing = findDoc(bucket as IssuedDocument[], enrollment._id);
            const blocked = meta.needsMarks && !hasMarks;

            return (
              <div key={meta.type} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <meta.icon size={16} className="text-theme-soft shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest truncate">{meta.label}</p>
                    {existing && <p className="text-[9px] font-bold text-white/30 truncate">Serial {existing.serialNo}</p>}
                  </div>
                </div>
                {existing ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a href={existing.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="View"><ExternalLink size={13} /></a>
                    <a href={existing.pdfUrl} download className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="Download"><Download size={13} /></a>
                    <button onClick={() => removeDoc(meta.type, existing._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors" title="Delete"><Trash2 size={13} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => issue(meta.type)}
                    disabled={!!issuing || blocked}
                    title={blocked ? "Save exam marks first" : undefined}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 shrink-0"
                  >
                    {issuing === meta.type ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Issue
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
