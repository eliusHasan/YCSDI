import { useEffect, useState } from "react";
import { 
  Users, CheckCircle2, XCircle, Clock, 
  ShieldCheck, Search, Filter, ArrowRight,
  User as UserIcon, Lock, Loader2, ExternalLink
} from "lucide-react";
import { adminApi } from "../../services/api";

interface Student {
  _id: string;
  fullName: string;
  registrationId: string;
  course: string;
  mobileNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  photoUrl: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState({ userId: "", password: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminApi.getStudents();
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (student: Student) => {
    setSelectedStudent(student);
    setCredentials({ userId: student.registrationId, password: "password123" });
    setShowModal(true);
    setError(null);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setActionLoading(true);
    setError(null);
    try {
      await adminApi.approveStudent(selectedStudent._id, credentials);
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;
    try {
      await adminApi.rejectStudent(id);
      fetchStudents();
    } catch (err) {
      console.error("Failed to reject student", err);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         s.registrationId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-dark flex items-center justify-center">
        <Loader2 className="text-theme-soft animate-spin" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-theme-dark p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-theme-soft text-[10px] font-black uppercase tracking-widest mb-3">
              <ShieldCheck size={14} />
              Administrator Control
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Student Management.</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-wider mt-1">Review and approve incoming applications</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-theme-soft transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-theme-soft/50 transition-all w-64"
              />
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-theme-soft text-theme-dark' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="relative group overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-theme-soft/10 via-white/5 to-theme-accent/10 rounded-[32px] blur-md opacity-40" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Student</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Course & ID</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Contact</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-soft text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group/row">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                            <img src={student.photoUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase tracking-wide">{student.fullName}</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase">Registered {new Date(student.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-black text-theme-soft uppercase tracking-widest">{student.course}</p>
                        <p className="text-xs font-bold text-white/60">{student.registrationId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-white/60">{student.mobileNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          student.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                          student.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {student.status === 'approved' ? <CheckCircle2 size={10} /> : 
                           student.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          {student.status === 'pending' && (
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
                          <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="View Details">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-theme-dark border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-soft/20 text-theme-soft mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Approve Student</h3>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Setup Login Credentials for {selectedStudent.fullName}</p>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">User ID</label>
                <div className="relative group/input">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={credentials.userId}
                    onChange={(e) => setCredentials({...credentials, userId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-soft ml-1">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-theme-soft transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-theme-soft/50 transition-all"
                    required
                  />
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
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-theme-soft text-theme-dark text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
