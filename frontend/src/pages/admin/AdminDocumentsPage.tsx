import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Hash,
  IdCard,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PAGE_SIZE, Pagination } from "../../components/ui/Pagination";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import {
  adminApi,
  documentApi,
  type AdminStudentDetailResponse,
  type CertificateCourseRef,
  type CertificateInstituteRef,
  type CertificateIssuerRef,
  type CertificateStudentRef,
  type DocumentType,
  type Enrollment,
  type IssuedDocument,
  type Student,
} from "../../services/api";

type AnyDoc = IssuedDocument & { certificateNumber?: string };
interface DocBuckets {
  registration: AnyDoc[];
  admit: AnyDoc[];
  marksheet: AnyDoc[];
  certificate: AnyDoc[];
}

const DOC_META: { type: DocumentType; label: string; short: string; icon: typeof FileText; needsMarks: boolean }[] = [
  { type: "registration", label: "Registration Card", short: "Reg. Card", icon: IdCard, needsMarks: false },
  { type: "admit", label: "Admit Card", short: "Admit", icon: FileText, needsMarks: false },
  { type: "marksheet", label: "Marksheet", short: "Marksheet", icon: GraduationCap, needsMarks: true },
  { type: "certificate", label: "Certificate", short: "Certificate", icon: Award, needsMarks: true },
];
const metaFor = (t: DocumentType) => DOC_META.find((m) => m.type === t)!;

function isRef<T>(v: T | string | undefined): v is T {
  return typeof v === "object" && v !== null;
}

function findDoc(docs: AnyDoc[], enrollmentId: string): AnyDoc | undefined {
  return docs.find((d) => d.enrollmentId === enrollmentId);
}

export function AdminDocumentsPage() {
  const [tab, setTab] = useState<"issue" | "all">("issue");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [detail, setDetail] = useState<AdminStudentDetailResponse | null>(null);
  const [allDocs, setAllDocs] = useState<DocBuckets | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadAllDocs = async () => {
    const [r, a, m, c] = await Promise.all([
      documentApi.list<AnyDoc>("registration"),
      documentApi.list<AnyDoc>("admit"),
      documentApi.list<AnyDoc>("marksheet"),
      documentApi.list<AnyDoc>("certificate"),
    ]);
    setAllDocs({ registration: r.data, admit: a.data, marksheet: m.data, certificate: c.data });
  };

  useEffect(() => {
    void (async () => {
      try {
        const [s] = await Promise.all([adminApi.getStudents(), loadAllDocs()]);
        setStudents(s.data.filter((x) => x.status === "approved" && !x.banned));
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

  // Refresh both the selected student's detail and the global document lists.
  const refresh = async () => {
    await Promise.all([studentId ? loadDetail(studentId) : Promise.resolve(), loadAllDocs()]);
  };

  const options = useMemo(
    () => students.map((s) => ({ value: s._id, label: `${s.registrationId} — ${s.fullName}`, keywords: s.serialNo ?? "" })),
    [students],
  );

  const counts = allDocs
    ? {
        registration: allDocs.registration.length,
        admit: allDocs.admit.length,
        marksheet: allDocs.marksheet.length,
        certificate: allDocs.certificate.length,
      }
    : null;

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
            Enter marks, then issue registration cards, admit cards, marksheets &amp; certificates
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {DOC_META.map((m) => (
            <div key={m.type} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-theme-soft/10 text-theme-soft mb-3">
                <m.icon size={18} />
              </div>
              <p className="text-2xl font-black">{counts ? counts[m.type] : <span className="text-white/20">—</span>}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{m.label}s</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-white/5 border border-white/10">
          <TabButton active={tab === "issue"} onClick={() => setTab("issue")} icon={Sparkles} label="Issue Documents" />
          <TabButton active={tab === "all"} onClick={() => setTab("all")} icon={LayoutGrid} label={`All Documents${counts ? ` (${counts.registration + counts.admit + counts.marksheet + counts.certificate})` : ""}`} />
        </div>

        {tab === "issue" ? (
          <div className="space-y-6">
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
                  searchPlaceholder="Search by name, reg ID, or serial…"
                  icon={GraduationCap}
                />
              )}
            </div>

            {loadingDetail && (
              <div className="p-16 flex justify-center">
                <Loader2 className="text-theme-soft animate-spin" size={28} />
              </div>
            )}

            {!studentId && !loadingDetail && (
              <div className="rounded-[28px] bg-white/5 border border-white/10 border-dashed p-16 text-center">
                <GraduationCap className="text-white/20 mx-auto mb-3" size={32} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Pick a student to manage marks &amp; documents</p>
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
                    <EnrollmentPanel key={enr._id} enrollment={enr} documents={detail.documents} onChanged={refresh} />
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <AllDocumentsTab allDocs={allDocs} onChanged={refresh} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
        active ? "bg-theme-soft text-theme-dark shadow-lg shadow-theme-soft/10" : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

/* ---------------- Issue tab: per-enrollment panel ---------------- */

interface PanelProps {
  enrollment: Enrollment;
  documents: AdminStudentDetailResponse["documents"];
  onChanged: () => void | Promise<void>;
}

function bucketFor(documents: AdminStudentDetailResponse["documents"], type: DocumentType): AnyDoc[] {
  if (type === "registration") return documents.registrationCards as AnyDoc[];
  if (type === "admit") return documents.admitCards as AnyDoc[];
  if (type === "marksheet") return documents.marksheets as AnyDoc[];
  return documents.certificates as AnyDoc[];
}

function EnrollmentPanel({ enrollment, documents, onChanged }: PanelProps) {
  const r = enrollment.result;
  const courseSubjects = enrollment.courseId.subjects ?? [];
  const [identity, setIdentity] = useState({
    rollNo: enrollment.rollNo ?? "",
    registrationNo: enrollment.registrationNo ?? "",
    session: enrollment.session ?? "",
  });
  const [examDate, setExamDate] = useState("");
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
  const [issuing, setIssuing] = useState<DocumentType | "all" | null>(null);
  const [regenerating, setRegenerating] = useState<DocumentType | null>(null);
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
        subjects: subjects.map((s) => ({ name: s.name, fullMark: Number(s.fullMark) || 0, obtainedMark: Number(s.obtainedMark) || 0 })),
        published,
      });
      setMsg("Saved");
      await onChanged();
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
      await documentApi.issue(type, enrollment._id, examDate || undefined);
      await onChanged();
    } catch (e: any) {
      setMsg(e.response?.data?.message ?? "Issue failed");
    } finally {
      setIssuing(null);
    }
  };

  const issueAll = async () => {
    setIssuing("all");
    setMsg(null);
    let done = 0;
    let skipped = 0;
    for (const meta of DOC_META) {
      if (findDoc(bucketFor(documents, meta.type), enrollment._id)) {
        skipped += 1;
        continue;
      }
      if (meta.needsMarks && !hasMarks) {
        skipped += 1;
        continue;
      }
      try {
        await documentApi.issue(meta.type, enrollment._id, examDate || undefined);
        done += 1;
      } catch {
        /* keep going */
      }
    }
    setMsg(`Issued ${done}${skipped ? `, skipped ${skipped}` : ""}`);
    await onChanged();
    setIssuing(null);
  };

  const regenerate = async (type: DocumentType, id: string) => {
    setRegenerating(type);
    setMsg(null);
    try {
      await documentApi.regenerate(type, id);
      setMsg(`${type} regenerated`);
      await onChanged();
    } catch (e: any) {
      setMsg(e.response?.data?.message ?? "Regenerate failed");
    } finally {
      setRegenerating(null);
    }
  };

  const removeDoc = async (type: DocumentType, id: string) => {
    if (!confirm(`Delete this ${type} document? (PDF stays on Cloudinary)`)) return;
    try {
      await documentApi.remove(type, id);
      await onChanged();
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Delete failed");
    }
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all";
  const labelCls = "text-[9px] font-black uppercase tracking-[0.18em] text-white/40 mb-1 block ml-0.5";

  const issuedCount = DOC_META.filter((m) => findDoc(bucketFor(documents, m.type), enrollment._id)).length;
  const busy = issuing !== null;

  return (
    <div className="rounded-[28px] bg-white/5 border border-white/10 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <p className="text-sm font-black uppercase tracking-tight">{enrollment.courseId.title}</p>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{issuedCount}/4 issued</span>
        </div>
        {r?.cgpa !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-soft/10 border border-theme-soft/30 text-theme-soft text-[10px] font-black uppercase tracking-widest">
            <BadgeCheck size={11} /> CGPA {r.cgpa.toFixed(2)} · {r.letterGrade}
            {r.published ? " · Published" : " · Draft"}
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Identity */}
        <div className="grid sm:grid-cols-4 gap-3">
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
          <div>
            <label className={labelCls}>Exam Date (admit/cert)</label>
            <input type="date" className={`${inputCls} [color-scheme:dark]`} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
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

        {/* Issue buttons + bulk */}
        <div className="pt-2 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">Documents</p>
            <button
              onClick={issueAll}
              disabled={busy || issuedCount === 4}
              title={issuedCount === 4 ? "All documents already issued" : "Issue all eligible documents"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40"
            >
              {issuing === "all" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Issue All
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {DOC_META.map((meta) => {
              const existing = findDoc(bucketFor(documents, meta.type), enrollment._id);
              const blocked = meta.needsMarks && !hasMarks;

              return (
                <div key={meta.type} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <meta.icon size={16} className="text-theme-soft shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest truncate">{meta.label}</p>
                      {existing ? (
                        <p className="text-[9px] font-bold text-white/30 truncate">
                          #{existing.serialNo} · {new Date(existing.issuedAt).toLocaleDateString()}
                        </p>
                      ) : blocked ? (
                        <p className="text-[9px] font-bold text-amber-300/60 truncate">Needs marks</p>
                      ) : null}
                    </div>
                  </div>
                  {existing ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={existing.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="View"><ExternalLink size={13} /></a>
                      <a href={existing.pdfUrl} download className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="Download"><Download size={13} /></a>
                      <button onClick={() => regenerate(meta.type, existing._id)} disabled={busy || regenerating !== null || blocked} title="Regenerate from current data" className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors disabled:opacity-40"><RefreshCw size={13} className={regenerating === meta.type ? "animate-spin" : ""} /></button>
                      <button onClick={() => removeDoc(meta.type, existing._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => issue(meta.type)}
                      disabled={busy || blocked}
                      title={blocked ? "Save subject marks first" : undefined}
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
    </div>
  );
}

/* ---------------- All documents tab ---------------- */

function AllDocumentsTab({ allDocs, onChanged }: { allDocs: DocBuckets | null; onChanged: () => void | Promise<void>; }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocumentType | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const rows = useMemo(() => {
    if (!allDocs) return [];
    const tag = (type: DocumentType, arr: AnyDoc[]) => arr.map((doc) => ({ type, doc }));
    return [
      ...tag("registration", allDocs.registration),
      ...tag("admit", allDocs.admit),
      ...tag("marksheet", allDocs.marksheet),
      ...tag("certificate", allDocs.certificate),
    ].sort((a, b) => new Date(b.doc.issuedAt).getTime() - new Date(a.doc.issuedAt).getTime());
  }, [allDocs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ type, doc }) => {
      if (filter !== "all" && type !== filter) return false;
      if (!q) return true;
      const stu = isRef<CertificateStudentRef>(doc.studentId) ? doc.studentId : null;
      const crs = isRef<CertificateCourseRef>(doc.courseId) ? doc.courseId : null;
      return [doc.serialNo, doc.certificateNumber ?? "", stu?.fullName ?? "", stu?.registrationId ?? "", crs?.title ?? ""]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, filter]);

  const docPageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const docSafePage = Math.min(page, docPageCount);
  const pagedDocs = filtered.slice((docSafePage - 1) * PAGE_SIZE, docSafePage * PAGE_SIZE);

  const regenerate = async (type: DocumentType, id: string) => {
    setBusyId(id);
    try {
      await documentApi.regenerate(type, id);
      await onChanged();
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Regenerate failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (type: DocumentType, id: string) => {
    if (!confirm(`Delete this ${type} document? (PDF stays on Cloudinary)`)) return;
    setBusyId(id);
    try {
      await documentApi.remove(type, id);
      await onChanged();
    } catch (e: any) {
      alert(e.response?.data?.message ?? "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  if (!allDocs) {
    return (
      <div className="p-16 flex justify-center">
        <Loader2 className="text-theme-soft animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          {DOC_META.map((m) => (
            <FilterChip key={m.type} active={filter === m.type} onClick={() => setFilter(m.type)} label={m.short} />
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, serial, course…"
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-theme-soft/50 transition-all w-64"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="text-white/20 mx-auto mb-3" size={32} />
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
              {rows.length === 0 ? "No documents issued yet" : "No matches"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Type</th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Student</th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Course</th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Serial · Issued</th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pagedDocs.map(({ type, doc }) => {
                  const meta = metaFor(type);
                  const stu = isRef<CertificateStudentRef>(doc.studentId) ? doc.studentId : null;
                  const crs = isRef<CertificateCourseRef>(doc.courseId) ? doc.courseId : null;
                  const inst = isRef<CertificateInstituteRef>(doc.instituteId) ? doc.instituteId : null;
                  const issuer = isRef<CertificateIssuerRef>(doc.issuedByAdminId) ? doc.issuedByAdminId : null;
                  return (
                    <tr key={`${type}-${doc._id}`} className="hover:bg-white/[0.02] transition-colors group/row">
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-theme-soft">
                          <meta.icon size={13} /> {meta.short}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {stu ? (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-white/5 shrink-0">
                              <img src={stu.photoUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black uppercase tracking-wide truncate">{stu.fullName}</p>
                              <p className="text-[10px] font-bold text-white/30">{stu.registrationId}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-white/60">
                        <p className="truncate max-w-[180px]">{crs?.title ?? "—"}</p>
                        {inst && <p className="text-white/30 mt-0.5">{inst.code}</p>}
                      </td>
                      <td className="px-5 py-4 text-[11px] font-bold text-white/60">
                        <p className="text-theme-soft flex items-center gap-1.5"><Hash size={10} />{doc.serialNo}</p>
                        <p className="text-white/30 mt-0.5 flex items-center gap-1.5">
                          <Calendar size={10} /> {new Date(doc.issuedAt).toLocaleDateString()}
                          {issuer ? ` · ${issuer.userId}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="View"><ExternalLink size={13} /></a>
                          <a href={doc.pdfUrl} download className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors" title="Download"><Download size={13} /></a>
                          <button onClick={() => regenerate(type, doc._id)} disabled={busyId === doc._id} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors disabled:opacity-40" title="Regenerate"><RefreshCw size={13} className={busyId === doc._id ? "animate-spin" : ""} /></button>
                          <button onClick={() => remove(type, doc._id)} disabled={busyId === doc._id} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={docSafePage} total={filtered.length} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? "bg-theme-soft text-theme-dark" : "bg-white/5 border border-white/10 text-white/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
