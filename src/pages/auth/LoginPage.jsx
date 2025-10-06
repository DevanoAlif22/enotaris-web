import { useEffect, useRef, useState } from "react";
import InputField from "../../components/input/InputField";
import { showSuccess, showError } from "../../utils/toastConfig";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { authService } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);
  const navigate = useNavigate();

  // ====== GOOGLE LOGIN SETUP ======
  const googleClientId =
    "816117972123-dtf1c0kgiijr673k8p32ji83ajea2dpq.apps.googleusercontent.com";
  const googleInitializedRef = useRef(false);
  const roleRef = useRef("klien");
  const scriptLoadedRef = useRef(false);

  // Lazy-load script Google Identity
  useEffect(() => {
    if (scriptLoadedRef.current) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.head.appendChild(s);
  }, []);

  // Initialize Google (dipanggil ketika user klik tombol Google)
  const ensureGoogleInit = () => {
    if (googleInitializedRef.current) return true;
    if (!window.google || !googleClientId) return false;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      // callback akan dipanggil ketika user pilih akun → kita kirim ke BE
      callback: async (credentialResponse) => {
        const idToken = credentialResponse?.credential;
        if (!idToken) {
          showError("Gagal mendapatkan token Google.");
          setIsGoogleBusy(false);
          return;
        }
        try {
          setIsGoogleBusy(true);
          const res = await authService.loginWithGoogle({
            idToken,
            role: roleRef.current, // "klien" | "notaris"
          });
          showSuccess(res?.message || "Login Google berhasil!");
          const roleId = res?.data?.user?.role_id ?? res?.data?.role_applied;
          navigate(afterLoginRoute(roleId), { replace: true });
        } catch (err) {
          showError(err.message || "Login Google gagal.");
        } finally {
          setIsGoogleBusy(false);
        }
      },
      // optional—biar bisa One Tap / auto prompt
      auto_select: false,
      ux_mode: "popup", // gunakan popup; hindari full redirect di SPA
      use_fedcm_for_prompt: false,
    });

    googleInitializedRef.current = true;
    return true;
  };

  // Trigger login Google untuk role tertentu
  const handleGoogleLogin = async (role = "klien") => {
    roleRef.current = role; // simpan role yang dipilih user
    if (!ensureGoogleInit()) {
      showError(
        !googleClientId
          ? "VITE_GOOGLE_CLIENT_ID belum diset."
          : "Script Google belum siap. Coba lagi sebentar."
      );
      return;
    }
    try {
      setIsGoogleBusy(true);
      // Tampilkan One Tap / pilih akun (kalau One Tap disable, Google akan munculkan account chooser)
      window.google.accounts.id.prompt((notification) => {
        // Kalau user close / dismiss, hentikan loading
        const dismissed =
          notification.getDismissedReason && notification.getDismissedReason();
        if (
          dismissed === "user_cancel" ||
          dismissed === "tap_outside" ||
          dismissed === "credential_returned" // akan ditangani di callback di initialize
        ) {
          setIsGoogleBusy(false);
        }
      });
    } catch (e) {
      console.log(e);
      setIsGoogleBusy(false);
      showError(
        "Tidak bisa membuka popup Google. Periksa blokir popup browser."
      );
    }
  };

  // ====== EMAIL/PASSWORD LOGIN ======
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
    <div className="rounded-lg flex overflow-hidden mx-4 lg:m-5 m-9 sm:m-6">
      {/* overlay loader */}
      <LoadingOverlay show={isSubmitting || isGoogleBusy} />

      {/* Left side */}
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
          className="w-full rounded-xl"
        />
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center">
        <h1 className="text-xl sm:text-2xl lg:text-[30px] text-center font-bold mb-2">
          Selamat datang kembali!
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm sm:text-base">
          Masukkan detail Anda.
        </p>

        {/* Email/password form */}
        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="Masukkan email"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting || isGoogleBusy}
          />

          <InputField
            label="Kata Sandi"
            type="password"
            name="password"
            placeholder="Masukkan kata sandi"
            value={form.password}
            onChange={handleChange}
            disabled={isSubmitting || isGoogleBusy}
          />

          {/* Forgot password */}
          <div className="flex justify-end mb-6">
            <a
              href="/forgot-password"
              className="text-xs sm:text-sm text-blue-600 hover:underline"
            >
              Lupa kata sandi?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isGoogleBusy}
            className="w-full bg-[#0256c4] text-white rounded-full py-2 sm:py-3 text-sm sm:text-lg font-semibold hover:bg-blue-700 transition"
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

        {/* Google Buttons with role choice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting || isGoogleBusy}
            onClick={() => handleGoogleLogin("klien")}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2 sm:py-3 font-medium hover:bg-gray-50"
            title="Masuk dengan Google sebagai Klien/Penghadap"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="w-5 h-5"
            />
            Google (Klien)
          </button>

          <button
            type="button"
            disabled={isSubmitting || isGoogleBusy}
            onClick={() => handleGoogleLogin("notaris")}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2 sm:py-3 font-medium hover:bg-gray-50"
            title="Masuk dengan Google sebagai Notaris"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="w-5 h-5"
            />
            Google (Notaris)
          </button>
        </div>

        {/* Register link */}
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
