import { useEffect, useState } from "react";
import { CalendarDays, UserRound, ChevronRight, Search } from "lucide-react";
import { landingService } from "../../services/landingService";
import CategoryFilterBar from "../../components/landing/blog/CategoryFilterBar";

export default function BlogListSection() {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [allCats, setAllCats] = useState([]); // dari API
  const [posts, setPosts] = useState([]); // dari API
  const [loading, setLoading] = useState(false);
  const [, setMeta] = useState({
    current_page: 1,
    per_page: 9,
    total: 0,
    last_page: 1,
  });

  // load categories sekali
  useEffect(() => {
    (async () => {
      try {
        const res = await landingService.blogCategories();
        const arr = Array.isArray(res?.data) ? res.data : [];
        setAllCats(arr.map((c) => c.name)); // CategoryFilterBar pakai array of string
      } catch (e) {
        console.error("load categories failed:", e);
        setAllCats([]); // tanpa fallback
      }
    })();
  }, []);

  // load blogs tiap search / kategori berubah
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await landingService.blogs({
          q: search,
          categories: selectedCats,
          page: 1,
          per_page: 9,
        });
        setPosts(Array.isArray(res?.data) ? res.data : []);
        if (res?.meta) setMeta(res.meta);
      } catch (e) {
        console.error("load blogs failed:", e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
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
          categories={allCats}
          selected={selectedCats}
          onChange={setSelectedCats}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center text-gray-500">Memuat artikel…</div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-xl border border-[#e9eefb] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                data-aos="fade-up"
                data-aos-delay={i * 120}
              >
                {/* Cover */}
                <div className="relative">
                  <img
                    src={post.cover || "/images/blog-placeholder.png"}
                    alt={post.title}
                    className="w-full h-56 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                    {(post.categories || []).map((c, idx) => (
                      <span
                        key={`${post.id}-cat-${idx}`}
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
                    href={post.href || "#"}
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
      )}
    </section>
  );
}
