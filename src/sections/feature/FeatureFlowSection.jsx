// sections/feature/FeatureFlowSection.jsx
import { useMemo, useState } from "react";
import {
  ShieldCheck, // Verifikasi Identitas
  FileText, // Template Akta
  UserPlus, // Undang Penghadap
  ActivitySquare, // Monitoring
  ClipboardSignature, // Pembuatan Akta
  PenLine, // Tanda Tangan Digital
  ChevronDown,
} from "lucide-react";

const steps = [
  {
    id: "verify",
    order: 1,
    title: "Verifikasi Identitas",
    icon: ShieldCheck,
    brief: "Proses eKYC untuk keamanan & kepatuhan.",
    description:
      "Validasi identitas penghadap menggunakan KTP, Kartu Keluarga dan yang lainnya.",
    video: "feature-1.mp4",
  },
  {
    id: "template",
    order: 2,
    title: "Pilih, Import, atau Buat Template Akta",
    icon: FileText,
    brief: "Template dinamis untuk akta yang konsisten.",
    description:
      "Pilih atau Import Word (.docx), edit dengan text editor, gunakan merge field, dan pratinjau dokumen sebelum disimpan.",
    video: "feature-2.mp4",
  },

  {
    id: "invite",
    order: 3,
    title: "Undang Penghadap",
    icon: UserPlus,
    brief: "Kirim undangan sebagai penghadap.",
    description:
      "Undang penghadap dengan notifikasi email, upload berkas pendukung, dan status hadir real-time.",
    video: "feature-3.mp4",
  },
  {
    id: "filling",
    order: 4,
    title: "Pengisian Data / Dokumen Tambahan",
    icon: FileText, // bisa ganti icon lain kalau mau
    brief: "Lengkapi data dan dokumen akta.",
    description:
      "Tahap pengisian data penghadap, pengunggahan dokumen tambahan, serta validasi kelengkapan akta.",
    video: "feature-4.mp4",
  },
  {
    id: "monitor",
    order: 5,
    title: "Monitoring Praktik Pembuatan Akta",
    icon: ActivitySquare,
    brief: "Pantau progres, aktivitas, dan SLA.",
    description:
      "Timeline aktivitas mulai dari verifikasi, pengisian data, penjadwalan, hingga penandatanganan.",
    video: "feature-5.mp4",
  },
  {
    id: "drafting",
    order: 6,
    title: "Pembuatan Akta",
    icon: ClipboardSignature,
    brief: "Drafting akta lebih cepat & akurat.",
    description:
      "Editor akta dengan merge variabel otomatis, riwayat perubahan, dan kontrol versi terintegrasi.",
    video: "feature-6.mp4",
  },
  {
    id: "esign",
    order: 7,
    title: "Tanda Tangan Digital",
    icon: PenLine,
    brief: "Legal & terverifikasi.",
    description: "Tanda tangan digital dilakukan oleh Notaris dan Penghadap",
    video: "feature-7.mp4",
  },
];

export default function FeatureFlowSection() {
  const [activeId, setActiveId] = useState(steps[0].id);
  const active = useMemo(
    () => steps.find((s) => s.id === activeId),
    [activeId]
  );

  const cardShadow =
    "39px 47px 17px rgba(0,0,0,0), 25px 30px 16px rgba(0,0,0,0), 14px 17px 13px rgba(0,0,0,0.02), 6px 8px 10px rgba(0,0,0,0.03), 2px 2px 5px rgba(0,0,0,0.03)";

  return (
    <section className="w-full bg-[#edf4ff] relative px-6 md:px-20 py-20">
      {/* Header */}
      <div className="text-center mb-10" data-aos="fade-up">
        <div className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#18cb96]" />
          <span className="text-[#0256c4] text-sm font-medium">
            Alur Fitur E-Notaris
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#002d6a]">
          Semua Tahap Dalam Satu Alur Kerja
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mt-3">
          Klik tiap langkah untuk melihat penjelasan dan <b>video demo</b>
        </p>
      </div>

      {/* Content: Accordion + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Accordion */}
        <div className="space-y-3" data-aos="fade-up" data-aos-delay="50">
          {steps.map((step, i) => (
            <AccordionItem
              key={step.id}
              step={step}
              active={activeId === step.id}
              onToggle={() => setActiveId(step.id)}
              index={i}
              cardShadow={cardShadow}
            />
          ))}
        </div>

        {/* Right: Preview Panel (Video) */}
        <div
          className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6"
          style={{ boxShadow: cardShadow }}
          data-aos="fade-up"
          data-aos-delay="120"
        >
          {/* Header preview */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-[#0256c4] to-[#002d6a]">
              {active?.icon ? <active.icon size={18} /> : null}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#0f1d3b]">
                {active?.title}
              </h3>
              <p className="text-sm text-[#5172a3]">{active?.brief}</p>
            </div>
          </div>

          {/* Video preview */}
          <div className="mt-4">
            <video
              key={active?.video} // reload saat ganti tab
              src={`/videos/${active?.video}`}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-xl border border-[#d9e6ff] shadow-inner bg-[#f5f9ff]"
            >
              Browser Anda tidak mendukung tag video.
            </video>
          </div>

          {/* Deskripsi singkat */}
          <p className="mt-4 text-[#0f1d3b]">{active?.description}</p>
        </div>
      </div>
    </section>
  );
}

function AccordionItem({ step, active, onToggle, index, cardShadow }) {
  const Icon = step.icon;
  return (
    <div
      className="rounded-2xl border border-[#e9eefb] bg-white shadow-xl transition-all"
      style={{ boxShadow: cardShadow }}
      data-aos="fade-up"
      data-aos-delay={index * 80}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={active}
        aria-controls={`content-${step.id}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-r from-[#0256c4] to-[#002d6a]">
            {Icon ? <Icon size={18} /> : null}
          </div>
          <div>
            <div className="text-[13px] text-[#5172a3] leading-none">
              Langkah {step.order}
            </div>
            <div className="text-[#0f1d3b] text-lg font-bold">{step.title}</div>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`transition-transform ${
            active ? "rotate-180 text-[#0256c4]" : "text-[#5172a3]"
          }`}
        />
      </button>

      <div
        id={`content-${step.id}`}
        className={`px-5 overflow-hidden transition-[max-height,opacity] duration-300 ${
          active ? "max-h-32 opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[#0f1d3b]">{step.description}</p>
      </div>
    </div>
  );
}
