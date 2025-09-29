// sections/about/AboutHeroSection.jsx
import { UserRound } from "lucide-react";

export default function AboutHeroSection() {
  return (
    <section className="w-full bg-[#edf4ff] relative px-6 md:px-20 py-20 text-center overflow-hidden">
      {/* Background shape */}
      <img
        src="/images/shape.png"
        alt=""
        className="h-80 absolute left-0 top-0 hidden md:block"
      />
      <img
        src="/images/shape-2.png"
        alt=""
        className="h-80 absolute right-0 top-0 hidden md:block"
      />

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-4"
        data-aos="fade-up"
      >
        <UserRound size={18} className="text-[#18cb96]" />
        <span className="text-[#0256c4] text-sm font-medium">Tentang Kami</span>
      </div>

      {/* Heading */}
      <h2
        className="text-3xl md:text-5xl font-bold text-[#002d6a] mb-4"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Kenali Lebih Dekat <span className="text-[#0256c4]">E-Notaris</span>
      </h2>

      <p
        className="text-gray-600 text-lg max-w-2xl mx-auto"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        Kami berkomitmen menghadirkan transformasi digital di bidang
        kenotariatan melalui solusi yang aman, efisien, dan terpercaya.
      </p>
    </section>
  );
}
