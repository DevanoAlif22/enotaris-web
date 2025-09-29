import {
  Briefcase,
  Building2,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

export default function StatisticSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [values, setValues] = useState([0, 0, 0, 0]);

  // Data statistik (silakan ganti angkanya dengan data backend-mu)
  const stats = useMemo(
    () => [
      {
        icon: <Briefcase size={32} className="text-white" />,
        title: "Jumlah Proyek",
        value: 128,
        desc: "Total proyek notaris yang terdaftar di sistem.",
      },
      {
        icon: <Building2 size={32} className="text-white" />,
        title: "Jumlah Notaris",
        value: 42,
        desc: "Notaris aktif yang menggunakan platform.",
      },
      {
        icon: <Users size={32} className="text-white" />,
        title: "Jumlah Penghadap",
        value: 560,
        desc: "Penghadap yang terverifikasi dan aktif.",
      },
      {
        icon: <FileText size={32} className="text-white" />,
        title: "Jumlah Akta",
        value: 910,
        desc: "Akta yang dibuat dan terdokumentasi.",
      },
    ],
    []
  );

  // Trigger animasi saat section terlihat
  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setIsVisible(true),
      { threshold: 0.3 }
    );
    const el = document.getElementById("stats-section");
    if (el) ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Animasi counter
  useEffect(() => {
    if (!isVisible) return;
    const timers = stats.map((s, i) => {
      let cur = 0;
      const end = s.value;
      const duration = 1600; // ms
      const step = Math.max(1, Math.floor(end / (duration / 16)));

      return setInterval(() => {
        cur += step;
        if (cur >= end) {
          cur = end;
          clearInterval(timers[i]);
        }
        setValues((prev) => {
          const n = [...prev];
          n[i] = cur;
          return n;
        });
      }, 16);
    });
    return () => timers.forEach((t) => clearInterval(t));
  }, [isVisible, stats]);

  const formatID = (n) => n.toLocaleString("id-ID");

  return (
    <section
      id="stats-section"
      className="w-full bg-[#002d6a] relative px-6 md:px-20 py-20 overflow-hidden top-[-10px]"
    >
      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-white text-sm font-medium">
              Statistik E-Notaris
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pertumbuhan
            <span className="bg-gradient-to-r from-blue-200 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Luar Biasa
            </span>
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Angka real-time pengguna dan aktivitas di platform kami
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {stats.map((s, i) => (
          <article
            key={s.title}
            className={`group relative isolate overflow-hidden bg-white/95 rounded-2xl p-8
                        shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2
                        border border-white/20 ${
                          isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-10"
                        }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {/* overlay hover (tidak terima pointer) */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0256c4] to-[#002d6a] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

            {/* Icon + glow */}
            <div className="relative mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0256c4] rounded-2xl shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-500">
                {s.icon}
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[#0256c4] opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{ filter: "blur(18px)" }}
              />
            </div>

            <h3 className="text-gray-700 font-semibold text-lg mb-3 group-hover:text-gray-800 transition-colors duration-300">
              {s.title}
            </h3>

            <div className="mb-3">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0256c4] to-[#002d6a] bg-clip-text text-transparent">
                {formatID(values[i])}
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              {s.desc}
            </p>
          </article>
        ))}
      </div>

      {/* Divider bawah */}
      <div className="mt-16 flex justify-center">
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 rounded-full" />
      </div>
    </section>
  );
}
