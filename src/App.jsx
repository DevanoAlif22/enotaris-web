import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/dashboard/HomePage";
import AboutPage from "./pages/AboutPage";
import "./App.css";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MainLayout from "./layouts/MainLayout";
import VerifyCodePage from "./pages/auth/VerifyCode";

function App() {
  return (
    <>
      <Routes>
        {/* Layout Utama */}
        <Route path="/tes" element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Layout Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
