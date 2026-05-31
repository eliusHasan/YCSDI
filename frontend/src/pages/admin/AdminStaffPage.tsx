import {
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  instituteApi,
  staffApi,
  type Institute,
  type Staff,
  type StaffCreatePayload,
  type StaffUpdatePayload,
} from "../../services/api";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  instituteIds: string[];
  status: "active" | "inactive";
  userId: string;
  password: string;
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  instituteIds: [],
  status: "active",
  userId: "",
  password: "",
};

export function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, i] = await Promise.all([staffApi.list(), instituteApi.list()]);
      setStaff(s.data);
      setInstitutes(i.data);
      setPageError(null);
    } catch (err: any) {
      setPageError(err.response?.data?.message ?? "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (member: Staff) => {
    setEditing(member);
    setForm({
      fullName: member.fullName,
      email: member.email ?? "",
      phone: member.phone ?? "",
      instituteIds: member.instituteIds.map((i) => i._id),
      status: member.status,
      userId: member.userId?.userId ?? "",
      password: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const toggleInstitute = (id: string) => {
    setForm((f) => ({
      ...f,
      instituteIds: f.instituteIds.includes(id)
        ? f.instituteIds.filter((x) => x !== id)
        : [...f.instituteIds, id],
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.instituteIds.length === 0) {
      setFormError("Assign at least one institute");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        const patch: StaffUpdatePayload = {
          fullName: form.fullName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          instituteIds: form.instituteIds,
          status: form.status,
        };
        await staffApi.update(editing._id, patch);
      } else {
        const payload: StaffCreatePayload = {
          fullName: form.fullName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          instituteIds: form.instituteIds,
          status: form.status,
          userId: form.userId,
          password: form.password,
        };
        await staffApi.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: Staff) => {
    if (!confirm(`Delete staff "${member.fullName}"? Their login account will be removed too.`)) return;
    try {
      await staffApi.remove(member._id);
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
              <ShieldCheck size={14} />
              Staff Roster
            </div>
            <h1 className="text-3xl font-black tracking-tight">Staff.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Manage staff and their institute assignments
            </p>
          </div>

          <button
            onClick={openCreate}
            disabled={institutes.length === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/10 disabled:opacity-50 disabled:cursor-not-allowed"
            title={institutes.length === 0 ? "Create an institute first" : undefined}
          >
            <Plus size={16} />
            New Staff
          </button>
        </div>

        {institutes.length === 0 && !loading && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            Create at least one institute before adding staff.
          </div>
        )}

        {pageError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
            {pageError}
          </div>
        )}

        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/10 via-white/5 to-theme-accent/10 rounded-[32px] blur-md opacity-40" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden">
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="text-theme-soft animate-spin" size={32} />
              </div>
            ) : staff.length === 0 ? (
              <div className="p-16 text-center">
                <UsersRound className="text-white/20 mx-auto mb-4" size={36} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No staff yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Staff</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Institutes</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Login</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staff.map((member) => (
                      <tr key={member._id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black uppercase tracking-wide">{member.fullName}</p>
                          {member.email && (
                            <p className="text-[11px] text-white/40 font-bold mt-1 flex items-center gap-1.5">
                              <Mail size={11} /> {member.email}
                            </p>
                          )}
                          {member.phone && (
                            <p className="text-[11px] text-white/40 font-bold mt-0.5 flex items-center gap-1.5">
                              <Phone size={11} /> {member.phone}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {member.instituteIds.map((i) => (
                              <span
                                key={i._id}
                                className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-theme-soft/10 border border-theme-soft/20 text-theme-soft"
                              >
                                {i.code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                          {member.userId?.userId ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              member.status === "active"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-white/5 border-white/10 text-white/40"
                            }`}
                          >
                            {member.status === "active" ? <CheckCircle2 size={10} /> : <X size={10} />}
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(member)}
                              className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
                <UsersRound size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {editing ? "Edit Staff" : "New Staff"}
              </h3>
              {editing && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-2">
                  Login credentials cannot be edited here
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Full Name *"
                value={form.fullName}
                onChange={(v) => setForm({ ...form, fullName: v })}
                required
                icon={UserIcon}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  type="email"
                  icon={Mail}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  icon={Phone}
                />
              </div>

              {!editing && (
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-theme-soft/5 border border-theme-soft/20">
                  <Field
                    label="Login User ID *"
                    value={form.userId}
                    onChange={(v) => setForm({ ...form, userId: v })}
                    required
                    icon={UserIcon}
                  />
                  <Field
                    label="Password *"
                    value={form.password}
                    onChange={(v) => setForm({ ...form, password: v })}
                    required
                    type="text"
                    icon={Lock}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">
                  Assigned Institutes *
                </label>
                <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-white/5 border border-white/10">
                  {institutes.map((institute) => {
                    const checked = form.instituteIds.includes(institute._id);
                    return (
                      <button
                        type="button"
                        key={institute._id}
                        onClick={() => toggleInstitute(institute._id)}
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
                          <p className="text-[11px] font-black uppercase tracking-widest truncate">{institute.code}</p>
                          <p className="text-[10px] font-bold text-white/40 truncate">{institute.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="active" className="bg-theme-dark">Active</option>
                  <option value="inactive" className="bg-theme-dark">Inactive</option>
                </select>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  {editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

function Field({ label, value, onChange, required, type = "text", icon: Icon }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full bg-white/5 border border-white/10 rounded-xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all`}
        />
      </div>
    </div>
  );
}
