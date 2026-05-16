import { Search, ShieldCheck, FileText, Award, CheckCircle2, QrCode, Printer, Download, User, Calendar, BookOpen, MapPin, BadgeCheck, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock Result Data
const mockResult = {
  student: {
    name: "Abdullah Al Mamun",
    fatherName: "Md. Rafiqul Islam",
    motherName: "Mrs. Salma Begum",
    roll: "105842",
    registration: "2024-8541-22",
    session: "2023-2024",
    course: "Web Development & Software Engineering",
    branch: "Central Dhaka Campus",
    image: "/hero-technology1.jpg", // Placeholder
  },
  grades: [
    { subject: "Introduction to Web Tech", marks: 85, grade: "A+" },
    { subject: "Frontend Development (React)", marks: 92, grade: "A+" },
    { subject: "Backend Systems (Node.js)", marks: 78, grade: "A" },
    { subject: "Database Design & SQL", marks: 88, grade: "A+" },
    { subject: "UI/UX Fundamentals", marks: 82, grade: "A+" },
  ],
  summary: {
    gpa: "3.92",
    totalMarks: "425",
    status: "Passed",
    issueDate: "May 10, 2024",
  }
};

export function ResultPage() {
  const [showDetails, setShowResultDetails] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResultDetails(true);
  };

  return (
    <main className="bg-[#F9FBFC] min-h-screen">
      {/* Page Hero */}
      <section className="relative bg-theme-dark pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden no-print">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(#E2B26A 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck size={14} />
            Academic Portal
          </div>
          <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.1] mb-8">
            {showDetails ? "Official Transcript." : "Check your results &"} <br />
            <span className="text-theme-soft italic">{showDetails ? "Academic Performance" : "verify certifications."}</span>
          </h1>
          {!showDetails && (
            <p className="mx-auto max-w-2xl text-lg text-white/60 font-medium">
              Access your official academic performance records and verify the 
              authenticity of your professional certificates.
            </p>
          )}
        </div>
      </section>

      {/* Lookup Section */}
      <section className="-mt-24 relative z-10 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {!showDetails ? (
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
              {/* Result Search Card */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-theme-soft/10 rounded-[48px] blur-3xl opacity-50 pointer-events-none" />
                <div className="relative bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_40px_80px_rgba(27,60,83,0.08)] border border-slate-100">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-dark text-theme-soft">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-theme-dark">Student Result Lookup</h2>
                      <p className="text-slate-500 font-medium text-sm">Enter your credentials to view your marksheets.</p>
                    </div>
                  </div>

                  <form className="grid gap-6" onSubmit={handleSearch}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Roll Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10XXXX"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registration Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 2024-XXXX"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold placeholder:text-slate-300 focus:outline-none focus:border-theme-soft focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Examination Year</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-theme-dark font-bold focus:outline-none focus:border-theme-soft focus:bg-white transition-all appearance-none cursor-pointer">
                          <option>2024</option>
                          <option>2023</option>
                          <option>2022</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="group relative flex items-center justify-center gap-3 w-full bg-theme-dark hover:bg-theme-accent text-theme-soft hover:text-white font-black py-6 rounded-2xl transition-all duration-300 shadow-xl">
                      Search Result
                      <Search size={20} className="transition-transform group-hover:scale-110" />
                    </button>
                  </form>

                  <div className="mt-10 flex items-start gap-4 p-6 rounded-2xl bg-theme-soft/10 border border-theme-soft/20">
                    <CheckCircle2 className="text-theme-accent shrink-0" size={20} />
                    <p className="text-sm text-theme-dark font-medium leading-relaxed">
                      Results are typically published within 15 working days after the final examination. 
                      If your result is not found, please contact your respective branch advisor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Sidebar */}
              <div className="space-y-8 no-print">
                <div className="bg-theme-dark rounded-[40px] p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-theme-soft text-theme-dark mb-6">
                      <Award size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-4">Certificate <br />Verification</h3>
                    <p className="text-white/50 text-sm font-medium leading-relaxed mb-8">
                      Validate the authenticity of YCSDI professional certificates 
                      using the unique certificate ID.
                    </p>
                    <Link to="/verified-institute" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all">
                      <QrCode size={18} />
                      Verify Now
                    </Link>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-theme-soft/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-theme-dark mb-6">Need Support?</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      If you encounter any issues accessing your records, our support 
                      team is available to assist you.
                    </p>
                    <a href="tel:+8809638349757" className="flex items-center gap-3 text-theme-primary font-black text-sm hover:text-theme-accent transition-colors">
                      Contact Registrar &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Result Details View */
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Back Button */}
              <button 
                onClick={() => setShowResultDetails(false)}
                className="inline-flex items-center gap-2 text-theme-soft font-black text-xs uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors no-print"
              >
                <X size={16} />
                Close Transcript
              </button>

              <div className="bg-white rounded-[40px] shadow-[0_40px_100px_rgba(27,60,83,0.12)] border border-slate-100 overflow-hidden printable-area">
                {/* Header Branding */}
                <div className="bg-theme-dark p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-theme-soft text-sm font-black text-theme-dark">YCSDI</span>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Academic Performance Record</h2>
                      <p className="text-theme-soft/60 text-xs font-black uppercase tracking-[0.3em] mt-1">Official Institutional Document</p>
                    </div>
                  </div>
                  <div className="flex gap-4 no-print">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <Printer size={16} />
                      Print
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-theme-soft text-theme-dark text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-theme-soft/20">
                      <Download size={16} />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Student Profile Section */}
                <div className="p-6 sm:p-10 grid md:grid-cols-[180px_1fr] gap-10 border-b border-slate-50">
                  <div className="relative group mx-auto md:mx-0">
                    <div className="absolute -inset-2 bg-theme-soft/20 rounded-[32px] blur-lg opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="relative h-[180px] w-[180px] rounded-[28px] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
                      <img src={mockResult.student.image} alt="Student" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-theme-dark/40 to-transparent" />
                    </div>
                    <div className="absolute -bottom-3 -right-2 h-10 w-10 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                      <BadgeCheck size={20} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Student Name</p>
                      <h3 className="text-lg font-black text-theme-dark">{mockResult.student.name}</h3>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Father's Name</p>
                      <p className="text-base font-bold text-slate-700">{mockResult.student.fatherName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Roll Number</p>
                      <p className="text-base font-black text-theme-accent">{mockResult.student.roll}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Registration</p>
                      <p className="text-base font-black text-theme-accent">{mockResult.student.registration}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Enrolled Course</p>
                      <p className="text-base font-bold text-slate-700 flex items-center gap-2">
                        <BookOpen size={14} className="text-theme-soft" />
                        {mockResult.student.course}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Academic Session</p>
                      <p className="text-base font-bold text-slate-700 flex items-center gap-2">
                        <Calendar size={14} className="text-theme-soft" />
                        {mockResult.student.session}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Marksheet Table */}
                <div className="p-6 sm:p-10 bg-slate-50/50">
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-theme-dark text-theme-soft text-[9px] font-black uppercase tracking-[0.2em]">
                          <th className="px-6 py-4">Subject / Module</th>
                          <th className="px-6 py-4 text-center">Marks</th>
                          <th className="px-6 py-4 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="text-theme-dark text-sm">
                        {mockResult.grades.map((item, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5 font-bold">{item.subject}</td>
                            <td className="px-6 py-3.5 text-center font-black">{item.marks}</td>
                            <td className="px-6 py-3.5 text-right font-black">
                              <span className="inline-block px-3 py-1 rounded-lg bg-theme-primary/5 text-theme-primary">{item.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Final Summary Footer */}
                <div className="p-6 sm:p-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Marks</p>
                      <p className="text-xl font-black text-theme-dark">{mockResult.summary.totalMarks}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Cumulative GPA</p>
                      <p className="text-xl font-black text-theme-accent">{mockResult.summary.gpa}</p>
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Result Status</p>
                      <p className="text-xl font-black text-emerald-600 uppercase italic">{mockResult.summary.status}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <QrCode size={48} className="text-theme-dark opacity-80" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Verify Authenticity</p>
                      <p className="text-[9px] font-bold text-theme-dark">ID: TR-2024-854122</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Seal / Signature Disclaimer */}
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-12 no-print">
                This is a digitally generated transcript. For official purposes, please present the printed 
                version with the authorized signature and institution seal. Issued on {mockResult.summary.issueDate}.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
