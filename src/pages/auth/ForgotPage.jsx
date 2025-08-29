import { useState } from "react";
import InputField from "../../components/input/InputField";

export default function ForgotPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="rounded-lg flex w-full max-w-5xl overflow-hidden">
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
            />

            {/* Submit */}
            <button
              type="submit"
              className="mt-[40px] w-full bg-[#0256c4] text-white rounded-full py-3 text-lg font-semibold hover:bg-blue-700 transition"
            >
              Kirim Tautan Reset
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Daftar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
