// components/Footer.jsx
import { Facebook, Instagram, Linkedin, Twitter, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../../contexts/SettingContext";

function normalizePhoneForTel(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("0")) d = "+62" + d.slice(1);
  if (d.startsWith("62")) d = "+" + d;
  if (d.startsWith("8")) d = "+62" + d;
  return d.startsWith("+") ? d : "+" + d;
}

function buildWaUrl(
  rawPhone,
  text = "Halo, saya tertarik menggunakan E-Notaris."
) {
  let d = String(rawPhone || "").replace(/\D/g, "");
  if (!d) return "https://wa.me/62895366141915";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export default function Footer() {
  const { settings } = useSettings();

  const brandName = settings?.title_hero || "E-Notaris";
  const logoUrl = settings?.logo || null;
  const descFooter =
    settings?.desc_footer ||
    "Platform digital untuk memudahkan notaris dalam mengelola proyek, akta, hingga pelacakan aktivitas secara aman dan terpercaya.";
  const telRaw = settings?.telepon || "";
  const telHref = normalizePhoneForTel(telRaw);
  const waHref = buildWaUrl(telRaw);

  return (
    <footer className="w-full bg-[#002d6a] text-white pt-16 pb-8 px-6 md:px-20 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo + Deskripsi */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-8 w-auto"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl font-extrabold">{brandName}</span>
            )}

            <h3 className="text-2xl font-extrabold">E-Notaris</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{descFooter}</p>
        </div>

        {/* Menu Navigasi */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Navigasi</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>
              <Link to="/" className="hover:text-white">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/feature" className="hover:text-white">
                Fitur
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-white">
                Pelacakan
              </Link>
            </li>
          </ul>
        </div>

        {/* Template Populer (contoh statis, bisa kamu ganti ke dinamis) */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Template Akta</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>
              <a href="#" className="hover:text-white">
                Pendirian PT
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Sewa Menyewa
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Jual Beli
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Perjanjian Kerja
              </a>
            </li>
          </ul>
        </div>

        {/* Kontak & Sosmed */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
          <div className="space-y-2 text-white/80 text-sm mb-4">
            {telRaw && (
              <p className="flex items-center gap-2">
                <Phone size={16} className="opacity-80" />
                <a href={`tel:${telHref}`} className="hover:text-white">
                  {telRaw}
                </a>
                <span className="opacity-60">•</span>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              </p>
            )}
          </div>

          <div className="flex gap-4">
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {settings?.twitter && (
              <a
                href={settings.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Twitter / X"
              >
                <Twitter size={18} />
              </a>
            )}
            {settings?.linkedin && (
              <a
                href={settings.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-white/20 pt-6 text-center text-white/70 text-sm">
        © {new Date().getFullYear()} E-Notaris. Semua hak dilindungi.
      </div>
    </footer>
  );
}
