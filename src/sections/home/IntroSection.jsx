// components/ENotarisIntroSection.jsx
import {
  DocumentTextIcon,
  IdentificationIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router";

export default function ENotarisIntroSection() {
  const services = [
    { label: "Pembuatan Akta", icon: DocumentTextIcon },
    { label: "Pendirian PT/CV", icon: IdentificationIcon },
    { label: "Blog/Artikel Terbaru", icon: NewspaperIcon },
    { label: "Verifikasi Identitas", icon: ShieldCheckIcon },
    { label: "Tanda Tangan Digital", icon: PencilSquareIcon },
    { label: "Monitoring Proyek", icon: ChartBarIcon },
  ];

  const bullet = [
    {
      title: "Mudah & Efisien",
      desc: "Semua praktik kenotariatan dikelola dalam satu platform digital yang terarah.",
    },
    {
      title: "Aman & Terpercaya",
      desc: "Didukung proses verifikasi identitas & penyimpanan cloud yang andal.",
    },
    {
      title: "Kolaborasi Real-time",
      desc: "Notaris dan Penghadap terhubung dalam satu alur kerja.",
    },
    {
      title: "Dokumen Terintegrasi",
      desc: "Dari akta hingga arsip, tersimpan rapi dan mudah dicari.",
    },
  ];

  const cardShadow =
    "39px 47px 17px rgba(0,0,0,0), 25px 30px 16px rgba(0,0,0,0), 14px 17px 13px rgba(0,0,0,0.02), 6px 8px 10px rgba(0,0,0,0.03), 2px 2px 5px rgba(0,0,0,0.03)";

  // posisi chips untuk AOS + delay
  const chipPos = [
    { top: "8%", left: "-4%", aos: "zoom-in", delay: 0 },
    { top: "8%", right: "2%", aos: "zoom-in", delay: 100 },
    { top: "42%", left: "-6%", aos: "fade-right", delay: 200 },
    { top: "42%", right: "-2%", aos: "fade-left", delay: 300 },
    { top: "68%", right: "6%", aos: "fade-up-left", delay: 400 },
    { top: "72%", left: "2%", aos: "fade-up-right", delay: 500 },
  ];

  return (
    <section className="w-full bg-[#edf4ff] relative px-[30px] md:px-[80px] py-14 top-[-10px]">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* LEFT */}
        <div className="flex-1 relative">
          {/* Ilustrasi */}
          <img
            src="/images/people-2.png"
            alt="E-Notaris Illustration"
            className="w-full max-w-[520px] md:max-w-[560px] mx-auto drop-shadow-sm"
            data-aos="fade-up"
            data-aos-delay="0"
          />

          {/* Chips layanan mengambang */}
          <div className="hidden md:block">
            {services.map((srv, i) => (
              <FloatingChip
                key={i}
                style={chipPos[i]}
                icon={srv.icon}
                label={srv.label}
                cardShadow={cardShadow}
              />
            ))}
          </div>

          {/* Badge E-Notaris bawah */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-white flex items-center gap-3 px-5 py-3 rounded-[16px] border border-[#d9e6ff]"
            style={{ boxShadow: cardShadow }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#0256c4] to-[#002d6a]">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[#0f1d3b] font-bold leading-4">E-Notaris</p>
              <p className="text-[13px] text-[#5b6b86]">
                Kelola Proyek Lebih Terarah
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1">
          {/* Badge kecil */}
          <div
            className="bg-white inline-flex items-center px-4 py-2 rounded-full border border-[#d9e6ff] mb-4"
            style={{ boxShadow: cardShadow }}
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <span className="w-2 h-2 rounded-full bg-[#18cb96] mr-2" />
            <span className="text-[#0256c4] text-sm font-medium">
              Digitalisasi Proyek Notaris
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-[30px] md:text-[44px] font-extrabold text-[#0256c4] leading-tight mb-3"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Mulai Digitalisasi Proyekmu{" "}
            <span className="text-[#002d6a]">Bersama E-Notaris!</span>
          </h2>

          {/* underline */}
          <div
            className="h-[6px] w-[220px] bg-[#ffd263] rounded-full mb-6"
            data-aos="zoom-in"
            data-aos-delay="180"
          />

          {/* Bullets */}
          <ul className="space-y-4 mb-8">
            {bullet.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-3"
                data-aos="fade-up"
                data-aos-delay={200 + i * 120}
              >
                <div className="mt-[2px]">
                  <CheckCircleIcon
                    className="w-5 h-5 text-[#18cb96]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-[16px] md:text-[18px] text-[#0f1d3b]">
                  <span className="font-bold">{b.title}!</span> {b.desc}
                </p>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/start-project"
              className="text-white font-semibold px-6 py-3 rounded-2xl transition-all"
              style={{
                background:
                  "linear-gradient(94deg, #0256c4 -15.61%, #002d6a 94.47%)",
                boxShadow:
                  "0px 20px 40px rgba(2,86,196,0.30), 0px 10px 20px rgba(2,86,196,0.20), 0px 5px 10px rgba(2,86,196,0.15)",
              }}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Mulai Proyek Notaris
            </a>

            <a
              href="/features"
              className="px-6 py-3 rounded-2xl font-semibold text-[#0256c4] border border-[#0256c4] hover:bg-[#0256c4] hover:text-white transition-colors"
              data-aos="fade-up"
              data-aos-delay="260"
            >
              Lihat Fitur
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Chip kecil mengambang – sekarang support AOS lewat style.aos & style.delay */
function FloatingChip({ style, icon: Icon, label, cardShadow }) {
  const { aos = "zoom-in", delay = 0, ...pos } = style || {};
  return (
    <div
      className="absolute bg-white rounded-[14px] border border-[#d9e6ff] px-4 py-2 flex items-center gap-2"
      style={{ ...pos, boxShadow: cardShadow }}
      data-aos={aos}
      data-aos-delay={delay}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-r from-[#0256c4] to-[#002d6a]">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <span className="text-[#0f1d3b] text-sm font-semibold">{label}</span>
    </div>
  );
}
