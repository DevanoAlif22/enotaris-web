// sections/blog/BlogDetailSection.jsx
import { CalendarDays, UserRound, Tag } from "lucide-react";

export default function BlogDetailSection() {
  // ⚠️ sementara isi dummy, nanti bisa fetch dari API/blogService pakai id/slug
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

  const badgeClass =
    "px-3 py-1 rounded-full text-white text-xs font-semibold shadow-[0_4px_12px_rgba(2,86,196,0.25)]";

  return (
    <section className="w-full bg-white relative px-6 md:px-20 py-20">
      {/* Cover */}
      <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-8">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta */}
      <div className="max-w-4xl mx-auto">
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

        {/* Categories */}
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
    </section>
  );
}
