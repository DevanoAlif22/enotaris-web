"use client";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  DocumentTextIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  IdentificationIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Squares2X2Icon, to: "/app" },
  {
    id: "akta-otentik",
    label: "Akta Otentik",
    icon: DocumentTextIcon,
    to: "/app/deed",
  },
  {
    id: "pengguna",
    label: "Pengguna",
    icon: UserGroupIcon,
    to: "/app/user",
  },
  {
    id: "verifikasi-identitas",
    label: "Verifikasi Identitas",
    icon: IdentificationIcon,
    to: "/app/verification-user",
  },
  {
    id: "aktivitas-notaris",
    label: "Proyek Notaris",
    icon: DocumentDuplicateIcon,
    to: "/app/project-notaris",
  },
  {
    id: "aktivitas-notaris-client",
    label: "Proyek Penghadap",
    icon: DocumentDuplicateIcon,
    to: "/app/project-client-notaris",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDaysIcon,
    to: "/app/calendar",
  },
];

export default function Sidebar({ className = "", open, onClose }) {
  const { pathname } = useLocation();

  // (opsional) kunci body-scroll saat drawer mobile terbuka
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const base =
    "fixed inset-y-0 left-0 z-40 w-72 bg-[#0256c4] dark:bg-[#002d6a] text-white flex flex-col " +
    "transition-transform duration-200 h-screen overflow-y-auto";
  const visible = open ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 z-30 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      />

      {/* Drawer / Fixed sidebar */}
      <aside
        className={`${base} ${visible} lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 ${className}`}
        aria-label="Sidebar navigasi"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              className="w-10 h-10 rounded-xl"
              src="/images/logo-light.png"
              alt="Logo E-Notaris"
            />
            <span className="text-[20px] font-bold tracking-wide">
              E-Notaris
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            aria-label="Tutup sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 pb-6 mt-5">
          {menuItems.map(({ id, label, icon: Icon, to }) => (
            <NavLink
              key={id}
              to={to}
              end={to === "/app"}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-4 px-3 py-2 rounded-[8px] mb-2 transition
                 ${
                   isActive
                     ? "bg-white dark:bg-[#01043c] text-[#0256c4] dark:text-[#f5fefd] shadow font-semibold"
                     : "text-white hover:bg-white/10"
                 }`
              }
              aria-current={pathname === to ? "page" : undefined}
            >
              {Icon && <Icon className="h-6 w-6" />}
              <span className="text-[15px] font-bold">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
