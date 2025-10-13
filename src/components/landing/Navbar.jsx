import React, { useState } from "react";
import { useSettings } from "../../contexts/SettingContext";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({
  isAuthenticated = true, // set true agar tombol Dashboard tampil
}) => {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  const brandName = settings?.title_hero || "E-Notaris";
  const logoUrl = settings?.logo || "/images/logo-light.png";

  const itemCls =
    "block px-3 py-2 md:px-0 md:py-0 text-[#0f1d3b] font-semibold hover:text-[#0256c4] transition-colors";
  const activeFn = ({ isActive }) =>
    `${itemCls} ${isActive ? "text-[#1d77ff]" : ""}`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-[999] bg-white/90 backdrop-blur border-b border-[#eaeef7] shadow-lg shadow-blue-200">
      <nav className="mx-[30px] md:mx-[80px] py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <img
              src={logoUrl}
              alt={brandName}
              className="h-9 md:h-10 w-auto"
              loading="eager"
            />
            <span className="hidden sm:inline text-[20px] md:text-[22px] font-extrabold text-[#0f1d3b]">
              E-Notaris
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((s) => !s)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[#0f1d3b]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Center: Menu */}
          <ul
            className={`${
              open ? "flex" : "hidden"
            } md:flex flex-col md:flex-row md:items-center gap-4 md:gap-8 absolute md:static left-0 right-0 top-full md:top-auto bg-white md:bg-transparent px-6 md:px-0 py-4 md:py-0 border-t md:border-0`}
          >
            <li>
              <NavLink to="/" className={activeFn} onClick={closeMenu}>
                Beranda
              </NavLink>
            </li>
            <li>
              <NavLink to="/feature" className={activeFn} onClick={closeMenu}>
                Fitur
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className={activeFn} onClick={closeMenu}>
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink to="/track" className={activeFn} onClick={closeMenu}>
                Pelacakan
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={activeFn} onClick={closeMenu}>
                Tentang Kami
              </NavLink>
            </li>
          </ul>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/app" // konsisten: dashboard → /app
                className="bg-[#1d77ff] hover:bg-[#0f5fe6] text-white font-bold px-4 py-2 rounded-2xl transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-[#0f1d3b] text-[#0f1d3b] font-semibold hover:bg-gray-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#0f1d3b] text-white font-semibold hover:opacity-90"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right section for mobile (below menu) */}
        {open && (
          <div className="md:hidden flex items-center justify-between pt-3">
            {isAuthenticated ? (
              <Link
                to="/app"
                onClick={closeMenu}
                className="bg-[#1d77ff] hover:bg-[#0f5fe6] text-white font-bold px-4 py-2 rounded-2xl transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="px-4 py-2 rounded-xl border border-[#0f1d3b] text-[#0f1d3b] font-semibold hover:bg-gray-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="px-4 py-2 rounded-xl bg-[#0f1d3b] text-white font-semibold hover:opacity-90"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
