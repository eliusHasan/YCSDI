import { 
  User, Mail, Phone, BookOpen, UserPlus, CheckCircle2, 
  ShieldCheck, ArrowLeft, ArrowRight, Calendar, 
  MapPin, IdCard, MessageSquare, Upload, Users, 
  GraduationCap, Clock, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";
import { studentApi } from "../../services/api";

const benefits = [
  "Industry-leading curriculum",
  "Professional certifications",
  "Career & placement support",
  "Project-based learning"
];

export function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected:", file.name, file.size, file.type);
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submission started");
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    if (photo) {
      formData.set('photo', photo);
      console.log("Photo added to formData:", photo.name);
    } else {
      console.log("Photo missing from state");
      setMessage({ type: 'error', text: 'Please upload a photo' });
      setLoading(false);
      return;
    }

    try {
      console.log("Sending request to backend...");
      const response = await studentApi.register(formData);
      console.log("Response received:", response.data);
      setMessage({ type: 'success', text: response.data.message });
      (e.target as HTMLFormElement).reset();
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error: any) {
      console.error("Registration error:", error);
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

              {/* Course Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <GraduationCap className="text-theme-soft" size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Course Information</h2>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Select Course *</label>
                    <div className="relative group/input">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <select 
                        name="course"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all appearance-none cursor-pointer" required>
                        <option value="" className="bg-theme-dark">Select Course</option>
                        <option value="se" className="bg-theme-dark">Software Engineering</option>
                        <option value="cd" className="bg-theme-dark">Creative Design</option>
                        <option value="dm" className="bg-theme-dark">Digital Marketing</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Session</label>
                    <div className="relative group/input">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="session"
                        placeholder="Write Session (e.g. 2024-25)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Course Duration *</label>
                    <div className="relative group/input">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <select 
                        name="courseDuration"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all appearance-none cursor-pointer" required>
                        <option value="" className="bg-theme-dark">Select Duration</option>
                        <option value="3m" className="bg-theme-dark">3 Months</option>
                        <option value="6m" className="bg-theme-dark">6 Months</option>
                        <option value="1y" className="bg-theme-dark">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">NID / Passport Number</label>
                    <div className="relative group/input">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                      <input 
                        type="text" 
                        name="nidPassport"
                        placeholder="NID or Passport Number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-theme-soft/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                    </div>
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
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
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
    </main>
  );
}