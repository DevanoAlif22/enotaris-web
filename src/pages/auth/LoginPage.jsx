// src/pages/auth/LoginPage.jsx
"use client";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showSuccess, showError } from "../../utils/toastConfig";
import { authService } from "../../services/authService";
import InputField from "../../components/input/InputField";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isBusy, setIsBusy] = useState(false);
  const navigate = useNavigate();

  const afterLoginRoute = (role_id) =>
    role_id === 3 ? "/app/project-notaris" : "/app";

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) return showError("Tidak ada access token dari Google.");

      try {
        setIsBusy(true);
        const res = await authService.loginWithGoogle({ accessToken });
        showSuccess(res?.message || "Login berhasil!");
        const roleId = res?.data?.user?.role_id ?? res?.data?.role_applied;
        navigate(afterLoginRoute(roleId), { replace: true });
      } catch (err) {
        const code = err?.response?.data?.code || err?.code;
        if (code === "ROLE_REQUIRED") {
          // Simpan access_token sementara agar bisa dipakai di Register (opsional)
          try {
            sessionStorage.setItem("pending_google_access_token", accessToken);
          } catch {
            console.warn("gagal menyimpan token di sessionStorage");
          }
          // Redirect ke register dengan pesan
          navigate("/register", {
            replace: true,
            state: {
              notice:
                "Akun Google kamu belum terdaftar. Silakan pilih peran dan lanjutkan pendaftaran.",
            },
          });
        } else {
          showError(
            err?.response?.data?.message || err?.message || "Login gagal."
          );
        }
      } finally {
        setIsBusy(false);
      }
    },
    onError: () => showError("Login Google gagal. Coba lagi."),
    flow: "implicit",
    scope: "openid profile email",
  });

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      return showError("Email dan password wajib diisi.");
    }
    try {
      setIsBusy(true);
      const res = await authService.login(form);
      showSuccess(res?.message || "Login berhasil!");
      navigate(afterLoginRoute(res?.data?.role_id), { replace: true });
    } catch (err) {
      showError(err?.response?.data?.message || err?.message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="rounded-lg flex overflow-hidden mx-4 lg:m-5 m-9 sm:m-6 relative">
      <LoadingOverlay show={isBusy} />

      {/* Left visual */}
      <div className="hidden rounded-xl lg:flex lg:w-1/2 bg-[#0256c4] flex-col justify-center items-center text-white">
        <div className="flex flex-col items-center mb-6">
          <img src="/images/logo-enotaris.png" alt="Logo" className="w-50" />
          <h2 className="text-xl font-semibold text-center">
            Membangun Pasti di Atas Janji
          </h2>
        </div>
        <img
          src="/images/team-photo.png"
          alt="Login Illustration"
          className="w-full rounded-xl mb-[-74px]"
        />
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
        <h1 className="text-xl sm:text-2xl lg:text-[30px] text-center font-bold mb-2 mt-4">
          Selamat datang kembali!
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm sm:text-base">
          Masukkan detail Anda atau lanjutkan dengan Google.
        </p>

        {/* Email/password */}
        <form onSubmit={handleSubmitEmail}>
          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="Masukkan email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isBusy}
          />
          <InputField
            label="Kata Sandi"
            type="password"
            name="password"
            placeholder="Masukkan kata sandi"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isBusy}
          />
          <div className="flex justify-end mb-6">
            <a
              href="/forgot-password"
              className="text-xs sm:text-sm text-blue-600 hover:underline"
            >
              Lupa kata sandi?
            </a>
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-[#0256c4] text-white rounded-full py-2 sm:py-3 text-sm sm:text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            Masuk
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-gray-500 text-sm">atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 1 tombol Google */}
        <button
          type="button"
          disabled={isBusy}
          onClick={() => googleLogin()}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          title="Masuk dengan Google"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt=""
            className="w-5 h-5"
          />
          Masuk dengan Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link
            className="text-blue-600 font-medium hover:underline"
            to="/register"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
