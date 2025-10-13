import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { partnerService } from "../../services/partnerService";

export default function PartnerSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await partnerService.all({ min: true });
        setPartners(res?.data || []);
      } catch (err) {
        console.error("Gagal memuat partner:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
          <span className="ml-3 text-sm text-gray-500">Memuat partner…</span>
        </div>
      ) : partners.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-8">
          Belum ada partner ditambahkan.
        </p>
      ) : (
        <Marquee
          pauseOnHover={true}
          speed={50}
          gradient={true}
          gradientColor={[255, 255, 255]}
          gradientWidth={60}
        >
          {partners.map((p, i) => (
            <div
              key={p.id || i}
              className="mx-10 flex items-center justify-center"
            >
              {p.image ? (
                <a
                  href={p.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.name}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-12 object-contain"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div
                  className="flex items-center justify-center h-12 w-12 bg-gray-100 text-gray-600 font-semibold rounded-md"
                  title={p.name}
                >
                  {(p.name || "?")
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")}
                </div>
              )}
            </div>
          ))}
        </Marquee>
      )}
    </section>
  );
}
