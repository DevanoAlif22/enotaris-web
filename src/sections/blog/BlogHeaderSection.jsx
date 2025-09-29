import { CalendarDays } from "lucide-react";

export default function BlogHeaderSection() {
  return (
    <section className="w-full bg-[#edf4ff] relative px-6 md:px-20 py-20 text-center">
      <img
        src="/images/shape.png"
        alt="Office"
        class="h-80 absolute left-0 top-0 hidden md:block"
      ></img>
      <img
        src="/images/shape-2.png"
        alt="Office"
        class="h-80 absolute right-0 top-0 hidden md:block"
      ></img>
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-4">
        <CalendarDays size={18} className="text-[#18cb96]" />
        <span className="text-[#0256c4] text-sm font-medium">
          Blog & Artikel
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-[#002d6a] mb-4">
        Wawasan untuk Praktik Notaris
      </h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Temukan artikel, tips, dan informasi terkini seputar dunia notaris yang
        dapat membantu Anda mengelola dokumen, arsip, dan kebutuhan pekerjaan
        sehari-hari.
      </p>
    </section>
  );
}
