"use client";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  PencilSquareIcon, // Blog (group)
  Cog6ToothIcon, // Setting
  XMarkIcon,
  UserCircleIcon, // Profile
  ChevronDownIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { authService } from "../services/authService";

function getMenuByRole(roleId) {
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
      { id: "profile", label: "Profile", icon: UserCircleIcon, to: "/profile" },
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

      // ==== BLOG GROUP (dropdown)
      {
        id: "blog-group",
        label: "Blog",
        icon: PencilSquareIcon,
        children: [
          { id: "blog-list", label: "Daftar Blog", to: "/app/blog" },
          {
            id: "blog-category",
            label: "Kategori Blog",
            to: "/app/category-blog",
          },
        ],
      },
      {
        id: "partner",
        label: "Partner Kami",
        icon: BuildingOffice2Icon,
        to: "/app/partner",
      },
      ...common,
      {
        id: "setting",
        label: "Setting",
        icon: Cog6ToothIcon,
        to: "/app/setting",
      },
    ];
  }

  if (roleId === 3) {
    return [
      { id: "dashboard", label: "Dashboard", icon: Squares2X2Icon, to: "/app" },
      { id: "profile", label: "Profile", icon: UserCircleIcon, to: "/profile" },
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
    { id: "profile", label: "Profile", icon: UserCircleIcon, to: "/profile" },
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

  // track group open states
  // const groupIds = useMemo(
  //   () => menuItems.filter((m) => m.children?.length).map((m) => m.id),
  //   [menuItems]
  // );

  const defaultOpen = useMemo(() => {
    // auto buka group yang mengandung current path
    const openObj = {};
    for (const m of menuItems) {
      if (m.children?.length) {
        openObj[m.id] = m.children.some((c) => pathname.startsWith(c.to));
      }
    }
    return openObj;
  }, [menuItems, pathname]);

  const [openGroups, setOpenGroups] = useState(defaultOpen);

  useEffect(() => setOpenGroups(defaultOpen), [defaultOpen]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const toggleGroup = (id) => {
    setOpenGroups((s) => ({ ...s, [id]: !s[id] }));
  };

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
          {menuItems.map((item) => {
            // simple link item
            if (!item.children?.length) {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-4 px-3 py-2 rounded-[8px] mb-2 transition
                    ${
                      isActive
                        ? "bg-white dark:bg-[#01043c] text-[#0256c4] dark:text-[#f5fefd] shadow font-semibold"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                  aria-current={pathname === item.to ? "page" : undefined}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                  <span className="text-[15px] font-bold">{item.label}</span>
                </NavLink>
              );
            }

            // group with children (dropdown)
            const Icon = item.icon;
            const isOpen = !!openGroups[item.id];

            return (
              <div key={item.id} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center gap-4 px-3 py-2 rounded-[8px] transition text-left 
                              ${isOpen ? "bg-white/10" : "hover:bg-white/10"}`}
                  aria-expanded={isOpen}
                  aria-controls={`group-${item.id}`}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                  <span className="text-[15px] font-bold">{item.label}</span>
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`group-${item.id}`}
                  className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="mt-1 ml-10 border-l border-white/15 pl-3">
                    {item.children.map((child) => (
                      <li key={child.id} className="mb-1">
                        <NavLink
                          to={child.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block px-2 py-1.5 rounded-md text-sm transition
                             ${
                               isActive
                                 ? "bg-white dark:bg-[#01043c] text-[#0256c4] dark:text-[#f5fefd] shadow font-semibold"
                                 : "text-white/90 hover:bg-white/10"
                             }`
                          }
                          aria-current={
                            pathname === child.to ? "page" : undefined
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
