import {
  Ban,
  Building2,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Lock,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  Undo2,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  adminApi,
  instituteApi,
  publicCourseApi,
  type AdminStudentUpdatePayload,
  type ApprovalPayload,
  type Course,
  type Institute,
  type Student,
} from "../../services/api";

type FilterValue = "all" | "pending" | "approved" | "rejected";

interface ApprovalFormState {
  userId: string;
  password: string;
  instituteId: string;
  session: string;
  courseIds: string[];
}

function buildEmptyApproval(prefillUserId: string): ApprovalFormState {
  return {
    userId: prefillUserId,
    password: "",
    instituteId: "",
    session: "",
    courseIds: [],
  };
}

interface EditFormState {
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  postOffice: string;
  upazilla: string;
  district: string;
  nidPassport: string;
  mobileNumber: string;
  email: string;
  message: string;
}

function studentToEditForm(s: Student): EditFormState {
  return {
    fullName: s.fullName,
    fatherName: s.fatherName,
    motherName: s.motherName,
    gender: s.gender,
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
    postOffice: s.postOffice,
    upazilla: s.upazilla,
    district: s.district,
    nidPassport: s.nidPassport ?? "",
    mobileNumber: s.mobileNumber,
    email: s.email ?? "",
    message: s.message ?? "",
  };
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [approval, setApproval] = useState<ApprovalFormState>(buildEmptyApproval(""));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!editStudent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditStudent(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editStudent]);

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, i, c] = await Promise.all([
        adminApi.getStudents(),
        instituteApi.list(),
        publicCourseApi.list(),
      ]);
      setStudents(s.data);
      setInstitutes(i.data);
      setCourses(c.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (student: Student) => {
    setSelectedStudent(student);
    const prefilled = buildEmptyApproval(student.registrationId);
    if (student.preferredInstituteId?._id) prefilled.instituteId = student.preferredInstituteId._id;
    if (student.preferredCourseId?._id) prefilled.courseIds = [student.preferredCourseId._id];
    setApproval(prefilled);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditStudent(student);
    setEditForm(studentToEditForm(student));
    setEditError(null);
  };

  const handleEditSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editStudent || !editForm) return;
    setSavingEdit(true);
    setEditError(null);
    const payload: AdminStudentUpdatePayload = {
      fullName: editForm.fullName,
      fatherName: editForm.fatherName,
      motherName: editForm.motherName,
      gender: editForm.gender,
      dateOfBirth: editForm.dateOfBirth || undefined,
      postOffice: editForm.postOffice,
      upazilla: editForm.upazilla,
      district: editForm.district,
      nidPassport: editForm.nidPassport || undefined,
      mobileNumber: editForm.mobileNumber,
      email: editForm.email || undefined,
      message: editForm.message || undefined,
    };
    try {
      await adminApi.patchStudent(editStudent._id, payload);
      setEditStudent(null);
      setEditForm(null);
      await loadAll();
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleCourse = (id: string) => {
    setApproval((a) => ({
      ...a,
      courseIds: a.courseIds.includes(id) ? a.courseIds.filter((x) => x !== id) : [...a.courseIds, id],
    }));
  };

  const handleApproveSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!approval.instituteId) {
      setError("Select an institute");
      return;
    }
    if (approval.courseIds.length === 0) {
      setError("Select at least one course");
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const payload: ApprovalPayload = {
        userId: approval.userId,
        password: approval.password,
        instituteId: approval.instituteId,
        session: approval.session || undefined,
        enrollments: approval.courseIds.map((courseId) => ({ courseId })),
      };
      await adminApi.approveStudent(selectedStudent._id, payload);
      setShowModal(false);
      await loadAll();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to approve student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this application?")) return;
    try {
      await adminApi.rejectStudent(id);
      await loadAll();
    } catch (err) {
      console.error("Failed to reject student", err);
    }
  };

  const handleBanToggle = async (student: Student) => {
    const next = !student.banned;
    if (!confirm(next ? `Ban ${student.fullName}? They will lose access immediately and staff won't see them.` : `Unban ${student.fullName}?`)) return;
    try {
      await adminApi.patchStudent(student._id, { banned: next });
      await loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to update ban status");
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Delete ${student.fullName}? This also removes their login, enrollments, and certificates. This cannot be undone.`)) return;
    try {
      await adminApi.deleteStudent(student._id);
      await loadAll();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Delete failed");
    }
  };

  const publishedCourses = courses;

  const filteredStudents = students.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.registrationId.toLowerCase().includes(q) ||
      s.mobileNumber.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-theme-soft animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
              <ShieldCheck size={14} />
              Administrator Control
            </div>
            <h1 className="text-3xl font-black tracking-tight">Student Management.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Review applications, approve with institute &amp; courses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-theme-soft transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-theme-soft/50 transition-all w-64"
              />
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-theme-soft text-theme-dark" : "text-white/40 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/10 via-white/5 to-theme-accent/10 rounded-[32px] blur-md opacity-40" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Student</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Institute &amp; Serial</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Contact</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
                        No students match the current filter
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                              <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase tracking-wide">{student.fullName}</p>
                              <p className="text-[10px] text-white/40 font-bold uppercase">
                                Registered {new Date(student.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.instituteId ? (
                            <p className="text-[10px] font-black text-theme-soft uppercase tracking-widest flex items-center gap-1.5">
                              <Building2 size={11} />
                              {student.instituteId.code}
                            </p>
                          ) : (
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">— Unassigned</p>
                          )}
                          <p className="text-xs font-bold text-white/60 mt-1">{student.registrationId}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white/60">{student.mobileNumber}</p>
                          {student.email && <p className="text-[11px] text-white/30 mt-0.5">{student.email}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                student.status === "approved"
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : student.status === "rejected"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {student.status === "approved" ? (
                                <CheckCircle2 size={10} />
                              ) : student.status === "rejected" ? (
                                <XCircle size={10} />
                              ) : (
                                <Clock size={10} />
                              )}
                              {student.status}
                            </span>
                            {student.banned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-500/20 border-red-500/40 text-red-300">
                                <Ban size={10} />
                                Banned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            {student.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveClick(student)}
                                  className="p-2 rounded-lg bg-theme-soft text-theme-dark hover:bg-white transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleReject(student._id)}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {student.status === "approved" && (
                              <button
                                onClick={() => handleBanToggle(student)}
                                className={`p-2 rounded-lg transition-colors ${
                                  student.banned
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white"
                                    : "bg-white/5 text-white/60 hover:bg-amber-500 hover:text-white"
                                }`}
                                title={student.banned ? "Unban" : "Ban"}
                              >
                                {student.banned ? <Undo2 size={16} /> : <Ban size={16} />}
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(student)}
                              className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                              title="Edit details"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete (cascade)"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-theme-dark/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Approve Student</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                {selectedStudent.fullName} · {selectedStudent.registrationId}
              </p>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1 flex items-center gap-1.5">
                  <Building2 size={11} /> Institute *
                </label>
                <select
                  value={approval.instituteId}
                  onChange={(e) => setApproval({ ...approval, instituteId: e.target.value })}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-theme-dark">Select institute…</option>
                  {institutes.map((i) => (
                    <option key={i._id} value={i._id} className="bg-theme-dark">
                      {i.code} — {i.name}
                    </option>
                  ))}
                </select>
                {institutes.length === 0 && (
                  <p className="text-[10px] font-bold text-amber-400 ml-1 mt-1">No institutes. Create one in Institutes.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1 flex items-center gap-1.5">
                  <BookOpen size={11} /> Enroll in courses *
                </label>
                {publishedCourses.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest text-center">
                    No published courses. Publish one in Courses.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 rounded-xl bg-white/5 border border-white/10">
                    {publishedCourses.map((course) => {
                      const checked = approval.courseIds.includes(course._id);
                      return (
                        <button
                          type="button"
                          key={course._id}
                          onClick={() => toggleCourse(course._id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                            checked
                              ? "bg-theme-soft/10 border-theme-soft/40 text-white"
                              : "bg-white/0 border-white/5 text-white/40 hover:bg-white/5"
                          }`}
                        >
                          <div
                            className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                              checked ? "bg-theme-soft border-theme-soft text-theme-dark" : "border-white/20"
                            }`}
                          >
                            {checked && <CheckCircle2 size={12} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-widest truncate">{course.title}</p>
                            <p className="text-[10px] font-bold text-white/40 truncate">
                              {course.offerPrice ?? course.price} BDT
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Session (applies to all)</label>
                <input
                  type="text"
                  value={approval.session}
                  onChange={(e) => setApproval({ ...approval, session: e.target.value })}
                  placeholder="2025-26 (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-theme-soft/5 border border-theme-soft/20">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Login User ID *</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={approval.userId}
                      onChange={(e) => setApproval({ ...approval, userId: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Password *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={approval.password}
                      onChange={(e) => setApproval({ ...approval, password: e.target.value })}
                      required
                      placeholder="Initial password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-3.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || institutes.length === 0 || publishedCourses.length === 0}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {editStudent && editForm && (
        <div onClick={() => setEditStudent(null)} className="fixed inset-0 z-50 overflow-y-auto bg-theme-dark/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-theme-dark border border-white/10 rounded-[32px] p-8 pt-16 shadow-2xl my-8">
              <button
                onClick={() => setEditStudent(null)}
                aria-label="Close"
                className="absolute top-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-xl bg-white/10 border border-white/10 text-white/70 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                  <img src={editStudent.photoUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Edit Student</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">
                    {editStudent.fullName} · {editStudent.registrationId}
                  </p>
                </div>
              </div>

              <form onSubmit={handleEditSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <EditField label="Full Name *" value={editForm.fullName} onChange={(v) => setEditForm({ ...editForm, fullName: v })} required />
                  <EditField label="Father's Name *" value={editForm.fatherName} onChange={(v) => setEditForm({ ...editForm, fatherName: v })} required />
                  <EditField label="Mother's Name *" value={editForm.motherName} onChange={(v) => setEditForm({ ...editForm, motherName: v })} required />
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Gender *</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as "male" | "female" | "other" })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="male" className="bg-theme-dark">Male</option>
                      <option value="female" className="bg-theme-dark">Female</option>
                      <option value="other" className="bg-theme-dark">Other</option>
                    </select>
                  </div>
                  <EditField label="Date of Birth *" type="date" value={editForm.dateOfBirth} onChange={(v) => setEditForm({ ...editForm, dateOfBirth: v })} required />
                  <EditField label="NID / Passport" value={editForm.nidPassport} onChange={(v) => setEditForm({ ...editForm, nidPassport: v })} />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <EditField label="Post Office *" value={editForm.postOffice} onChange={(v) => setEditForm({ ...editForm, postOffice: v })} required />
                  <EditField label="Upazilla *" value={editForm.upazilla} onChange={(v) => setEditForm({ ...editForm, upazilla: v })} required />
                  <EditField label="District *" value={editForm.district} onChange={(v) => setEditForm({ ...editForm, district: v })} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <EditField label="Mobile *" value={editForm.mobileNumber} onChange={(v) => setEditForm({ ...editForm, mobileNumber: v })} required />
                  <EditField label="Email" type="email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Message</label>
                  <textarea
                    value={editForm.message}
                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 transition-all resize-none"
                  />
                </div>

                {editError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditStudent(null)}
                    className="py-3.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                  >
                    {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}

function EditField({ label, value, onChange, required, type = "text" }: EditFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all ${type === "date" ? "[color-scheme:dark]" : ""}`}
      />
    </div>
  );
}
