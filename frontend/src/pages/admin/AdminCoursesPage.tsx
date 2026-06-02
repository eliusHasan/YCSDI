import {
  BookOpen,
  CheckCircle2,
  ImageIcon,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { courseApi, type Course, type CourseStatus } from "../../services/api";

interface FormState {
  title: string;
  description: string;
  price: string;
  offerPrice: string;
  duration: string;
  level: string;
  category: string;
  subjects: string[];
  status: CourseStatus;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  offerPrice: "",
  duration: "",
  level: "",
  category: "",
  subjects: [],
  status: "draft",
};

const levels = ["Level 1", "Level 2", "Level 1& 2", "Level 3", "Level 1,2 & 3", "Level 4"];

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await courseApi.list();
      setCourses(data);
      setPageError(null);
    } catch (err: any) {
      setPageError(err.response?.data?.message ?? "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description,
      price: String(course.price),
      offerPrice: course.offerPrice !== undefined ? String(course.offerPrice) : "",
      duration: course.duration ?? "",
      level: course.level ?? "",
      category: course.category ?? "",
      subjects: course.subjects ?? [],
      status: course.status,
    });
    setImageFile(null);
    setImagePreview(course.imageUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addSubject = () => setForm((f) => ({ ...f, subjects: [...f.subjects, ""] }));
  const updateSubject = (index: number, value: string) =>
    setForm((f) => ({ ...f, subjects: f.subjects.map((s, i) => (i === index ? value : s)) }));
  const removeSubject = (index: number) =>
    setForm((f) => ({ ...f, subjects: f.subjects.filter((_, i) => i !== index) }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editing && !imageFile) {
      setFormError("Image is required");
      return;
    }

    setSaving(true);
    setFormError(null);

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", form.price);
    if (form.offerPrice) fd.append("offerPrice", form.offerPrice);
    if (form.duration) fd.append("duration", form.duration);
    if (form.level) fd.append("level", form.level);
    if (form.category) fd.append("category", form.category);
    const cleanedSubjects = form.subjects.map((s) => s.trim()).filter(Boolean);
    fd.append("subjects", JSON.stringify(cleanedSubjects));
    fd.append("status", form.status);
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        await courseApi.update(editing._id, fd);
      } else {
        await courseApi.create(fd);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete course "${course.title}"?`)) return;
    try {
      await courseApi.remove(course._id);
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
              <BookOpen size={14} />
              Catalog
            </div>
            <h1 className="text-3xl font-black tracking-tight">Courses.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">
              Build the public course catalog
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-soft text-theme-dark text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/10"
          >
            <Plus size={16} />
            New Course
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
            ) : courses.length === 0 ? (
              <div className="p-16 text-center">
                <BookOpen className="text-white/20 mx-auto mb-4" size={36} />
                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No courses yet</p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Create one to populate the public catalog
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Course</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Pricing</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Details</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-white/[0.02] transition-colors group/row">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-20 rounded-xl border border-white/10 overflow-hidden bg-white/5 shrink-0">
                              <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black uppercase tracking-wide truncate">{course.title}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">{course.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {course.offerPrice !== undefined ? (
                            <div>
                              <p className="text-sm font-black text-theme-soft">{course.offerPrice} BDT</p>
                              <p className="text-[10px] font-bold text-white/30 line-through">{course.price} BDT</p>
                            </div>
                          ) : (
                            <p className="text-sm font-black">{course.price} BDT</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                          {course.duration && <p>{course.duration}</p>}
                          {course.level && <p className="text-white/40">{course.level}</p>}
                          {course.category && (
                            <p className="text-theme-soft/80 mt-1 flex items-center gap-1.5">
                              <Tag size={10} />
                              {course.category}
                            </p>
                          )}
                          {course.subjects && course.subjects.length > 0 && (
                            <p className="text-white/40 mt-1 flex items-center gap-1.5">
                              <ListChecks size={10} />
                              {course.subjects.length} subject{course.subjects.length > 1 ? "s" : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={course.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(course)}
                              className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-theme-soft hover:text-theme-dark transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(course)}
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
          <div className="relative w-full max-w-2xl bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {editing ? "Edit Course" : "New Course"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">
                  Course Image {editing ? "(optional)" : "*"}
                </label>
                <label className="block w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-theme-soft/50 cursor-pointer overflow-hidden transition-all">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/30">
                      <ImageIcon size={28} className="mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Click to upload image</p>
                      <p className="text-[9px] font-bold text-white/20 mt-1">JPG, PNG, or WEBP</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 ml-1 flex items-center gap-1.5 mt-2">
                    <Upload size={10} />
                    {imageFile ? imageFile.name : "Current image (pick a new one to replace)"}
                  </p>
                )}
              </div>

              <Field
                label="Title *"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                required
                placeholder="Web Development"
              />

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Course overview, what students will learn..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Price (BDT) *"
                  value={form.price}
                  onChange={(v) => setForm({ ...form, price: v })}
                  required
                  type="number"
                  placeholder="6000"
                />
                <Field
                  label="Offer Price (BDT)"
                  value={form.offerPrice}
                  onChange={(v) => setForm({ ...form, offerPrice: v })}
                  type="number"
                  placeholder="Optional discount"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field
                  label="Duration"
                  value={form.duration}
                  onChange={(v) => setForm({ ...form, duration: v })}
                  placeholder="3 Months"
                />
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-theme-dark">—</option>
                    {levels.map((l) => (
                      <option key={l} value={l} className="bg-theme-dark">{l}</option>
                    ))}
                    {form.level && !levels.includes(form.level) && (
                      <option value={form.level} className="bg-theme-dark">{form.level}</option>
                    )}
                  </select>
                </div>
                <Field
                  label="Category"
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  placeholder="Software"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1 flex items-center gap-1.5">
                    <ListChecks size={11} /> Subjects
                  </label>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-theme-soft hover:bg-theme-soft hover:text-theme-dark transition-all"
                  >
                    <Plus size={12} /> Add Subject
                  </button>
                </div>
                {form.subjects.length === 0 ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">
                    No subjects added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {form.subjects.map((subject, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-theme-soft">
                          {i + 1}
                        </span>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => updateSubject(i, e.target.value)}
                          placeholder={`Subject ${i + 1} name`}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubject(i)}
                          className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                          title="Remove subject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-theme-soft/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="draft" className="bg-theme-dark">Draft (hidden from public)</option>
                  <option value="published" className="bg-theme-dark">Published (live on site)</option>
                  <option value="archived" className="bg-theme-dark">Archived</option>
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

function StatusBadge({ status }: { status: CourseStatus }) {
  const map: Record<CourseStatus, { label: string; classes: string }> = {
    draft: { label: "Draft", classes: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
    published: { label: "Published", classes: "bg-green-500/10 border-green-500/20 text-green-400" },
    archived: { label: "Archived", classes: "bg-white/5 border-white/10 text-white/40" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.classes}`}>
      {s.label}
    </span>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, required, type = "text", placeholder }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all"
      />
    </div>
  );
}
