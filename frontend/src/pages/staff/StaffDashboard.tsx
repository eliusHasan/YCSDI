import {
  AlertCircle,
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Hash,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  staffStudentApi,
  type Certificate,
  type Enrollment,
  type StaffStudentUpdatePayload,
  type Student,
} from "../../services/api";
import { useAuthStore } from "../../stores/auth";

interface DetailState {
  serial: string;
  student: Student | null;
  enrollments: Enrollment[];
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
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

function studentToFormState(s: Student): EditFormState {
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

export function StaffDashboard() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [detail, setDetail] = useState<DetailState | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    void loadList();
  }, []);

  const loadList = async () => {
    setLoadingList(true);
    try {
      const { data } = await staffStudentApi.list();
      setStudents(data);
      setListError(null);
    } catch (err: any) {
      setListError(err.response?.data?.message ?? "Failed to load students");
    } finally {
      setLoadingList(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.registrationId, s.fullName, s.mobileNumber, s.email ?? ""]
        .some((v) => v.toLowerCase().includes(q)),
    );
  }, [search, students]);

  const openDetail = async (serial: string) => {
    setDetail({ serial, student: null, enrollments: [], certificates: [], loading: true, error: null });
    setEditMode(false);
    setEditForm(null);
    try {
      const { data } = await staffStudentApi.getBySerial(serial);
      setDetail({
        serial,
        student: data.student,
        enrollments: data.enrollments,
        certificates: data.certificates,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setDetail({
        serial,
        student: null,
        enrollments: [],
        certificates: [],
        loading: false,
        error: err.response?.data?.message ?? "Failed to load student",
      });
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const startEdit = () => {
    if (!detail?.student) return;
    setEditForm(studentToFormState(detail.student));
    setEditMode(true);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
    setEditError(null);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!detail?.serial || !editForm) return;
    setSaving(true);
    setEditError(null);

    const payload: StaffStudentUpdatePayload = {
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
      const { data: updated } = await staffStudentApi.patch(detail.serial, payload);
      setDetail((d) => (d ? { ...d, student: updated } : d));
      setStudents((list) => list.map((s) => (s._id === updated._id ? updated : s)));
      setEditMode(false);
      setEditForm(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-theme-dark text-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-soft/10 border border-theme-soft/20 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
              <ShieldCheck size={14} />
              Staff Console
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Student Management.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Signed in as {user?.userId}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-theme-soft/20 to-theme-accent/20 rounded-2xl blur opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4">
            <Search size={18} className="text-white/30 group-focus-within:text-theme-soft transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by serial number, name, phone…"
              className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-sm font-bold placeholder:text-white/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {listError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
            {listError}
          </div>
        )}

        <div className="relative">
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden">
            {loadingList ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="text-theme-soft animate-spin" size={32} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="text-white/20 mx-auto mb-4" size={36} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
                  {students.length === 0 ? "No students at your institutes yet" : "No students match your search"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Student</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Serial</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Institute</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Contact</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((s) => (
                      <tr
                        key={s._id}
                        onClick={() => void openDetail(s.registrationId)}
                        className="hover:bg-white/[0.04] transition-colors group/row cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5 shrink-0">
                              <img src={s.photoUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-wide">{s.fullName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[11px] font-black uppercase tracking-widest text-theme-soft flex items-center gap-1.5">
                            <Hash size={11} />
                            {s.registrationId}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {s.instituteId && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                              <Building2 size={11} />
                              {s.instituteId.code}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                          <p>{s.mobileNumber}</p>
                          {s.email && <p className="text-white/30 mt-0.5">{s.email}</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover/row:text-theme-soft transition-colors">
                            Open →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-theme-dark/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
            <button
              onClick={closeDetail}
              className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {detail.loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="text-theme-soft animate-spin" size={32} />
              </div>
            ) : detail.error || !detail.student ? (
              <div className="py-16 text-center">
                <AlertCircle className="text-red-400 mx-auto mb-3" size={32} />
                <p className="text-red-400 text-sm font-bold uppercase tracking-widest">{detail.error ?? "Not found"}</p>
              </div>
            ) : editMode && editForm ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-3">
                    <Pencil size={20} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Edit Student</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
                    {detail.student.registrationId}
                  </p>
                </div>

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
                    onClick={cancelEdit}
                    className="py-3.5 rounded-xl border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <StudentReadView
                student={detail.student}
                enrollments={detail.enrollments}
                certificates={detail.certificates}
                onEdit={startEdit}
              />
            )}
          </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface StudentReadViewProps {
  student: Student;
  enrollments: Enrollment[];
  certificates: Certificate[];
  onEdit: () => void;
}

function StudentReadView({ student, enrollments, certificates, onEdit }: StudentReadViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="h-24 w-24 rounded-2xl border border-white/10 overflow-hidden bg-white/5 shrink-0">
          <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black uppercase tracking-tight">{student.fullName}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-theme-soft mt-1 flex items-center gap-1.5">
            <Hash size={11} />
            {student.registrationId}
          </p>
          {student.instituteId && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1 flex items-center gap-1.5">
              <Building2 size={11} />
              {student.instituteId.code} — {student.instituteId.name}
            </p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/10"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft mb-3 flex items-center gap-2">
          <UserIcon size={12} /> Personal
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ReadField label="Father" value={student.fatherName} />
          <ReadField label="Mother" value={student.motherName} />
          <ReadField label="Gender" value={student.gender} />
          <ReadField label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
          <ReadField label="NID / Passport" value={student.nidPassport ?? "—"} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft mb-3 flex items-center gap-2">
          <MapPin size={12} /> Address
        </h4>
        <div className="grid sm:grid-cols-3 gap-3">
          <ReadField label="Post Office" value={student.postOffice} />
          <ReadField label="Upazilla" value={student.upazilla} />
          <ReadField label="District" value={student.district} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft mb-3 flex items-center gap-2">
          <Phone size={12} /> Contact
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <ReadField label="Mobile" value={student.mobileNumber} />
          <ReadField label="Email" value={student.email ?? "—"} icon={Mail} />
        </div>
        {student.message && (
          <div className="mt-3">
            <ReadField label="Message" value={student.message} />
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft mb-3 flex items-center gap-2">
          <Award size={12} /> Certificates ({certificates.length})
        </h4>
        {certificates.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
            No certificates issued yet
          </div>
        ) : (
          <div className="grid gap-2">
            {certificates.map((cert) => {
              const course = typeof cert.courseId === "object" ? cert.courseId : null;
              return (
                <div
                  key={cert._id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-theme-soft/20 text-theme-soft shrink-0">
                    <Award size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight truncate">{course?.title ?? "Certificate"}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-theme-soft mt-0.5">
                      {cert.certificateNumber}
                    </p>
                  </div>
                  <a
                    href={cert.pdfUrl}
                    download={`${cert.certificateNumber}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                  >
                    <Download size={12} />
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft mb-3 flex items-center gap-2">
          <BookOpen size={12} /> Enrollments ({enrollments.length})
        </h4>
        {enrollments.length === 0 ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
            No enrollments
          </div>
        ) : (
          <div className="grid gap-3">
            {enrollments.map((e) => (
              <div key={e._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-14 w-20 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <img src={e.courseId.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight truncate">{e.courseId.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {e.session && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {e.session}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full border ${
                      e.status === "active"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : e.status === "completed"
                        ? "bg-theme-soft/10 border-theme-soft/30 text-theme-soft"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReadFieldProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

function ReadField({ label, value, icon: Icon }: ReadFieldProps) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft mb-1 flex items-center gap-1.5">
        {Icon && <Icon size={10} />}
        {label}
      </p>
      <p className="text-xs font-bold break-words">{value}</p>
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
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all"
      />
    </div>
  );
}
