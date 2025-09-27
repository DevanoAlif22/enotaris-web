// components/CTASection.jsx
import { MessageCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section
      className="w-full bg-white px-6 md:px-20 py-20 relative"
      data-aos="fade-up"
      data-aos-delay="0"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-6 shadow-sm">
          <MessageCircle size={18} className="text-[#18cb96]" />
          <span className="text-[#0256c4] text-sm font-medium">
            Hubungi Kami
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0256c4] leading-snug mb-4">
          Siap Memulai Proyek Notaris Anda?{" "}
          <span className="text-[#002d6a]">Hubungi Kami Sekarang!</span>
        </h2>
        <p className="text-[#5b6b86] text-lg mb-10 max-w-2xl mx-auto">
          Tim kami siap membantu Anda dalam setiap langkah, mulai dari
          konsultasi awal hingga implementasi E-Notaris. Klik tombol di bawah
          untuk langsung terhubung via WhatsApp.
        </p>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <a
            href="https://wa.me/62895366141915"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            style={{
              background:
                "linear-gradient(94deg, #0256c4 -15.61%, #002d6a 94.47%)",
              boxShadow:
                "0px 20px 40px rgba(2, 86, 196, 0.3), " +
                "0px 10px 20px rgba(2, 86, 196, 0.2), " +
                "0px 5px 10px rgba(2, 86, 196, 0.15)",
            }}
          >
            <span>Chat Via Whatsapp</span>
          </a>
        </div>

        {/* Info nomor WA */}
        <p className="mt-6 text-[#0f1d3b] font-medium">
          atau hubungi langsung:{" "}
          <span className="text-[#0256c4] font-bold">+62 895-3661-41915</span>
        </p>
      </div>
    </section>
  );
}
