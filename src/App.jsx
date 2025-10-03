// src/App.jsx
import { Route, Routes } from "react-router-dom";
import LandingHomePage from "./pages/landing/LandingHomePage";
import LandingBlogPage from "./pages/landing/LandingBlogPage";
import LandingAboutPage from "./pages/landing/LandingAboutPage";
import LandingTrackPage from "./pages/landing/LandingTrackPage";
import LandingFeaturePage from "./pages/landing/LandingFeaturePage";
import LandingBlogDetailPage from "./pages/landing/LandingBlogDetailPage";
import HomePage from "./pages/dashboard/HomePage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import DeedPage from "./pages/dashboard/DeedPage";
import "./App.css";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MainLayout from "./layouts/MainLayout";
import LandingLayout from "./layouts/LandingLayout";
import VerifyCodePage from "./pages/auth/VerifyCode";
import UserPage from "./pages/dashboard/UserPage";
import VerificationUserPage from "./pages/dashboard/VerificationUserPage";
import NotaryActivityPage from "./pages/dashboard/NotarisActivityPage";
import AdminActivityPage from "./pages/dashboard/AdminActivityPage";
import NotarisClientActivityPage from "./pages/dashboard/NotarisClientActivityPage";
import DraftPage from "./pages/dashboard/DraftPage";
import ForgotPage from "./pages/auth/ForgotPage";
import RequirementPage from "./pages/dashboard/RequirementPage";
import TemplateEditorPage from "./pages/dashboard/TemplateEditorPage";
import TemplatePage from "./pages/dashboard/TemplatePage";
import RequirementNotarisPage from "./pages/dashboard/RequirementNotarisPage";
import BlogPage from "./pages/dashboard/BlogPage";
import BlogEditorPage from "./pages/dashboard/BlogEditorPage";
import ActivityFlowPage from "./pages/dashboard/ActivityFlowPage";
import CategoryBlogPage from "./pages/dashboard/CategoryBlogPage";
import NotFoundPage from "./pages/NotFoundPage";
import { ToastContainer } from "react-toastify";
import SignPage from "./pages/dashboard/SignPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import TrackPage from "./pages/dashboard/TrackPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import useAOSInit from "./hooks/useAOSinit";
import ScrollToTop from "./components/ScrollToTop";
import PartnerPage from "./pages/dashboard/PartnerPage";
import SettingPage from "./pages/dashboard/SettingPage";

export default function App() {
  useAOSInit(); // init sekali di sini
  return (
    <>
      <ToastContainer />
      <ScrollToTop behavior="smooth" />
      <Routes>
        {/* ================= PUBLIC (Auth) ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/forgot-password" element={<ForgotPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ============ PROTECTED: semua user login (1/2/3) ============ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Common pages for all roles */}
            <Route path="/app" element={<HomePage />} />
            {/* <Route path="/about" element={<AboutPage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/app/calendar" element={<CalendarPage />} />
            <Route path="/app/track" element={<TrackPage />} />

            {/* Flow / Dokumen – akses berdasarkan konteks aktivitas */}
            <Route
              path="/app/requirement/:activityId"
              element={<RequirementPage />}
            />
            <Route
              path="/app/project-flow/:activityId"
              element={<ActivityFlowPage />}
            />
            <Route
              path="/app/project-flow/draft/:activityId"
              element={<DraftPage />}
            />
            <Route
              path="/app/project-flow/:activityId/sign"
              element={<SignPage />}
            />

            {/* ===== ADMIN + NOTARIS (role_id 1 atau 3) ===== */}
            <Route element={<ProtectedRoute allow={[1, 3]} />}>
              <Route path="/app/template" element={<TemplatePage />} />
              <Route
                path="/app/template/new"
                element={<TemplateEditorPage />}
              />
              <Route
                path="/app/template/:id/edit"
                element={<TemplateEditorPage />}
              />
              {/* Akta Otentik untuk Admin & Notaris */}
              <Route path="/app/deed" element={<DeedPage />} />
              {/* Proyek Notaris untuk Admin & Notaris */}
              <Route
                path="/app/project-notaris"
                element={<NotaryActivityPage />}
              />
              <Route
                path="/app/project-admin"
                element={<AdminActivityPage />}
              />
            </Route>

            {/* ===== ADMIN ONLY (role_id 1) ===== */}
            <Route element={<ProtectedRoute allow={[1]} />}>
              <Route path="/app/user" element={<UserPage />} />
              <Route
                path="/app/verification-user"
                element={<VerificationUserPage />}
              />

              {/* blog */}
              <Route path="/app/blog" element={<BlogPage />} />
              <Route path="/app/blog/new" element={<BlogEditorPage />} />
              <Route path="/app/blog/:id/edit" element={<BlogEditorPage />} />

              <Route path="/app/partner" element={<PartnerPage />} />
              <Route path="/app/setting" element={<SettingPage />} />
              <Route path="/app/category-blog" element={<CategoryBlogPage />} />
            </Route>

            {/* ===== NOTARIS ONLY (role_id 3) ===== */}
            <Route element={<ProtectedRoute allow={[3]} />}>
              <Route
                path="/app/requirement-notaris/:activityId"
                element={<RequirementNotarisPage />}
              />
            </Route>

            {/* ===== PENGHADAP (role_id 2) ===== */}
            <Route element={<ProtectedRoute allow={[2]} />}>
              <Route
                path="/app/project-client-notaris"
                element={<NotarisClientActivityPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Public lain */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingHomePage />} />
          <Route path="/blog" element={<LandingBlogPage />} />
          <Route path="/blog/:id" element={<LandingBlogDetailPage />} />
          <Route path="/about" element={<LandingAboutPage />} />
          <Route path="/feature" element={<LandingFeaturePage />} />
          <Route path="/track" element={<LandingTrackPage />} />
        </Route>
      </Routes>
    </>
  );
}
