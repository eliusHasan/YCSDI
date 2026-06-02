import {
  User, Mail, Phone, UserPlus, ArrowLeft, ArrowRight, Calendar,
  MapPin, IdCard, MessageSquare, Upload, Users, Loader2, BookOpen, Building2, GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { publicCourseApi, publicInstituteApi, studentApi, type Course, type PublicInstitute } from "../../services/api";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { PhotoCropModal } from "../../components/ui/PhotoCropModal";

export function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutes, setInstitutes] = useState<PublicInstitute[]>([]);
  const [courseId, setCourseId] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    publicCourseApi.list().then((r) => setCourses(r.data)).catch(() => {});
    publicInstituteApi.list().then((r) => setInstitutes(r.data)).catch(() => {});
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropSrc(URL.createObjectURL(file));
    }
    // Reset so re-selecting the same file still fires onChange.
    e.target.value = "";
  };

  const handleCropConfirm = (blob: Blob) => {
    const file = new File([blob], "passport-photo.jpg", { type: "image/jpeg" });
    setPhoto(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!courseId) {
      setMessage({ type: 'error', text: 'Please select a desired course' });
      return;
    }
    if (!instituteId) {
      setMessage({ type: 'error', text: 'Please select an institute' });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (photo) {
      formData.set('photo', photo);
    } else {
      setMessage({ type: 'error', text: 'Please upload a photo' });
      setLoading(false);
      return;
    }

    try {
      const response = await studentApi.register(formData);
      setMessage({ type: 'success', text: response.data.message });
      (e.target as HTMLFormElement).reset();
      setPhoto(null);
      setPhotoPreview(null);
      setCourseId("");
      setInstituteId("");
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center py-10 px-4 overflow-hidden bg-theme-dark">
      {/* High-Impact Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-theme-accent/10 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-theme-soft/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Navigation / Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-theme-soft font-black text-[10px] uppercase tracking-[0.3em] mb-6 hover:text-white transition-colors group">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          
          <div className="flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[9px] font-black uppercase tracking-widest mb-3">
              <UserPlus size={12} />
              Admission Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Student Registration.</h1>
          </div>
        </div>

        {/* Glassmorphism Registration Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/20 via-white/5 to-theme-accent/20 rounded-[32px] blur-md opacity-40 group-hover:opacity-100 transition duration-700" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl overflow-hidden">
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} text-xs font-bold uppercase tracking-widest text-center`}>
                {message.text}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <User className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Personal Information</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Full Name *</label>
                    <div className="relative group/input">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Father's Name *</label>
                    <div className="relative group/input">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="fatherName"
                        placeholder="Father's Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Mother's Name *</label>
                    <div className="relative group/input">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="motherName"
                        placeholder="Mother's Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Gender *</label>
                      <div className="relative group/input">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                        <select 
                          name="gender"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all appearance-none cursor-pointer" required>
                          <option value="" className="bg-theme-dark">Select Gender</option>
                          <option value="male" className="bg-theme-dark">Male</option>
                          <option value="female" className="bg-theme-dark">Female</option>
                          <option value="other" className="bg-theme-dark">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Date of Birth *</label>
                      <div className="relative group/input">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                        <input 
                          type="date" 
                          name="dateOfBirth"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner [color-scheme:dark]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <GraduationCap className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Program Selection</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Desired Course *</label>
                    <SearchableSelect
                      name="preferredCourseId"
                      value={courseId}
                      onChange={setCourseId}
                      options={courses.map((c) => ({ value: c._id, label: c.title }))}
                      placeholder="Select a course"
                      searchPlaceholder="Search course by name…"
                      emptyText="No courses found"
                      icon={BookOpen}
                    />
                    {courses.length === 0 && (
                      <p className="text-[9px] font-bold text-white/30 ml-1 mt-1">No courses available right now.</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Institute / Branch *</label>
                    <SearchableSelect
                      name="preferredInstituteId"
                      value={instituteId}
                      onChange={setInstituteId}
                      options={institutes.map((i) => ({ value: i._id, label: `${i.code} — ${i.name}` }))}
                      placeholder="Select an institute"
                      searchPlaceholder="Search by code or name…"
                      emptyText="No institutes found"
                      icon={Building2}
                    />
                    {institutes.length === 0 && (
                      <p className="text-[9px] font-bold text-white/30 ml-1 mt-1">No institutes available right now.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Identification (NID / Passport) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <IdCard className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Identification</h2>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">NID / Passport Number</label>
                  <div className="relative group/input">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                    <input
                      type="text"
                      name="nidPassport"
                      placeholder="NID or Passport Number (optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <MapPin className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Address Details</h2>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Post Office *</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="postOffice"
                        placeholder="Post Office"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Upazilla / Thana *</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="upazilla"
                        placeholder="Upazilla/Thana"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">District *</label>
                    <div className="relative group/input">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="district"
                        placeholder="District"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Phone className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Contact Information</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Mobile Number *</label>
                    <div className="relative group/input">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="tel" 
                        name="mobileNumber"
                        placeholder="Mobile Number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Email Address</label>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Email Address (Optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Message</label>
                  <div className="relative group/input">
                    <MessageSquare className="absolute left-4 top-4 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                    <textarea 
                      name="message"
                      placeholder="Message (Optional)"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Upload className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Documents</h2>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Passport Size Photo *</label>
                  <div className="relative group/file">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-theme-soft/50 transition-all overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="text-white/20 mb-2 group-hover/file:text-theme-soft transition-colors" size={24} />
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Click to upload photo</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        name="photo"
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        required={false}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="group relative flex items-center justify-center gap-3 w-full bg-theme-soft hover:bg-white text-theme-dark font-black py-4.5 rounded-xl transition-all duration-500 overflow-hidden shadow-xl shadow-theme-soft/10 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">

                <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-widest">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:text-theme-soft transition-all group"
              >
                Already have an account? Sign In
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 text-theme-soft" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {cropSrc && (
        <PhotoCropModal src={cropSrc} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />
      )}
    </main>
  );
}