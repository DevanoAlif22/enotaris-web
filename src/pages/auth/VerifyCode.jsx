import { useState } from "react";
import InputField from "../../components/input/InputField";

export default function VerifyCodePage() {
  const [form, setForm] = useState({ email: "", code: "" });

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Verify payload:", form);
  };

  const handleResend = (e) => {
    e.preventDefault();
    console.log("Resend kode ke:", form.email || "(isi email dulu)");
  };

  return (
    <div className="flex items-center justify-center overflow-x-auto">
      <div className="rounded-lg flex w-full max-w-5xl overflow-hidden">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0256c4] relative flex-col justify-center items-center text-white">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Logo + tagline */}
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
            {/* Illustration */}
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
              label="Email"
              type="email"
              name="email"
              placeholder="Masukkan email yang didaftarkan"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />

            <InputField
              label="Kode Verifikasi"
              type="text"
              name="code"
              placeholder="Masukkan 7 karakter (huruf/angka)"
              value={form.code}
              onChange={(e) =>
                update("code", e.target.value.toUpperCase().slice(0, 7))
              }
            />

            <button
              type="submit"
              className="mt-4 w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition"
            >
              Verifikasi
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={handleResend}
              className="text-sm text-purple-600 font-medium hover:underline"
            >
              Kirim ulang kode
            </button>

            <p className="mt-6 text-sm text-gray-700">
              Sudah punya akun?{" "}
              <a
                href="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Masuk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
