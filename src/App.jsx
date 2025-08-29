import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/dashboard/HomePage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import DeedPage from "./pages/dashboard/DeedPage";
import "./App.css";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MainLayout from "./layouts/MainLayout";
import VerifyCodePage from "./pages/auth/VerifyCode";
import UserPage from "./pages/dashboard/UserPage";
import VerificationUserPage from "./pages/dashboard/VerificationUserPage";
import NotaryActivityPage from "./pages/dashboard/NotarisActivityPage";
import NotarisClientActivityPage from "./pages/dashboard/NotarisClientActivityPage";
import ForgotPage from "./pages/auth/ForgotPage";
import RequirementPage from "./pages/dashboard/RequirementPage";
import RequirementNotarisPage from "./pages/dashboard/RequirementNotarisPage";
import ActivityFlowPage from "./pages/dashboard/ActivityFlowPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <>
      <Routes>
        {/* Layout Utama */}
        <Route path="/tes" element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* profil */}
          <Route path="/app/deed" element={<DeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/requirement" element={<RequirementPage />} />
          <Route
            path="/requirement-notaris"
            element={<RequirementNotarisPage />}
          />
          <Route path="/app/user" element={<UserPage />} />
          <Route path="/app/project-notaris" element={<NotaryActivityPage />} />
          <Route path="/app/project-flow" element={<ActivityFlowPage />} />
          <Route
            path="/app/project-client-notaris"
            element={<NotarisClientActivityPage />}
          />
          <Route
            path="/app/verification-user"
            element={<VerificationUserPage />}
          />
        </Route>

        {/* Layout Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/forgot-password" element={<ForgotPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 404 Not Found - harus di paling bawah */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
