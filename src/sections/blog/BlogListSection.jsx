import { useState, useMemo } from "react";
import { CalendarDays, UserRound, ChevronRight, Search } from "lucide-react";
import CategoryFilterBar from "../../components/landing/blog/CategoryFilterBar";

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
    href: "/blog/prosedur-dan-biaya-balik-nama-sertifikat-bpn",
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
    href: "/blog/penataan-arsip-kantor-notaris",
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
    href: "/blog/tips-memilih-printer-a3",
  },
  {
    id: 1,
    title: "Prosedur dan Biaya Balik Nama Sertifikat Tanah di BPN Terbaru",
    date: "27 Dec 2021",
    author: "enotaris",
    excerpt:
      "Berapa biaya balik nama sertifikat tanah di kantor Badan Pertanahan Nasional (BPN), termasuk…",
    categories: ["Informasi", "Tutorial"],
    cover: "/images/blog-1.png",
    href: "/blog/prosedur-dan-biaya-balik-nama-sertifikat-bpn",
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
    href: "/blog/penataan-arsip-kantor-notaris",
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
    href: "/blog/tips-memilih-printer-a3",
  },
];

const ALL_CATEGORIES = ["Informasi", "Tutorial", "Panduan", "Regulasi"];

export default function BlogListSection() {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch = post.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        selectedCats.length === 0 ||
        selectedCats.some((c) => post.categories.includes(c));
      return matchSearch && matchCategory;
    });
  }, [search, selectedCats]);

  const badgeClass =
    "px-4 py-2 rounded-full text-white text-sm font-semibold shadow-[0_6px_20px_rgba(2,86,196,0.25)]";

  return (
    <section className="w-full bg-white relative px-6 md:px-20 py-20">
      {/* Search & Multi Filter Bar */}
      <div className="space-y-4 mb-10">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d9e6ff] focus:ring-2 focus:ring-[#0256c4] focus:outline-none"
          />
        </div>

        <CategoryFilterBar
          categories={ALL_CATEGORIES}
          selected={selectedCats}
          onChange={setSelectedCats}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl shadow-xl border border-[#e9eefb] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              data-aos="fade-up"
              data-aos-delay={i * 120}
            >
              {/* Cover */}
              <div className="relative">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                />
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

                <a
                  href={post.href}
                  className="inline-flex items-center gap-1 text-[#0256c4] hover:text-[#002d6a] font-semibold"
                >
                  Baca Lebih Lanjut <ChevronRight size={18} />
                </a>
              </div>
            </article>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Tidak ada artikel ditemukan.
          </p>
        )}
      </div>
    </section>
  );
}
