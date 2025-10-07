"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";

// Icons
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import {
  ArrowPathIcon,
  ShareIcon,
  EnvelopeIcon,
  EllipsisHorizontalIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // data dari API
  const [role, setRole] = useState(""); // "admin" | "notaris" | "penghadap"
  const [metrics, setMetrics] = useState({
    total_notaris: 0,
    total_penghadap: 0,
    total_akta: 0,
    total_aktivitas: 0,
    status_verifikasi: null, // utk notaris
  });
  const [verifikasi, setVerifikasi] = useState(null); // {approved,pending,rejected} (admin only)
  const [recent, setRecent] = useState([]); // aktivitas terkini

  const load = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getData();
      setRole(res?.role || "");
      setMetrics({
        total_notaris: res?.metrics?.total_notaris ?? 0,
        total_penghadap: res?.metrics?.total_penghadap ?? 0,
        total_akta: res?.metrics?.total_akta ?? 0,
        total_aktivitas: res?.metrics?.total_aktivitas ?? 0,
        status_verifikasi: res?.metrics?.status_verifikasi ?? null,
      });
      setVerifikasi(res?.verifikasi || null);
      setRecent(
        Array.isArray(res?.recent_activities) ? res.recent_activities : []
      );
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // kartu metrik
  const metricCards = [
    ...(role === "admin"
      ? [
          {
            title: "Total Notaris",
            value: metrics.total_notaris,
            icon: (
              <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ),
          },
          {
            title: "Total Penghadap",
            value: metrics.total_penghadap,
            icon: (
              <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ),
          },
        ]
      : []),
    {
      title: "Total Akta",
      value: metrics.total_akta,
      icon: <CircleStackIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
    },
    {
      title:
        role === "penghadap"
          ? "Total Aktivitas Pengguna"
          : "Total Aktivitas Notaris",
      value: metrics.total_aktivitas,
      icon: <ChartBarSquareIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
    },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Date */}
      <span className="flex items-start justify-between pl-5 font-bold text-2xl mt-4 mb-4 py-2 rounded-lg sm:text-sm text-white bg-gradient-to-r from-blue-500 to-[#0256c4]">
        {getCurrentDate()}
      </span>

      {/* Header */}
      <div className="bg-white dark:bg-[#002d6a] rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-[#f5fefd] hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={() => console.log("Sharing data...")}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-[#f5fefd] hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-[#f5fefd]" />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#01043c] rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      console.log("Email Digests");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] dark:hover:bg-[#003782] hover:text-white duration-100 ease-in text-left"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    Email Digests
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Verifikasi Notaris */}
      {role === "notaris" && metrics?.status_verifikasi && (
        <div className="bg-white dark:bg-[#003782] rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-[#f5fefd]">
              Status Verifikasi Notaris
            </p>
            <span
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                metrics.status_verifikasi === "approved"
                  ? "bg-green-100 text-green-800"
                  : metrics.status_verifikasi === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {metrics.status_verifikasi}
            </span>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-blue-500 to-[#0256c4] text-white p-4 sm:p-5 rounded-[15px] min-h-[100px] sm:min-h-[120px]"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm md:text-base font-medium leading-tight pr-2">
                {metric.title}
              </h3>
            </div>
            <div className="flex justify-between items-end">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {metric.value}
              </p>
              <div className="flex-shrink-0">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Verifikasi (Admin only) */}
      {role === "admin" && (
        <div className="bg-white dark:bg-[#003782] rounded-xl shadow-sm overflow-hidden">
          <div className="text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-white px-4 sm:px-6 py-3 sm:py-4">
            Verifikasi Pengguna
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
            {[
              {
                label: "Disetujui",
                value: verifikasi?.approved ?? 0,
                badge: "bg-green-50 text-green-700 ring-green-600/20",
              },
              {
                label: "Menunggu",
                value: verifikasi?.pending ?? 0,
                badge: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
              },
              {
                label: "Ditolak",
                value: verifikasi?.rejected ?? 0,
                badge: "bg-red-50 text-red-700 ring-red-600/10",
              },
            ].map((v) => (
              <div key={v.label} className="relative p-4 sm:p-6">
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${v.badge}`}
                  >
                    {v.label}
                  </span>
                </div>
                <div className="pt-8 sm:pt-10 text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2 text-blue-600 dark:text-[#f5fefd]">
                    {v.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 sm:px-6">
            <button className="w-full mt-4 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-[#0256c4] hover:from-blue-600 hover:to-blue-700 transition-colors">
              Lihat Detail
            </button>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white dark:bg-[#003782] rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-3 sm:mb-4 md:mb-6">
          Aktivitas Terkini
        </h2>

        {/* Mobile Card */}
        <div className="block lg:hidden space-y-3">
          {recent.map((a, index) => (
            <div
              key={a.id || index}
              className="border border-gray-200 dark:border-[#7b9cc9] rounded-lg p-3 sm:p-4"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-[#f5fefd]">
                  #{index + 1}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    a.status_approval === "approved"
                      ? "bg-green-100 text-green-800"
                      : a.status_approval === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {a.status_approval || "pending"}
                </span>
              </div>
              <div className="space-y-1 text-xs sm:text-sm dark:text-[#f5fefd]">
                <p>
                  <span className="font-medium">Kode:</span> {a.tracking_code}
                </p>
                <p>
                  <span className="font-medium">Jenis:</span>{" "}
                  {a?.deed?.name || "-"}
                </p>
                <p className="break-words">
                  <span className="font-medium">Judul:</span> {a?.name || "-"}
                </p>
              </div>
            </div>
          ))}
          {!recent.length && (
            <div className="text-center text-xs sm:text-sm py-6 sm:py-8 opacity-70 dark:text-[#f5fefd]">
              Belum ada aktivitas
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#7b9cc9]">
                {["Nomor", "Kode", "Jenis Akta", "Judul", "Status"].map(
                  (th) => (
                    <th
                      key={th}
                      className="text-center py-3 px-4 font-medium text-sm bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd]"
                    >
                      {th}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recent.map((a, index) => (
                <tr
                  key={a.id || index}
                  className="text-center border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-[#002d6a] dark:text-[#f5fefd]"
                >
                  <td className="py-3 px-4 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-sm">{a.tracking_code}</td>
                  <td className="py-3 px-4 text-sm">{a?.deed?.name || "-"}</td>
                  <td className="py-3 px-4 text-sm">{a?.name || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status_approval === "approved"
                          ? "bg-green-100 text-green-800"
                          : a.status_approval === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {a.status_approval || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-sm py-6 opacity-70 dark:text-[#f5fefd]"
                  >
                    Belum ada aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-0 sm:px-0">
          <button className="w-full mt-4 mb-2 sm:mb-0 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-[#0256c4] hover:from-blue-600 hover:to-blue-700 transition-colors">
            Lihat Detail
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-[#f5fefd]">
          Memuat data…
        </div>
      )}
    </div>
  );
}
