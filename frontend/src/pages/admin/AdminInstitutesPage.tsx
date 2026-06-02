import {
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { instituteApi, type Institute, type InstitutePayload } from "../../services/api";

const emptyForm: InstitutePayload = {
  name: "",
  code: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
  status: "active",
};

export function AdminInstitutesPage() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Institute | null>(null);
  const [form, setForm] = useState<InstitutePayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await instituteApi.list();
      setInstitutes(data);
      setPageError(null);
    } catch (err: any) {
      setPageError(err.response?.data?.message ?? "Failed to load institutes");
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

  const openEdit = (institute: Institute) => {
    setEditing(institute);
    setForm({
      name: institute.name,
      code: institute.code,
      address: institute.address ?? "",
      contactEmail: institute.contactEmail ?? "",
      contactPhone: institute.contactPhone ?? "",
      status: institute.status,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        await instituteApi.update(editing._id, form);
      } else {
        await instituteApi.create(form);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (institute: Institute) => {
    if (!confirm(`Delete institute "${institute.name}"?`)) return;
    try {
      await instituteApi.remove(institute._id);
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
              <Building2 size={14} />
              Institute Network
            </div>
            <h1 className="text-3xl font-black tracking-tight">Institutes.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Manage branches and learning centers
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/10"
          >
            <Plus size={16} />
            New Institute
          </button>
        </div>

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
            ) : institutes.length === 0 ? (
              <div className="p-16 text-center">
                <Building2 className="text-white/20 mx-auto mb-4" size={36} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No institutes yet</p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Create one to start assigning staff and enrolling students
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Institute</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Contact</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {institutes.map((institute) => (
                      <tr key={institute._id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black uppercase tracking-wide">{institute.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-theme-soft mt-1">{institute.code}</p>
                          {institute.address && (
                            <p className="text-[11px] text-white/40 font-bold mt-1 flex items-center gap-1.5">
                              <MapPin size={11} />
                              {institute.address}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                          {institute.contactEmail && (
                            <p className="flex items-center gap-1.5">
                              <Mail size={11} />
                              {institute.contactEmail}
                            </p>
                          )}
                          {institute.contactPhone && (
                            <p className="flex items-center gap-1.5 mt-1">
                              <Phone size={11} />
                              {institute.contactPhone}
                            </p>
                          )}
                          {!institute.contactEmail && !institute.contactPhone && (
                            <p className="text-white/20">—</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              institute.status === "active"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-white/5 border-white/10 text-white/40"
                            }`}
                          >
                            {institute.status === "active" ? <CheckCircle2 size={10} /> : <X size={10} />}
                            {institute.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(institute)}
                              className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(institute)}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-theme-dark/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {editing ? "Edit Institute" : "New Institute"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Name *"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
                placeholder="Dhaka Main Branch"
              />
              <Field
                label="Code *"
                value={form.code}
                onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
                required
                placeholder="DHK-001"
              />
              <Field
                label="Address"
                value={form.address ?? ""}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="Street, area, district"
              />
              <Field
                label="Contact Email"
                value={form.contactEmail ?? ""}
                onChange={(v) => setForm({ ...form, contactEmail: v })}
                type="email"
                placeholder="branch@ycsdi.bd"
              />
              <Field
                label="Contact Phone"
                value={form.contactPhone ?? ""}
                onChange={(v) => setForm({ ...form, contactPhone: v })}
                placeholder="+880 1XXXX XXXXXX"
              />

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
  placeholder?: string;
  type?: string;
}

function Field({ label, value, onChange, required, placeholder, type = "text" }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all"
      />
    </div>
  );
}
