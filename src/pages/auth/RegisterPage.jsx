import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/input/InputField";
import CheckCardGroup from "../../components/input/CheckCardGroup";
import { ScaleIcon, UserIcon } from "@heroicons/react/24/outline";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [registerObj, setRegisterObj] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // "notaris" | "klien"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
      // Arahkan ke halaman verifikasi dengan prefill email
      navigate("/verify-code", {
        state: { email: registerObj.email },
        replace: true,
      });
    } catch (err) {
      if (err?.errors) {
        // Ambil error pertama yang paling relevan
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else {
        showError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center relative overflow-x-auto">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting} />

      <div className="rounded-lg flex w-full max-w-5xl overflow-hidden bg-white">
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
          <h1 className="text-[26px] text-center font-bold mb-2 mt-[150px]">
            Selamat datang!
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Masukkan detail Anda.
          </p>

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
                },
                {
                  name: "Klien",
                  value: "klien",
                  icon: <UserIcon className="w-6 h-6" />,
                },
              ]}
              defaultValue={registerObj.role}
              updateType="role"
              updateFormValue={updateFormValue}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Daftar"}
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
