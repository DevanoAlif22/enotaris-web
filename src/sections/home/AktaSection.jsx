import { FileText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { landingService } from "../../services/landingService";

export default function TemplateAktaSwiper() {
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSlidesPerView(3);
      else if (window.innerWidth >= 768) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ambil data dari service
  useEffect(() => {
    (async () => {
      try {
        const res = await landingService.templates({ limit: 16 });
        setItems(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error("load templates failed:", e);
        setItems([]); // tanpa fallback default
      }
    })();
  }, []);

  // autoplay
  useEffect(() => {
    if (items.length === 0) return;
    const itv = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(itv);
  }, [items.length]);

  const totalSlides = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.ceil(items.length / slidesPerView);
  }, [items.length, slidesPerView]);

  const next = () =>
    items.length && setCurrentIdx((p) => (p + 1) % items.length);
  const prev = () =>
    items.length && setCurrentIdx((p) => (p - 1 + items.length) % items.length);
  const goToSlide = (index) => setCurrentIdx(index * slidesPerView);

  const loopItems = useMemo(
    () => (items.length ? [...items, ...items] : []),
    [items]
  );

  return (
    <section className="w-full bg-[#002d6a] px-6 md:px-20 py-16 relative top-[-10px]">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white border border-[#d9e6ff] rounded-full px-6 py-2 mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#18cb96]" />
          <span className="text-[#0256c4] text-sm font-medium">
            Template Akta Favorit
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pilih Template
          <span className="bg-gradient-to-r from-blue-200 to-blue-600 bg-clip-text text-transparent">
            {" "}
            Kerja Lebih Cepat
          </span>
        </h2>
      </div>

      {/* Slider */}
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-6"
            style={{
              transform: `translateX(-${
                items.length
                  ? (currentIdx % items.length) * (100 / slidesPerView)
                  : 0
              }%)`,
            }}
          >
            {loopItems.map((item, idx) => (
              <div
                key={`${item.id ?? "i"}-${idx}`}
                className="flex-shrink-0"
                style={{ width: `${100 / slidesPerView}%` }}
              >
                <div className="px-3">
                  <Card
                    id={item.id}
                    title={item.title}
                    desc={item.desc}
                    icon_url={item.icon_url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav arrows */}
        {items.length > slidesPerView && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg border border-[#d9e6ff] hover:scale-105 transition"
              aria-label="Sebelumnya"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#0256c4]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-lg border border-[#d9e6ff] hover:scale-105 transition"
              aria-label="Berikutnya"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-[#0256c4]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-3 mt-12">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-200 rounded-full ${
                  Math.floor(currentIdx / slidesPerView) === index
                    ? "w-6 h-2 bg-[#0256c4]"
                    : "w-2 h-2 bg-[#c8dafb] hover:bg-[#0256c4]/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Card({ id, title, desc, icon_url }) {
  return (
    <article
      className="group relative isolate overflow-hidden bg-white rounded-2xl p-6 border border-[#e9eefb]
                 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0256c4] to-[#002d6a] opacity-0 group-hover:opacity-[0.06] transition" />

      {/* icon kecil (10 -> 9, dan lucide 22 -> 18) */}
      <div className="mb-4">
        <div className="inline-flex w-10 h-10 items-center justify-center rounded-xl text-white bg-gradient-to-br from-[#0256c4] to-[#002d6a] shadow-lg overflow-hidden">
          {icon_url ? (
            <img src={icon_url} alt={title} className="w-6 h-6 object-cover" />
          ) : (
            <FileText size={18} />
          )}
        </div>
      </div>

      <h3 className="text-[#0f1d3b] text-lg font-bold mb-2">{title}</h3>
      <p className="text-[#5b6b86] text-sm mb-4 line-clamp-3">{desc}</p>

      <a
        href={id ? `/app/template/${id}/edit` : "#"}
        className="inline-flex items-center gap-2 text-[#0256c4] font-semibold hover:text-[#002d6a] transition-colors"
      >
        Gunakan Template
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </article>
  );
}
