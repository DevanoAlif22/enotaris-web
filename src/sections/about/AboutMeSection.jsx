// sections/about/AboutOfficeSection.jsx
import {
  Building2,
  BadgeCheck,
  Award,
  Phone,
  Calendar,
  Users,
  Shield,
} from "lucide-react";

export default function AboutOfficeSection() {
  const cardShadow =
    "39px 47px 17px rgba(0,0,0,0), 25px 30px 16px rgba(0,0,0,0), 14px 17px 13px rgba(0,0,0,0.02), 6px 8px 10px rgba(0,0,0,0.03), 2px 2px 5px rgba(0,0,0,0.03)";

  // Layanan/keunggulan kantor (chips)
  const offerings = [
    "Pembuatan & Legalitas Akta",
    "Balik Nama Sertifikat",
    "Arsip Digital Terstruktur",
    "Tanda Tangan Elektronik",
    "Verifikasi Identitas",
    "Manajemen Proyek Notaris",
  ];

  // Statistik kantor
  const stats = [
    { icon: <Users size={18} />, label: "Klien Dilayani", value: "1.200+" },
    {
      icon: <BadgeCheck size={18} />,
      label: "Proyek Terselesaikan",
      value: "900+",
    },
    { icon: <Shield size={18} />, label: "Kepatuhan", value: "ISO/PDPA" },
  ];

  // Timeline kantor
  const timeline = [
    {
      year: "2016",
      title: "Kantor Berdiri",
      desc: "Mulai melayani kebutuhan kenotariatan dengan standar layanan profesional.",
    },
    {
      year: "2019",
      title: "Digitalisasi Layanan",
      desc: "Implementasi arsip digital & alur kerja elektronik untuk efisiensi.",
    },
    {
      year: "2022",
      title: "Platform E-Notaris",
      desc: "Integrasi pembuatan akta, tracking proyek, dan kolaborasi dalam satu sistem.",
    },
  ];

  return (
    <section className="w-full bg-white relative px-6 md:px-20 py-20">
      {/* Konten utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Kiri: Foto kantor + stats + kontak */}
        <div
          className="lg:col-span-1 bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6 flex flex-col items-center text-center"
          style={{ boxShadow: cardShadow }}
          data-aos="fade-up"
          data-aos-delay="50"
        >
          <div className="w-40 h-40 rounded-2xl overflow-hidden border border-[#d9e6ff] mb-4">
            <img
              src="/images/office.jpg" // ganti sesuai asetmu
              alt="Foto Kantor"
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-xl font-extrabold text-[#0f1d3b]">
            Kantor Notaris E-Notaris
          </h3>
          <p className="text-[#5b6b86] mt-1">Profesional • Aman • Transparan</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full mt-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#e9eefb] p-3 text-center"
                data-aos="fade-up"
                data-aos-delay={100 + i * 80}
              >
                <div className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-r from-[#0256c4] to-[#002d6a] mb-2">
                  {s.icon}
                </div>
                <div className="text-lg font-bold text-[#0f1d3b]">
                  {s.value}
                </div>
                <div className="text-xs text-[#5b6b86]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Kontak */}
          <a
            href="https://wa.me/62895366141915"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(94deg, #0256c4 -15.61%, #002d6a 94.47%)",
              boxShadow:
                "0px 20px 40px rgba(2, 86, 196, 0.3), 0px 10px 20px rgba(2, 86, 196, 0.2), 0px 5px 10px rgba(2, 86, 196, 0.15)",
            }}
          >
            <Phone size={18} />
            Hubungi Kantor
          </a>
        </div>

        {/* Kanan: Ringkasan, Layanan Unggulan, Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ringkasan kantor */}
          <div
            className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6"
            style={{ boxShadow: cardShadow }}
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <h4 className="text-lg font-bold text-[#0256c4] mb-2">
              Profil Singkat
            </h4>
            <p className="text-[#0f1d3b] leading-7">
              Kantor kami berfokus pada layanan kenotariatan yang memadukan
              kepatuhan hukum dan efisiensi teknologi. Dengan sistem E-Notaris,
              proses pembuatan akta, verifikasi identitas, tanda tangan
              elektronik, hingga pengarsipan dapat dilakukan terukur dan
              terdokumentasi rapi—memberikan pengalaman yang cepat dan
              transparan bagi klien.
            </p>
          </div>

          {/* Layanan/Keunggulan (chips) */}
          <div
            className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6"
            style={{ boxShadow: cardShadow }}
            data-aos="fade-up"
            data-aos-delay="120"
          >
            <h4 className="text-lg font-bold text-[#0256c4] mb-4">
              Layanan & Keunggulan
            </h4>
            <div className="flex flex-wrap gap-2">
              {offerings.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-2 rounded-full text-sm font-semibold border border-[#d9e6ff] text-[#0f1d3b] bg-white hover:bg-[#f3f7ff] transition"
                  data-aos="fade-up"
                  data-aos-delay={120 + i * 60}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline kantor */}
          <div
            className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6"
            style={{ boxShadow: cardShadow }}
            data-aos="fade-up"
            data-aos-delay="160"
          >
            <h4 className="text-lg font-bold text-[#0256c4] mb-4">
              Perjalanan Kantor
            </h4>
            <ol className="relative border-s border-[#e9eefb] ms-3">
              {timeline.map((t, i) => (
                <li
                  key={i}
                  className="mb-6 ms-4"
                  data-aos="fade-up"
                  data-aos-delay={160 + i * 80}
                >
                  <div className="absolute w-3 h-3 rounded-full -start-1.5 top-2 bg-gradient-to-r from-[#0256c4] to-[#002d6a]" />
                  <time className="text-xs text-[#5172a3]">{t.year}</time>
                  <h5 className="text-[16px] font-bold text-[#0f1d3b]">
                    {t.title}
                  </h5>
                  <p className="text-[#5b6b86] text-sm">{t.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
