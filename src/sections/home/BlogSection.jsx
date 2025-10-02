// sections/blog/LatestVacanciesSection.jsx
"use client";
import { CalendarDays, UserRound, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LatestVacanciesSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Data blog contoh
  const posts = [
    {
      id: 1,
      title: "Prosedur dan Biaya Balik Nama Sertifikat Tanah di BPN Terbaru",
      date: "27 Dec 2021",
      author: "enotaris",
      excerpt:
        "Berapa biaya balik nama sertifikat tanah di kantor Badan Pertanahan Nasional (BPN), termasuk…",
      categories: ["Informasi", "Tutorial"],
      cover: "/images/blog-1.png",
      to: "/blog/prosedur-dan-biaya-balik-nama-sertifikat-bpn",
    },
    {
      id: 2,
      title: "Penataan Arsip Kantor Notaris",
      date: "21 Jan 2021",
      author: "enotaris",
      excerpt:
        "Profesi seorang notaris menuntut pengelolaan dokumen dan arsip yang rapi agar…",
      categories: ["Tutorial"],
      cover: "/images/blog-2.png",
      to: "/blog/penataan-arsip-kantor-notaris",
    },
    {
      id: 3,
      title: "Tips Memilih Printer Ukuran A3",
      date: "21 Jan 2021",
      author: "enotaris",
      excerpt:
        "Memilih printer laser A3 untuk kebutuhan tugas seringkali membingungkan. Berikut tips…",
      categories: ["Tutorial"],
      cover: "/images/blog-3.png",
      to: "/blog/tips-memilih-printer-a3",
    },
  ];

  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setIsVisible(true),
      { threshold: 0.2 }
    );
    const el = document.getElementById("latest-blogs");
    if (el) ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const badgeClass =
    "px-4 py-2 rounded-full text-white text-sm font-semibold shadow-[0_6px_20px_rgba(2,86,196,0.25)]";

  return (
    <section
      id="latest-blogs"
      className="w-full bg-[#edf4ff] relative px-6 md:px-20 py-20 overflow-hidden"
    >
      {/* dekorasi */}
      <img
        src="/images/geometri.png"
        alt="Office"
        className="h-150 absolute left-0 top-0 hidden md:block"
      />
      <img
        src="/images/geometri-2.png"
        alt="Office"
        className="h-150 absolute right-0 top-0 hidden md:block"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-4">
            <CalendarDays size={18} className="text-[#18cb96]" />
            <span className="text-[#0256c4] text-sm font-medium">
              Blog Terbaru
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#002d6a]">
            Wawasan untuk Praktik Notaris
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4">
            Dapatkan informasi, tips, dan panduan terbaru seputar dunia notaris
            yang dapat membantu Anda dalam mengelola dokumen, arsip, dan
            kebutuhan pekerjaan sehari-hari.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <article
            key={post.id}
            className={`bg-white rounded-2xl shadow-xl border border-[#e9eefb] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {/* Cover */}
            <div className="relative">
              <img
                src={post.cover}
                alt={post.title}
                className="w-full h-56 object-cover"
              />
              {/* Badges kategori di atas gambar */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {post.categories.map((c, idx) => (
                  <span
                    key={idx}
                    className={`${badgeClass} bg-gradient-to-r from-[#0256c4] to-[#002d6a]`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Meta & content */}
            <div className="p-6">
              <div className="flex items-center gap-4 text-[#5172a3] text-sm mb-2">
                <div className="flex items-center gap-1">
                  <CalendarDays size={16} />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserRound size={16} />
                  <span>{post.author}</span>
                </div>
              </div>

              <h3 className="text-[22px] font-extrabold text-[#0f1d3b] leading-snug mb-2">
                {post.title}
              </h3>

              <p className="text-[#5b6b86] text-[15px] leading-7 mb-4">
                {post.excerpt}
              </p>

              <Link
                to={post.to}
                className="inline-flex items-center gap-1 text-[#0256c4] hover:text-[#002d6a] font-semibold"
              >
                Baca Lebih Lanjut <ChevronRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Tombol lihat selengkapnya */}
      <div className="text-center mt-12">
        <Link
          to="/blog"
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
          <span>Lihat Selengkapnya</span>
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default LatestVacanciesSection;
