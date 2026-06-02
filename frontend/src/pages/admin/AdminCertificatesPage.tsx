import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Hash,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminApi,
  adminCertificateApi,
  publicCourseApi,
  type Certificate,
  type CertificateCourseRef,
  type CertificateInstituteRef,
  type CertificateIssuerRef,
  type CertificateStudentRef,
  type Course,
  type Student,
} from "../../services/api";

interface EnrollmentChoice {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentSerial: string;
  courseId: string;
  courseTitle: string;
}

function isRef<T>(value: T | string): value is T {
  return typeof value === "object" && value !== null;
}

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [c, s, courseRes] = await Promise.all([
        adminCertificateApi.list(),
        adminApi.getStudents(),
        publicCourseApi.list(),
      ]);
      setCertificates(c.data);
      setStudents(s.data);
      setCourses(courseRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const courseMap = useMemo(() => new Map(courses.map((c) => [c._id, c])), [courses]);

  // Build a list of (student, course) pairs that don't yet have a certificate.
  // Backend is the source of truth for enrollment ids; we ask the student dashboard
  // via /admin/students which doesn't return enrollments. So instead the admin
  // certificates page accepts an enrollment id directly via a paste-or-pick UI.
  // For convenience, expose existing certificates' enrollment ids to avoid duplicates
  // and let admin click any pending enrollment from the most recent students.
  //
  // Simpler approach: load all enrollments via the student detail. For Phase 6 scope,
  // we keep the picker minimal: admin enters the enrollment ID. UX upgrade in future.

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((c) => {
      const stu = isRef<CertificateStudentRef>(c.studentId) ? c.studentId : null;
      const crs = isRef<CertificateCourseRef>(c.courseId) ? c.courseId : null;
      return [
        c.certificateNumber,
        stu?.fullName ?? "",
        stu?.registrationId ?? "",
        crs?.title ?? "",
      ]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [search, certificates]);

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEnrollment) {
      setFormError("Pick an enrollment");
      return;
    }
    setGenerating(true);
    setFormError(null);
    try {
      await adminCertificateApi.create(selectedEnrollment);
      setModalOpen(false);
      setSelectedEnrollment("");
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`Delete certificate ${cert.certificateNumber}? (PDF stays on Cloudinary)`)) return;
    try {
      await adminCertificateApi.remove(cert._id);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Delete failed");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
              <Award size={14} />
              Certificates
            </div>
            <h1 className="text-3xl font-black tracking-tight">Issued Certificates.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Generate new and review the catalog
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold focus:outline-none focus:border-theme-soft/50 transition-all w-56"
              />
            </div>
            <button
              onClick={() => {
                setSelectedEnrollment("");
                setFormError(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/10"
            >
              <Plus size={16} />
              Generate
            </button>
          </div>
        </div>

        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/10 via-white/5 to-theme-accent/10 rounded-[32px] blur-md opacity-40" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden">
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="text-theme-soft animate-spin" size={32} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Award className="text-white/20 mx-auto mb-4" size={36} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                  {certificates.length === 0 ? "No certificates issued yet" : "No matches"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Cert No.</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Student</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Course / Institute</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Issued</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((c) => {
                      const stu = isRef<CertificateStudentRef>(c.studentId) ? c.studentId : null;
                      const crs = isRef<CertificateCourseRef>(c.courseId) ? c.courseId : null;
                      const inst = isRef<CertificateInstituteRef>(c.instituteId) ? c.instituteId : null;
                      const issuer = isRef<CertificateIssuerRef>(c.issuedByAdminId) ? c.issuedByAdminId : null;

                      return (
                        <tr key={c._id} className="hover:bg-white/[0.02] transition-colors group/row">
                          <td className="px-6 py-4">
                            <p className="text-[11px] font-black uppercase tracking-widest text-theme-soft flex items-center gap-1.5">
                              <Hash size={11} />
                              {c.certificateNumber}
                            </p>
                            {issuer && (
                              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                                by {issuer.userId}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {stu ? (
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-white/5 shrink-0">
                                  <img src={stu.photoUrl} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-black uppercase tracking-wide">{stu.fullName}</p>
                                  <p className="text-[10px] font-bold text-white/30 mt-0.5">{stu.registrationId}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white/30">—</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                            <p>{crs?.title ?? "—"}</p>
                            {inst && <p className="text-white/30 mt-1">{inst.code}</p>}
                          </td>
                          <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                            {new Date(c.issuedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <a
                                href={c.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                                title="View PDF"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <a
                                href={c.pdfUrl}
                                download={`${c.certificateNumber}.pdf`}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                                title="Download"
                              >
                                <Download size={14} />
                              </a>
                              <button
                                onClick={() => handleDelete(c)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <GenerateModal
          students={students}
          courseMap={courseMap}
          existingCertificateEnrollmentIds={new Set(certificates.map((c) => c.enrollmentId))}
          onClose={() => setModalOpen(false)}
          onConfirm={handleGenerate}
          selectedEnrollment={selectedEnrollment}
          setSelectedEnrollment={setSelectedEnrollment}
          generating={generating}
          formError={formError}
        />
      )}
    </div>
  );
}

interface GenerateModalProps {
  students: Student[];
  courseMap: Map<string, Course>;
  existingCertificateEnrollmentIds: Set<string>;
  onClose: () => void;
  onConfirm: (e: FormEvent<HTMLFormElement>) => void;
  selectedEnrollment: string;
  setSelectedEnrollment: (v: string) => void;
  generating: boolean;
  formError: string | null;
}

function GenerateModal({
  students,
  onClose,
  onConfirm,
  selectedEnrollment,
  setSelectedEnrollment,
  generating,
  formError,
}: GenerateModalProps) {
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [enrollmentChoices, setEnrollmentChoices] = useState<EnrollmentChoice[]>([]);
  const [loadingChoices, setLoadingChoices] = useState(false);

  useEffect(() => {
    if (!pickedStudent) {
      setEnrollmentChoices([]);
      return;
    }
    let cancelled = false;
    setLoadingChoices(true);
    (async () => {
      // The /admin/students endpoint doesn't return enrollments; we have to use /students/me
      // shape which is per-student-token. Cheapest path: fall back to letting admin paste
      // the enrollment id. For Phase 6 we keep it simple: pick by raw id.
      // (UX upgrade later when a /admin/students/:id detail endpoint is added.)
      setEnrollmentChoices([]);
      if (!cancelled) setLoadingChoices(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pickedStudent]);

  const approvedStudents = students.filter((s) => s.status === "approved" && !s.banned);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-theme-dark/80 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
            <Award size={24} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">Generate Certificate</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Pick a student, then paste their enrollment ID
          </p>
        </div>

        <form onSubmit={onConfirm} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Student *</label>
            <select
              value={pickedStudent?._id ?? ""}
              onChange={(e) => setPickedStudent(approvedStudents.find((s) => s._id === e.target.value) ?? null)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-theme-dark">Select student…</option>
              {approvedStudents.map((s) => (
                <option key={s._id} value={s._id} className="bg-theme-dark">
                  {s.registrationId} — {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Enrollment ID *</label>
            <input
              type="text"
              value={selectedEnrollment}
              onChange={(e) => setSelectedEnrollment(e.target.value)}
              required
              placeholder="Paste enrollment id from student dashboard or API"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 transition-all font-mono"
            />
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1 mt-1">
              Look it up via GET /api/v1/admin/students or the student's /me response.
            </p>
          </div>

          {loadingChoices && <Loader2 className="animate-spin text-theme-soft mx-auto" size={20} />}
          {enrollmentChoices.length > 0 && (
            <div className="text-[10px] font-bold text-white/40">Choices: {enrollmentChoices.length}</div>
          )}

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Generate &amp; Upload
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
