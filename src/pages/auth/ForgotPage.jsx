// src/pages/auth/ForgotPage.jsx
import { useState } from "react";
import InputField from "../../components/input/InputField";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";

export default function ForgotPage() {
  const [form, setForm] = useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return showError("Email wajib diisi.");

    try {
      setIsSubmitting(true);
      const res = await authService.forgot({ email: form.email });
      showSuccess(
        res?.message || "Jika email terdaftar, tautan reset telah dikirim."
      );
    } catch (err) {
      showError(err.message || "Gagal mengirim tautan reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center relative overflow-x-auto">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting} />

      <div className="rounded-lg flex w-[450px] md:w-[1000px] overflow-hidden bg-white">
        {/* Left side (sama seperti Register) */}
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
              alt="Forgot Illustration"
              className="w-full object-contain absolute bottom-0"
            />
          </div>
        </div>

        {/* Right side (form) */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center overflow-y-auto h-[85vh]">
          <h1 className="text-[26px] text-center font-bold mb-2 mt-[50px]">
            Lupa Kata Sandi
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Kami akan mengirimkan tautan reset kata sandi ke email Anda.
          </p>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-[40px] w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
