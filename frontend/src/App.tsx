import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AdminLayout } from "./components/layout/AdminLayout";
import { PublicShell } from "./components/layout/PublicShell";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminDocumentsPage } from "./pages/admin/AdminDocumentsPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminInstitutesPage } from "./pages/admin/AdminInstitutesPage";
import { AdminStaffPage } from "./pages/admin/AdminStaffPage";
import { AboutPage } from "./pages/public/AboutPage";
import { CourseDetailPage } from "./pages/public/CourseDetailPage";
import { CoursesPage } from "./pages/public/CoursesPage";
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { NoticesPage } from "./pages/public/NoticesPage";
import { RegistrationPage } from "./pages/public/RegistrationPage";
import { ResultPage } from "./pages/public/ResultPage";
import { VerifiedInstitutePage } from "./pages/public/VerifiedInstitutePage";
import { VerifyPage } from "./pages/public/VerifyPage";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:serial" element={<VerifyPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/verified-institute" element={<VerifiedInstitutePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin"]}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="students" replace />} />
        <Route path="students" element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="institutes" element={<AdminInstitutesPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
      </Route>

      <Route
        path="/staff"
        element={
          <RequireAuth roles={["staff"]}>
            <StaffDashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/student"
        element={
          <RequireAuth roles={["student"]}>
            <StudentDashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
