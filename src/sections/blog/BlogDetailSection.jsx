// sections/blog/BlogDetailSection.jsx
"use client";
import { useState } from "react";
import { CalendarDays, UserRound, Tag, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogDetailSection() {
  const post = {
    id: 1,
    title: "Transformasi Digital di Bidang Kenotariatan",
    cover: "/images/blog-1.png",
    date: "28 September 2025",
    author: "Devano Alif",
    categories: ["Informasi", "Regulasi"],
    content: `
      <p>Transformasi digital di bidang kenotariatan merupakan langkah penting
      dalam meningkatkan efisiensi, transparansi, dan keamanan layanan hukum.
      Dengan penerapan sistem <b>E-Notaris</b>, proses pembuatan akta dan
      manajemen dokumen kini bisa dilakukan lebih cepat dan aman.</p>
      <p>Selain itu, penggunaan tanda tangan digital dan arsip elektronik
      memperkuat legalitas serta meminimalisir risiko kehilangan dokumen.</p>
      <h3>Manfaat Utama:</h3>
      <ul>
        <li>Efisiensi waktu dan biaya</li>
        <li>Transparansi proses</li>
        <li>Keamanan data dan dokumen</li>
      </ul>
    `,
  };

  const [latest] = useState([
    {
      id: 101,
      title: "Peran Tanda Tangan Digital",
      image: "/images/blog-2.png",
      date: "25 Sep 2025",
    },
    {
      id: 102,
      title: "Arsip Elektronik & Legalitas",
      image: "/images/blog-3.png",
      date: "20 Sep 2025",
    },
    {
      id: 103,
      title: "Tips Keamanan Data Notaris",
      image: "/images/blog-1.png",
      date: "14 Sep 2025",
    },
  ]);
  const [categories] = useState([
    { id: 1, name: "Informasi", count: 12 },
    { id: 2, name: "Regulasi", count: 8 },
    { id: 3, name: "Teknologi", count: 15 },
    { id: 4, name: "Praktik", count: 6 },
  ]);

  const badgeClass =
    "px-3 py-1 rounded-full text-white text-xs font-semibold shadow-[0_4px_12px_rgba(2,86,196,0.25)]";

  return (
    <section className="w-full bg-white relative px-6 md:px-20 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ===== LEFT: Article ===== */}
        <div className="lg:col-span-8">
          {/* Cover */}
          <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta */}
          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-4 text-[#5172a3] text-sm mb-3">
              <div className="flex items-center gap-1">
                <CalendarDays size={16} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserRound size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag size={16} />
                <span>{post.categories.join(", ")}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f1d3b] mb-6">
              {post.title}
            </h1>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-[#0f1d3b]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Categories badges */}
            <div className="mt-10 flex gap-2">
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
        </div>

        {/* ===== RIGHT: Sidebar ===== */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Card: Latest Posts */}
            <div className="rounded-2xl border border-gray-100 shadow-sm p-5 bg-white">
              <h3 className="text-lg font-semibold text-[#0f1d3b] mb-4">
                Blog Terbaru
              </h3>
              <ul className="space-y-4">
                {latest.map((b) => (
                  <li key={b.id} className="flex gap-3 group">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {b.image ? (
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          no image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/blog/${b.id}`}
                        className="block text-sm font-semibold text-[#0f1d3b] line-clamp-2 group-hover:underline"
                        title={b.title}
                      >
                        {b.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>{b.date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                to="/blog"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[#0256c4] hover:underline"
              >
                Lihat semua <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card: Categories */}
            <div className="rounded-2xl border border-gray-100 shadow-sm p-5 bg-white">
              <h3 className="text-lg font-semibold text-[#0f1d3b] mb-4">
                Kategori
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/blog?kategori=${encodeURIComponent(c.name)}`}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm text-[#0f1d3b] hover:bg-gray-200 transition"
                  >
                    {c.name} <span className="text-gray-500">({c.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
