import {
  BellIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function TopBar({
  onToggleSidebar,
  theme,
  onToggleTheme,
  pageTitle = "Dashboard",
  noOfNotifications = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0b0255] shadow-lg px-4 md:px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <Bars3Icon className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {pageTitle}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme toggle */}
          <button onClick={onToggleTheme} className="p-2 rounded-lg">
            {theme === "dark" ? (
              <SunIcon className="w-6 h-6 text-yellow-300" />
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg">
            <BellIcon className="w-6 h-6 text-gray-700 dark:text-white" />
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
              className="flex items-center gap-2 p-1 rounded-lg"
            >
              <img
                src="/images/profile-black.png"
                alt="profile"
                className="w-9 h-9 rounded-full block dark:hidden"
              />
              <img
                src="/images/profile-white.png"
                alt="profile"
                className="w-9 h-9 rounded-full hidden dark:block"
              />
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-white" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-[#0b0255] shadow-lg overflow-hidden">
                <Link to="/app/settings-profile" className="block px-4 py-2">
                  Profile Settings
                </Link>
                <Link to="/app/settings-billing" className="block px-4 py-2">
                  Bill History
                </Link>
                <button
                  className="w-full text-left px-4 py-2"
                  onClick={() => (window.location.href = "/logout")}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
