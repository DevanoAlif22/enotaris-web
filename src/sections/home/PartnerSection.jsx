import React from "react";

const logos = [
  { src: "/images/google.png", alt: "Google" },
  { src: "/images/microsoft.png", alt: "Microsoft" },
  { src: "/images/aws.png", alt: "AWS" },
  { src: "/images/vercel.png", alt: "Vercel" },
  { src: "/images/cloudinary.png", alt: "Cloudinary" },
  { src: "/images/docker.png", alt: "Docker" },
  { src: "/images/github.png", alt: "GitHub" },
];

// Duplikasi untuk efek loop mulus
const loopLogos = [...logos, ...logos];

export default function PartnerSection({
  speed = 30, // detik untuk satu putaran
  height = 56, // tinggi logo (px)
}) {
  return (
    <section className="relative w-full bg-white py-10">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-[18px] md:text-[20px] font-semibold text-[#002d6a]">
          Partner Kami
        </h3>
        <p className="text-sm text-[#5b6b86]">
          Didukung oleh berbagai mitra teknologi
        </p>
      </div>

      {/* Wrapper marquee */}
      <div
        className="group relative overflow-hidden"
        aria-label="Daftar logo partner yang bergerak otomatis"
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Track */}
        <div
          className="flex w-max items-center gap-10 will-change-transform animate-[marquee_linear_infinite] group-hover:[animation-play-state:paused]"
          style={{
            // durasi bisa diubah via prop
            animationDuration: `${speed}s`,
          }}
          role="list"
        >
          {loopLogos.map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              role="listitem"
              className="opacity-80 hover:opacity-100 transition-opacity"
              title={logo.alt}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-10 md:h-12 object-contain"
                style={{ height }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes (inline, agar tanpa config Tailwind) */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-[marquee_linear_infinite] {
            animation-name: marquee;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}
      </style>
    </section>
  );
}
