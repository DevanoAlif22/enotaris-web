import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({
  isAuthenticated = true, // set true agar tombol Dashboard tampil
  //   userName = "User",
  //   avatarUrl = "/images/user-no-profil.png",
}) => {
  const [open, setOpen] = useState(false);

  const itemCls =
    "block px-3 py-2 md:px-0 md:py-0 text-[#0f1d3b] font-semibold hover:text-[#0256c4] transition-colors";
  const activeFn = ({ isActive }) =>
    `${itemCls} ${isActive ? "text-[#1d77ff]" : ""}`;

  return (
    <header className="sticky top-0 z-[999] bg-white/90 backdrop-blur border-b border-[#eaeef7] shadow-lg shadow-blue-200">
      <nav className="mx-[30px] md:mx-[80px] py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo-light.png"
              alt="Logo"
              className="h-9 md:h-10"
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
              <NavLink to="/" className={activeFn}>
                Beranda
              </NavLink>
            </li>
            <li>
              <NavLink to="/feature" className={activeFn}>
                Fitur
              </NavLink>
            </li>
            <li>
              <NavLink to="/course" className={activeFn}>
                Kerja Sama
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className={activeFn}>
                Blog
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={activeFn}>
                Tentang Kami
              </NavLink>
            </li>
          </ul>

          {/* Right: CTA + cart */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/login"
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

            {/* <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6 text-[#0f1d3b]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6l-1-3H3" />
                <circle cx="9" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>
            </Link> */}
          </div>
        </div>

        {/* Right section for mobile (below menu) */}
        {open && (
          <div className="md:hidden flex items-center justify-between pt-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-[#1d77ff] hover:bg-[#0f5fe6] text-white font-bold px-4 py-2 rounded-2xl transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
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
              </div>
            )}

            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6 text-[#0f1d3b]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6l-1-3H3" />
                <circle cx="9" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
