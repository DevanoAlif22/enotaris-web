import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import InputField from "../../components/input/InputField";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { authService } from "../../services/authService";

const RESEND_COOLDOWN = 60; // detik (samakan dengan throttle BE)

export default function VerifyCode() {
  const [form, setForm] = useState({ email: "", code: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Refs untuk UX kecil (auto focus)
  const emailRef = useRef(null);
  const codeRef = useRef(null);

  // Prefill dari query (?email=&code=) atau state (dari Register)
  useEffect(() => {
    const qs = new URLSearchParams(location.search || "");
    const qEmail = (qs.get("email") || "").trim();
    const qCode = (qs.get("code") || "").trim();

    const stateEmail = location?.state?.email || "";

    setForm((prev) => ({
      ...prev,
      email: qEmail || stateEmail || prev.email,
      code: (qCode || prev.code).toUpperCase().slice(0, 7),
    }));
  }, [location.search, location?.state?.email]);

  // Auto focus field yang masih kosong
  useEffect(() => {
    if (!form.email && emailRef.current) emailRef.current.focus();
    else if (!form.code && codeRef.current) codeRef.current.focus();
  }, [form.email, form.code]);

  // Timer untuk cooldown resend
  useEffect(() => {
    if (!cooldownLeft) return;
    const t = setInterval(() => {
      setCooldownLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const resendDisabled = useMemo(
    () => resendLoading || cooldownLeft > 0,
    [resendLoading, cooldownLeft]
  );

  const update = (key, val) =>
    setForm((p) => ({
      ...p,
      [key]: key === "code" ? val.toUpperCase().slice(0, 7) : val,
    }));

  const validate = () => {
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Format email tidak valid.";
    if (!form.code.trim()) return "Kode verifikasi wajib diisi.";
    if (form.code.length < 5) return "Kode verifikasi terlalu pendek.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return showError(msg);

    try {
      setIsSubmitting(true);
      const res = await authService.verify({
        email: form.email,
        kode: form.code,
      });
      showSuccess(res?.message || "Email berhasil diverifikasi.");
      navigate("/login", { replace: true });
    } catch (err) {
      showError(err.message);
      // jika BE mengirim "Kode kadaluarsa. Kode baru telah dikirim", user tinggal cek email lagi
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return showError("Isi email terlebih dahulu.");

    try {
      setResendLoading(true);
      const res = await authService.resendCode({ email: form.email });
      showSuccess(res?.message || "Kode verifikasi dikirim ulang.");
      setCooldownLeft(RESEND_COOLDOWN);
    } catch (err) {
      showError(err.message);
      // coba ambil sisa detik dari pesan BE "Tunggu X detik ..."
      const m = /Tunggu\s+(\d+)\s+detik/i.exec(err.message || "");
      if (m && !Number.isNaN(+m[1])) setCooldownLeft(+m[1]);
    } finally {
      setResendLoading(false);
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
                Verifikasi Akun Anda
              </h2>
            </div>
            <img
              src="/images/team-photo.png"
              alt="Verify Illustration"
              className="w-full object-contain absolute bottom-0"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center overflow-y-auto h-[85vh]">
          <h1 className="text-[28px] text-center font-bold mb-2">
            Verifikasi Akun
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Masukkan <span className="font-semibold">kode verifikasi</span> yang
            kami kirim ke email Anda.
          </p>

          <form onSubmit={handleSubmit} className="pb-6">
            <InputField
              ref={emailRef}
              label="Email"
              type="email"
              name="email"
              placeholder="Masukkan email yang didaftarkan"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={isSubmitting || resendLoading}
            />

            <InputField
              ref={codeRef}
              label="Kode Verifikasi"
              type="text"
              name="code"
              placeholder="Masukkan 7 karakter (huruf/angka)"
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className="text-sm font-medium hover:underline text-purple-600 disabled:opacity-60"
            >
              {resendLoading
                ? "Mengirim ulang..."
                : cooldownLeft > 0
                ? `Kirim ulang kode (${cooldownLeft}s)`
                : "Kirim ulang kode"}
            </button>

            <p className="mt-6 text-sm text-gray-700">
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
    </div>
  );
}
