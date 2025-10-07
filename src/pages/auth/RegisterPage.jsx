// src/pages/auth/RegisterPage.jsx
"use client";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InputField from "../../components/input/InputField";
import CheckCardGroup from "../../components/input/CheckCardGroup";
import { ScaleIcon, UserIcon } from "@heroicons/react/24/outline";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const [registerObj, setRegisterObj] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "klien", // default Klien
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location?.state?.notice;

  const updateFormValue = (updateType, value) => {
    setRegisterObj((prev) => ({ ...prev, [updateType]: value }));
  };

  const validate = () => {
    if (!registerObj.name.trim()) return "Nama wajib diisi.";
    if (!registerObj.email.trim()) return "Email wajib diisi.";
    if (!/\S+@\S+\.\S+/.test(registerObj.email))
      return "Format email tidak valid.";
    if (!registerObj.password) return "Kata sandi wajib diisi.";
    if (registerObj.password.length < 6)
      return "Kata sandi minimal 6 karakter.";
    if (!registerObj.confirmPassword)
      return "Konfirmasi kata sandi wajib diisi.";
    if (registerObj.password !== registerObj.confirmPassword)
      return "Konfirmasi kata sandi tidak sama.";
    if (!registerObj.role) return "Peran wajib dipilih (Notaris/Klien).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return showError(msg);

    try {
      setIsSubmitting(true);
      const res = await authService.register(registerObj);
      showSuccess(
        res?.message ||
          "Registrasi berhasil. Silakan cek email untuk kode verifikasi."
      );
      navigate("/verify-code", {
        state: { email: registerObj.email },
        replace: true,
      });
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else {
        showError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const afterLoginRoute = (role_id) =>
    role_id === 3 ? "/app/project-notaris" : "/app";

  const roleIdFromValue = (val) =>
    val === "notaris" ? 3 : val === "klien" ? 2 : 0;

  // useGoogleLogin untuk fallback normal
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) return showError("Tidak ada access token dari Google.");

      const roleId = roleIdFromValue(registerObj.role);
      if (!roleId)
        return showError(
          "Silakan pilih peran (Notaris/Klien) terlebih dahulu."
        );

      try {
        setIsSubmitting(true);
        const res = await authService.loginWithGoogle({
          accessToken,
          roleId,
        });
        showSuccess(res?.message || "Registrasi berhasil!");
        const finalRole = res?.data?.user?.role_id ?? res?.data?.role_applied;
        try {
          sessionStorage.removeItem("pending_google_access_token");
        } catch {
          console.warn("gagal menghapus token di sessionStorage");
        }
        navigate(afterLoginRoute(finalRole), { replace: true });
      } catch (err) {
        showError(
          err?.response?.data?.message ||
            err.message ||
            "Registrasi Google gagal."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => showError("Google auth gagal."),
    flow: "implicit",
    scope: "openid profile email",
  });

  // Handler klik tombol Google di Register:
  // - Jika datang dari Login (ROLE_REQUIRED), coba pakai token yang disimpan.
  // - Jika tidak ada, jalankan flow Google biasa.
  const handleGoogleRegister = async () => {
    const stored = sessionStorage.getItem("pending_google_access_token");
    const roleId = roleIdFromValue(registerObj.role);

    if (!roleId) {
      showError("Silakan pilih peran (Notaris/Klien) terlebih dahulu.");
      return;
    }

    if (stored) {
      // pake token yang sudah ada (pengalaman lebih mulus)
      try {
        setIsSubmitting(true);
        const res = await authService.loginWithGoogle({
          accessToken: stored,
          roleId,
        });
        showSuccess(res?.message || "Registrasi berhasil!");
        const finalRole = res?.data?.user?.role_id ?? res?.data?.role_applied;
        sessionStorage.removeItem("pending_google_access_token");
        navigate(afterLoginRoute(finalRole), { replace: true });
        return;
      } catch (err) {
        // kalau token stored kadaluarsa → fallback ke flow Google normal
        console.log(err);
        sessionStorage.removeItem("pending_google_access_token");
      } finally {
        setIsSubmitting(false);
      }
    }

    // fallback ke flow Google normal
    googleLogin();
  };

  return (
    <div className="flex items-center justify-center relative overflow-x-auto">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting} />

      <div className="rounded-lg flex w-[450px] md:w-[1000px] overflow-hidden bg-white">
        {/* Left Side */}
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
              alt="Register Illustration"
              className="w-full object-contain absolute bottom-0"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center overflow-y-auto h-[85vh]">
          <h1 className="text-[26px] text-center font-bold mb-2 mt-[250px]">
            Selamat datang!
          </h1>
          <p className="text-gray-500 text-center mb-4">
            Masukkan detail Anda.
          </p>

          {notice && (
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 text-sm">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="pb-6">
            <InputField
              label="Nama Lengkap"
              type="text"
              name="name"
              placeholder="Masukkan nama lengkap Anda"
              value={registerObj.name}
              onChange={(e) => updateFormValue("name", e.target.value)}
              disabled={isSubmitting}
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="Masukkan email"
              value={registerObj.email}
              onChange={(e) => updateFormValue("email", e.target.value)}
              disabled={isSubmitting}
            />

            <InputField
              label="Kata Sandi"
              type="password"
              name="password"
              placeholder="Masukkan kata sandi"
              value={registerObj.password}
              onChange={(e) => updateFormValue("password", e.target.value)}
              disabled={isSubmitting}
            />

            <InputField
              label="Konfirmasi Kata Sandi"
              type="password"
              name="confirmPassword"
              placeholder="Masukkan ulang kata sandi"
              value={registerObj.confirmPassword}
              onChange={(e) =>
                updateFormValue("confirmPassword", e.target.value)
              }
              disabled={isSubmitting}
            />

            <CheckCardGroup
              labelDescription="Pilih peran Anda dalam sistem"
              containerStyle="mt-6 text-black"
              options={[
                {
                  name: "Notaris",
                  value: "notaris",
                  icon: <ScaleIcon className="w-6 h-6" />,
                  description: "(Notaris)",
                },
                {
                  name: "Klien",
                  value: "klien",
                  icon: <UserIcon className="w-6 h-6" />,
                  description: "(Klien / Penghadap)",
                },
              ]}
              defaultValue={registerObj.role}
              updateType="role"
              updateFormValue={updateFormValue}
              disabled={isSubmitting}
            />

            {/* Tombol manual register */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Daftar"}
            </button>

            {/* Divider */}
            <div className="my-4 flex items-center">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="px-3 text-gray-500 text-sm">atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Tombol Google */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              title="Daftar dengan Google"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                className="w-5 h-5"
              />
              Daftar dengan Google{" "}
              {registerObj.role === "notaris" ? "(Notaris)" : "(Klien)"}
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              className="text-blue-600 font-medium hover:underline"
              to="/login"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
