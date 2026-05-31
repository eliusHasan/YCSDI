import { Route, Routes } from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { AboutPage } from "./pages/public/AboutPage";
import { CoursesPage } from "./pages/public/CoursesPage";
import { HomePage } from "./pages/public/HomePage";
import { LoginPage } from "./pages/public/LoginPage";
import { NoticesPage } from "./pages/public/NoticesPage";
import { RegistrationPage } from "./pages/public/RegistrationPage";
import { ResultPage } from "./pages/public/ResultPage";
import { VerifiedInstitutePage } from "./pages/public/VerifiedInstitutePage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/verified-institute" element={<VerifiedInstitutePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
