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
            icon: <UserGroupIcon className="w-8 h-8 text-white" />,
          },
          {
            title: "Total Penghadap",
            value: metrics.total_penghadap,
            icon: <UserGroupIcon className="w-8 h-8 text-white" />,
          },
        ]
      : []),
    {
      title: "Total Akta",
      value: metrics.total_akta,
      icon: <CircleStackIcon className="w-8 h-8 text-white" />,
    },
    {
      title:
        role === "penghadap"
          ? "Total Aktivitas Pengguna"
          : "Total Aktivitas Notaris",
      value: metrics.total_aktivitas,
      icon: <ChartBarSquareIcon className="w-8 h-8 text-white" />,
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#002d6a] rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-600 dark:text-[#f5fefd]">
          {getCurrentDate()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 dark:text-[#f5fefd]" />
            <span className="hidden sm:inline dark:text-[#f5fefd]">
              Refresh Data
            </span>
          </button>
          <button
            onClick={() => console.log("Sharing data...")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4 dark:text-[#f5fefd]" />
            <span className="hidden sm:inline dark:text-[#f5fefd]">Share</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-full transition-colors"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600 dark:text-[#f5fefd]" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#01043c] rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-hidden">
                <button
                  onClick={() => {
                    console.log("Email Digests");
                    setIsOpen(false);
                  }}
                  className="w-full flex text-sm items-center gap-3 px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] dark:hover:bg-[#003782] hover:text-white hover:rounded-md duration-100 ease-in"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Email Digests
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner Verifikasi Notaris */}
      {role === "notaris" && metrics?.status_verifikasi && (
        <div className="bg-white dark:bg-[#003782] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-[#f5fefd] font-medium">
              Status Verifikasi Notaris
            </p>
            <span
              className={
                "px-3 py-1 rounded-full text-xs font-semibold " +
                (metrics.status_verifikasi === "approved"
                  ? "bg-green-100 text-green-800"
                  : metrics.status_verifikasi === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800")
              }
            >
              {metrics.status_verifikasi}
            </span>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-blue-500 to-[#0256c4] text-white p-4 sm:p-4 sm:py-3 rounded-[15px]"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-2">
              <h3 className="text-xs sm:text-[16px] font-medium ">
                {metric.title}
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-1">
              <div className="flex justify-between">
                <p className="text-2xl sm:text-[35px] font-bold">
                  {metric.value}
                </p>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Verifikasi (khusus Admin) */}
      {role === "admin" && (
        <div className="bg-white dark:bg-[#003782] rounded-xl shadow-sm overflow-hidden">
          <div className="text-lg sm:text-xl text-gray-600 dark:text-white font-medium mt-5 ml-5">
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
              <div
                key={v.label}
                className="relative p-6 bg-white dark:bg-[#003782]"
              >
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${v.badge}`}
                  >
                    {v.label}
                  </span>
                </div>
                <div className="pt-8">
                  <div className="text-center text-blue-600 text-4xl font-bold mb-6 dark:text-[#f5fefd]">
                    {v.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center text-center">
            <button className="mt-2 mb-6 w-290 text-white font-semibold text-sm transition-colors bg-gradient-to-r from-blue-500 to-[#0256c4] sm:p-20 sm:py-2 rounded-[10px] hover:from-blue-600 hover:to-blue-700">
              Lihat Detail
            </button>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white dark:bg-[#003782] rounded-xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-4 sm:mb-6">
          Aktivitas Terkini
        </h2>

        {/* Mobile Card */}
        <div className="block sm:hidden space-y-4">
          {recent.map((a, index) => (
            <div
              key={a.id || index}
              className="border border-gray-200 dark:border-[#7b9cc9] rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">#{index + 1}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium
                  ${
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
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Kode:</span> {a.tracking_code}
                </p>
                <p>
                  <span className="font-medium">Jenis:</span>{" "}
                  {a?.deed?.name || "-"}
                </p>
                <p>
                  <span className="font-medium">Judul:</span> {a?.name || "-"}
                </p>
              </div>
            </div>
          ))}
          {!recent.length && (
            <div className="text-center text-sm py-6 opacity-70">
              Belum ada aktivitas
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#7b9cc9]">
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Nomor
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Kode
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Jenis Akta
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Judul
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a, index) => (
                <tr
                  key={a.id || index}
                  className="text-center border-b border-gray-100 dark:hover:bg-[#002d6a] dark:text-[#f5fefd]"
                >
                  <td className="py-3 px-4 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-sm">{a.tracking_code}</td>
                  <td className="py-3 px-4 text-sm">{a?.deed?.name || "-"}</td>
                  <td className="py-3 px-4 text-sm">{a?.name || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
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
                    className="text-center text-sm py-6 opacity-70"
                  >
                    Belum ada aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-center mt-7">
            <button className="w-full h-10 rounded-md text-sm transition-colors font-medium bg-[#edf4ff] text-[#0256c4] hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-[#0256c4] dark:text-[#edf4ff] dark:bg-[#0256c4] dark:hover:bg-[#003782]">
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Memuat data…</div>}
    </div>
  );
}
