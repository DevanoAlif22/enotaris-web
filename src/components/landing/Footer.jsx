// components/Footer.jsx
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#002d6a] text-white pt-16 pb-8 px-6 md:px-20 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo + Deskripsi */}
        <div>
          <h3 className="text-2xl font-extrabold mb-4">E-Notaris</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Platform digital untuk memudahkan notaris dalam mengelola proyek,
            akta, hingga pelacakan aktivitas secara aman dan terpercaya.
          </p>
        </div>

        {/* Menu Navigasi */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Navigasi</h4>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>
              <a href="/" className="hover:text-white">
                Beranda
              </a>
            </li>
            <li>
              <a href="/layanan" className="hover:text-white">
                Layanan
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-white">
                Blog
              </a>
            </li>
            <li>
              <a href="/kontak" className="hover:text-white">
                Kontak
              </a>
            </li>
          </ul>
        </div>

        {/* Template Populer */}
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

        {/* Kontak */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
          <p className="text-white/80 text-sm mb-4">
            Jl. Graha Pena Lt. 15, Surabaya <br />
            Email: support@enotaris.com <br />
            Telp: +62 895-3661-41915
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <Linkedin size={18} />
            </a>
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
