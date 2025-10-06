// src/pages/auth/ResetPasswordPage.jsx
"use client";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import InputField from "../../components/input/InputField";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { authService } from "../../services/authService";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ResetPasswordPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const email = q.get("email") || "";
    const token = q.get("token") || "";
    setForm((f) => ({ ...f, email, token }));
  }, []); // eslint-disable-line

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return showError("Email tidak valid.");
    if (!form.token.trim()) return showError("Token tidak ditemukan/invalid.");
    if (!form.password) return showError("Kata sandi baru wajib diisi.");
    if (form.password.length < 6)
      return showError("Kata sandi minimal 6 karakter.");
    if (form.password !== form.confirmPassword)
      return showError("Konfirmasi kata sandi tidak sama.");

    try {
      setIsSubmitting(true);
      const res = await authService.resetPassword({
        email: form.email,
        token: form.token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      showSuccess(res?.message || "Kata sandi berhasil direset.");
      navigate("/login", { replace: true });
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else {
        showError(err.message || "Gagal reset kata sandi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center relative overflow-x-auto">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting} />

      <div className="rounded-lg flex w-[450px] md:w-[1000px] overflow-hidden bg-white">
        {/* Left side (match Register/Forgot) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0256c4] relative flex-col justify-center items-center text-white">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="flex flex-col items-center mb-6">
              <img
                src="/images/logo-enotaris.png"
                alt="Logo"
                className="w-40 pt-10"
              />
              <h2 className="text-xl font-semibold text-center">
                Membangun Pasti di Atas Janji
              </h2>
            </div>
            <img
              src="/images/team-photo.png"
              alt="Reset Illustration"
              className="w-full object-contain absolute bottom-0"
            />
          </div>
        </div>

        {/* Right side (form) */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center overflow-y-auto h-[85vh]">
          <h1 className="text-[26px] text-center font-bold mb-2 mt-[50px]">
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Masukkan kata sandi baru Anda.
          </p>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled
            />
            <InputField
              label="Kata Sandi Baru"
              type="password"
              name="password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <InputField
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              name="confirmPassword"
              placeholder="Ulangi kata sandi"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Reset Kata Sandi"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Kembali ke{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              halaman login
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
