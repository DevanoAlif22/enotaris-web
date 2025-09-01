import { useState } from "react";
import InputField from "../../components/input/InputField";
import { showSuccess, showError } from "../../utils/toastConfig";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const afterLoginRoute = (role_id) => {
    // Silakan sesuaikan mapping route setelah login
    if (role_id === 3) return "/app/project-notaris"; // Notaris
    return "/app"; // Penghadap/user
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.email.trim() === "" || form.password.trim() === "") {
      showError("Email dan password wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.login(form);
      showSuccess(res?.message || "Login berhasil! Selamat datang kembali!");
      const roleId = res?.data?.role_id;
      navigate(afterLoginRoute(roleId), { replace: true });
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center relative">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting} />

      <div className="rounded-lg flex w-full max-w-5xl overflow-hidden bg-white">
        {/* Left side */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0256c4] flex-col justify-center items-center text-white">
          <div className="flex flex-col items-center mb-6">
            <img src="/images/logo-enotaris.png" alt="Logo" className="w-50" />
            <h2 className="text-xl font-semibold text-center">
              Membangun Pasti di Atas Janji
            </h2>
          </div>
          <img
            src="/images/team-photo.png"
            alt="Login Illustration"
            className="w-full"
          />
        </div>

        {/* Right side */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
          <h1 className="text-[30px] text-center font-bold mb-2">
            Selamat datang kembali!
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Masukkan detail Anda.
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

            <InputField
              label="Kata Sandi"
              type="password"
              name="password"
              placeholder="Masukkan kata sandi"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            {/* Forgot password */}
            <div className="flex justify-end mb-6">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition"
            >
              Masuk
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              className="text-blue-600 font-medium hover:underline"
              to="/register"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
