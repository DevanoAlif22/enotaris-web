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
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/routing/ProtectedRoute";

function App() {
  return (
    <>
      {/* Biarkan SATU ToastContainer di luar <Routes> */}
      <ToastContainer />

      <Routes>
        {/* Public (Auth) */}
        <Route element={<AuthLayout />}>
          <Route path="/forgot-password" element={<ForgotPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected: semua user login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/app" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/app/deed" element={<DeedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/app/requirement/:activityId"
              element={<RequirementPage />}
            />
            <Route path="/app/user" element={<UserPage />} />
            <Route
              path="/app/project-flow/:activityId"
              element={<ActivityFlowPage />}
            />
            <Route
              path="/app/verification-user"
              element={<VerificationUserPage />}
            />
            <Route
              path="/app/project-client-notaris"
              element={<NotarisClientActivityPage />}
            />
          </Route>
        </Route>

        {/* Protected: khusus Notaris (role_id = 3) */}
        <Route element={<ProtectedRoute allow={[3]} />}>
          <Route element={<MainLayout />}>
            <Route
              path="/app/requirement-notaris/:activityId"
              element={<RequirementNotarisPage />}
            />
            <Route
              path="/app/project-notaris"
              element={<NotaryActivityPage />}
            />
          </Route>
        </Route>

        {/* Public lain */}
        <Route path="/tes" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
