"use client";

import {
  BellIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService"; // pastikan path benar
import { useNavigate } from "react-router-dom";
import { showSuccess } from "../utils/toastConfig";

export default function TopBar({
  onToggleSidebar,
  theme,
  onToggleTheme,
  pageTitle = "Dashboard",
  noOfNotifications = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await authService.logout();
      showSuccess("Anda berhasil logout!");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      className="bg-white dark:bg-[#002d6a] shadow-lg px-4 md:px-6 py-3 sticky top-0 z-10"
      style={{ zIndex: "12" }}
    >
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#01043c] "
          >
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-[#f5fefd]" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f5fefd]">
            {pageTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:rounded-full dark:hover:bg-[#01043c]"
          >
            {theme === "dark" ? (
              <SunIcon className="w-6 h-6 text-yellow-300" />
            ) : (
              <MoonIcon className="w-6 h-6 text-[#f5fefd]" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:rounded-full dark:hover:bg-[#01043c]">
            <BellIcon className="w-6 h-6 text-gray-700 dark:text-[#f5fefd]" />
            {noOfNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0256c4] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {noOfNotifications}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 p-1 rounded-lg hover:rounded-full dark:hover:bg-[#01043c]"
            >
              <img
                src="/images/profile-black.png"
                alt="profile"
                className="w-9 h-9 rounded-full block dark:text-[#f5fefd] dark:hidden"
              />

              <img
                src="/images/profile-white.png"
                alt="profile"
                className="w-9 h-9 rounded-full dark:text-[#f5fefd] hidden dark:block"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-[#01043c] shadow-lg border border-gray-100 overflow-hidden py-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] dark:hover:bg-[#003782] hover:text-white hover:rounded-md duration-100 ease-in"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/app/settings-billing"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] dark:hover:bg-[#003782] hover:text-white hover:rounded-md duration-100 ease-in"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Bill History</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] hover:text-white hover:rounded-md duration-100 ease-in"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
