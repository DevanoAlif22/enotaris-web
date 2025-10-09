import {
  Briefcase,
  Building2,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { landingService } from "../../services/landingService";

export default function StatisticSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [values, setValues] = useState([0, 0, 0, 0]); // angka berjalan
  const [target, setTarget] = useState([0, 0, 0, 0]); // angka dari API
  const [loading, setLoading] = useState(true);

  // Ambil dari API saat mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await landingService.statistics();
        const d = res?.data || {};
        // urut: projects, notaries, clients, deeds
        setTarget([
          Number(d.projects || 0),
          Number(d.notaries || 0),
          Number(d.clients || 0),
          Number(d.deeds || 0),
        ]);
      } catch (e) {
        console.error("Gagal load statistik:", e);
        setTarget([0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Data kartu (judul & ikon)
  const stats = useMemo(
    () => [
      {
        icon: <Briefcase size={32} className="text-white" />,
        title: "Jumlah Proyek",
        desc: "Total proyek notaris yang terdaftar di sistem.",
      },
      {
        icon: <Building2 size={32} className="text-white" />,
        title: "Jumlah Notaris",
        desc: "Notaris aktif yang menggunakan platform.",
      },
      {
        icon: <Users size={32} className="text-white" />,
        title: "Jumlah Penghadap",
        desc: "Penghadap yang terverifikasi dan aktif.",
      },
      {
        icon: <FileText size={32} className="text-white" />,
        title: "Jumlah Akta",
        desc: "Akta yang dibuat dan terdokumentasi.",
      },
    ],
    []
  );

  // Observer: jalankan animasi saat section terlihat
  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setIsVisible(true),
      { threshold: 0.3 }
    );
    const el = document.getElementById("stats-section");
    if (el) ob.observe(el);
    return () => ob.disconnect();
  }, []);

  // Animasi counter ke target dari API
  useEffect(() => {
    if (!isVisible || loading) return;
    const timers = target.map((end, i) => {
      let cur = 0;
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
  }, [isVisible, loading, target]);

  const formatID = (n) => Number(n || 0).toLocaleString("id-ID");

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
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0256c4] to-[#002d6a] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

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

            <div className="mb-3 min-h-[48px] flex items-end">
              {loading ? (
                <span className="text-sm text-gray-400">Memuat…</span>
              ) : (
                <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0256c4] to-[#002d6a] bg-clip-text text-transparent">
                  {formatID(values[i])}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
              {s.desc}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 rounded-full" />
      </div>
    </section>
  );
}
