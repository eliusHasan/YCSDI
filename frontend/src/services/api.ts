import axios from "axios";
import { clearAuthSession, getAuthToken, type AuthUser } from "../stores/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  },
);

export interface Institute {
  _id: string;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface StaffInstituteRef {
  _id: string;
  name: string;
  code: string;
}

export interface StaffUserRef {
  _id: string;
  userId: string;
  role: "staff";
}

export interface Staff {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  instituteIds: StaffInstituteRef[];
  userId?: StaffUserRef;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface InstitutePayload {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: "active" | "inactive";
}

export interface StaffCreatePayload {
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  instituteIds: string[];
  status?: "active" | "inactive";
  userId: string;
  password: string;
}

export interface StaffUpdatePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  instituteIds?: string[];
  status?: "active" | "inactive";
}

export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: number;
  offerPrice?: number;
  duration?: string;
  level?: string;
  category?: string;
  subjects?: string[];
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = "pending" | "approved" | "rejected";

export interface StudentInstituteRef {
  _id: string;
  name: string;
  code: string;
}

export interface StudentUserRef {
  _id: string;
  userId: string;
  role: "student";
}

export interface Student {
  _id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  postOffice: string;
  upazilla: string;
  district: string;
  nidPassport?: string;
  mobileNumber: string;
  email?: string;
  message?: string;
  photoUrl: string;
  status: StudentStatus;
  registrationId: string;
  instituteId?: StudentInstituteRef;
  preferredInstituteId?: StudentInstituteRef;
  preferredCourseId?: { _id: string; title: string; slug: string };
  userId?: StudentUserRef;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface EnrollmentCourseRef {
  _id: string;
  title: string;
  slug: string;
  imageUrl: string;
  duration?: string;
  level?: string;
  category?: string;
}

export interface Enrollment {
  _id: string;
  studentId: string;
  courseId: EnrollmentCourseRef;
  instituteId: string;
  session?: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentMeResponse {
  student: Student;
  enrollments: Enrollment[];
  certificates: Certificate[];
}

export interface ApprovalEnrollmentInput {
  courseId: string;
}

export interface ApprovalPayload {
  userId: string;
  password: string;
  instituteId: string;
  session?: string;
  enrollments: ApprovalEnrollmentInput[];
}

export interface StaffStudentDetailResponse {
  student: Student;
  enrollments: Enrollment[];
  certificates: Certificate[];
}

export interface StaffStudentUpdatePayload {
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  postOffice?: string;
  upazilla?: string;
  district?: string;
  nidPassport?: string;
  mobileNumber?: string;
  email?: string;
  message?: string;
}

export interface CertificateStudentRef {
  _id: string;
  fullName: string;
  registrationId: string;
  photoUrl: string;
}

export interface CertificateCourseRef {
  _id: string;
  title: string;
  slug: string;
}

export interface CertificateInstituteRef {
  _id: string;
  name: string;
  code: string;
}

export interface CertificateIssuerRef {
  _id: string;
  userId: string;
}

export interface Certificate {
  _id: string;
  enrollmentId: string;
  studentId: CertificateStudentRef | string;
  courseId: CertificateCourseRef | string;
  instituteId: CertificateInstituteRef | string;
  certificateNumber: string;
  issuedByAdminId: CertificateIssuerRef | string;
  issuedAt: string;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStudentUpdatePayload {
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  postOffice?: string;
  upazilla?: string;
  district?: string;
  nidPassport?: string;
  mobileNumber?: string;
  email?: string;
  message?: string;
  status?: StudentStatus;
  banned?: boolean;
}

export const authApi = {
  login: (userId: string, password: string) =>
    api.post<{ token: string; user: AuthUser }>("/auth/login", { userId, password }),
  me: () => api.get<{ user: AuthUser }>("/auth/me"),
};

export const studentApi = {
  register: (formData: FormData) => api.post("/students/register", formData),
  me: () => api.get<StudentMeResponse>("/students/me"),
};

export const adminApi = {
  getStudents: () => api.get<Student[]>("/admin/students"),
  approveStudent: (studentId: string, payload: ApprovalPayload) =>
    api.post(`/admin/students/${studentId}/approve`, payload),
  rejectStudent: (studentId: string) => api.post(`/admin/students/${studentId}/reject`),
  patchStudent: (studentId: string, payload: AdminStudentUpdatePayload) =>
    api.patch<Student>(`/admin/students/${studentId}`, payload),
  deleteStudent: (studentId: string) =>
    api.delete<{ message: string }>(`/admin/students/${studentId}`),
};

export const adminCertificateApi = {
  list: () => api.get<Certificate[]>("/admin/certificates"),
  create: (enrollmentId: string) =>
    api.post<Certificate>("/admin/certificates", { enrollmentId }),
  remove: (id: string) => api.delete<{ message: string }>(`/admin/certificates/${id}`),
};

export const instituteApi = {
  list: () => api.get<Institute[]>("/admin/institutes"),
  get: (id: string) => api.get<Institute>(`/admin/institutes/${id}`),
  create: (data: InstitutePayload) => api.post<Institute>("/admin/institutes", data),
  update: (id: string, data: Partial<InstitutePayload>) =>
    api.patch<Institute>(`/admin/institutes/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/admin/institutes/${id}`),
};

export const staffApi = {
  list: () => api.get<Staff[]>("/admin/staff"),
  get: (id: string) => api.get<Staff>(`/admin/staff/${id}`),
  create: (data: StaffCreatePayload) => api.post<Staff>("/admin/staff", data),
  update: (id: string, data: StaffUpdatePayload) => api.patch<Staff>(`/admin/staff/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/admin/staff/${id}`),
};

export const courseApi = {
  list: () => api.get<Course[]>("/admin/courses"),
  get: (id: string) => api.get<Course>(`/admin/courses/${id}`),
  create: (formData: FormData) => api.post<Course>("/admin/courses", formData),
  update: (id: string, formData: FormData) => api.patch<Course>(`/admin/courses/${id}`, formData),
  remove: (id: string) => api.delete<{ message: string }>(`/admin/courses/${id}`),
};

export const publicCourseApi = {
  list: () => api.get<Course[]>("/public/courses"),
  getBySlug: (slug: string) => api.get<Course>(`/public/courses/${slug}`),
};

export interface PublicInstitute {
  _id: string;
  name: string;
  code: string;
}

export const publicInstituteApi = {
  list: () => api.get<PublicInstitute[]>("/public/institutes"),
};

export const staffStudentApi = {
  list: () => api.get<Student[]>("/staff/students"),
  getBySerial: (serial: string) => api.get<StaffStudentDetailResponse>(`/staff/students/${serial}`),
  patch: (serial: string, payload: StaffStudentUpdatePayload) =>
    api.patch<Student>(`/staff/students/${serial}`, payload),
};
