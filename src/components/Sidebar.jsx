"use client";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  Squares2X2Icon, // Dashboard
  DocumentTextIcon, // Akta Otentik
  ClipboardDocumentListIcon, // Template Akta
  UserGroupIcon, // Pengguna
  IdentificationIcon, // Verifikasi Identitas
  DocumentDuplicateIcon, // Proyek Notaris
  FolderIcon, // Proyek Penghadap
  CalendarDaysIcon, // Kalender
  ChartBarIcon, // Tracking
  PencilSquareIcon, // Blog Setting
  Cog6ToothIcon, // (cadangan) Setting
  XMarkIcon,
  UserCircleIcon, // Profile
} from "@heroicons/react/24/outline";
import { authService } from "../services/authService";

function getMenuByRole(roleId) {
  // 1=Admin, 2=Penghadap, 3=Notaris
  const common = [
    {
      id: "calendar",
      label: "Kalender",
      icon: CalendarDaysIcon,
      to: "/app/calendar",
    },
    { id: "track", label: "Tracking", icon: ChartBarIcon, to: "/app/track" },
  ];

  if (roleId === 1) {
    return [
      { id: "dashboard", label: "Dashboard", icon: Squares2X2Icon, to: "/app" },
      {
        id: "profile",
        label: "Profile",
        icon: UserCircleIcon,
        to: "/profile",
      }, // ditambahkan di bawah Dashboard
      {
        id: "akta-otentik",
        label: "Akta Otentik",
        icon: DocumentTextIcon,
        to: "/app/deed",
      },
      {
        id: "template-akta",
        label: "Template Akta",
        icon: ClipboardDocumentListIcon,
        to: "/app/template",
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
        id: "project-notaris",
        label: "Proyek Notaris",
        icon: DocumentDuplicateIcon,
        to: "/app/project-notaris",
      },
      ...common,
      { id: "blog", label: "Blog", icon: PencilSquareIcon, to: "/app/blog" },
      {
        id: "setting",
        label: "Setting",
        icon: Cog6ToothIcon,
        to: "/app/setting",
      }, // opsional
    ];
  }

  if (roleId === 3) {
    return [
      { id: "dashboard", label: "Dashboard", icon: Squares2X2Icon, to: "/app" },
      {
        id: "profile",
        label: "Profile",
        icon: UserCircleIcon,
        to: "/profile",
      }, // ditambahkan di bawah Dashboard
      {
        id: "akta-otentik",
        label: "Akta Otentik",
        icon: DocumentTextIcon,
        to: "/app/deed",
      },
      {
        id: "project-notaris",
        label: "Proyek Notaris",
        icon: DocumentDuplicateIcon,
        to: "/app/project-notaris",
      },
      ...common,
    ];
  }

  // Penghadap (2)
  return [
    { id: "dashboard", label: "Dashboard", icon: Squares2X2Icon, to: "/app" },
    {
      id: "profile",
      label: "Profile",
      icon: UserCircleIcon,
      to: "/profile",
    }, // ditambahkan di bawah Dashboard
    {
      id: "project-client",
      label: "Proyek Penghadap",
      icon: FolderIcon,
      to: "/app/project-client-notaris",
    },
    ...common,
  ];
}

export default function Sidebar({ className = "", open, onClose }) {
  const { pathname } = useLocation();
  const user = authService.getLocalUser(); // { id, role_id, ... }
  const roleId = user?.role_id;

  const menuItems = useMemo(() => getMenuByRole(roleId), [roleId]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const base =
    "fixed inset-y-0 left-0 z-40 w-72 bg-[#0256c4] dark:bg-[#002d6a] text-white flex flex-col transition-transform duration-200 h-screen overflow-y-auto";
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
