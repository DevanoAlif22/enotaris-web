"use client";

import { useEffect, useMemo, useState } from "react";
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
      console.error(e?.message || e);
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
              <UserGroupIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ),
          },
          {
            title: "Total Penghadap",
            value: metrics.total_penghadap,
            icon: (
              <UserGroupIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            ),
          },
        ]
      : []),
    {
      title: "Total Akta",
      value: metrics.total_akta,
      icon: <CircleStackIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    },
    {
      title:
        role === "penghadap"
          ? "Total Aktivitas Pengguna"
          : "Total Aktivitas Notaris",
      value: metrics.total_aktivitas,
      icon: <ChartBarSquareIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    },
  ];

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
  };

  const chartData = useMemo(() => {
    // fallback dummy bila tidak ada data; panjang 12 bulan
    const base = [5, 9, 7, 14, 10, 13, 15, 12, 16, 18, 14, 19];
    return base;
  }, []);

  const buildPath = (data, width, height, padX = 16, padY = 16) => {
    if (!data?.length) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const len = data.length - 1;
    const w = width - padX * 2;
    const h = height - padY * 2;

    const toPoint = (i, v) => {
      const x = padX + (w * i) / len;
      const nv = max === min ? 0 : (v - min) / (max - min);
      const y = padY + h - nv * h;
      return [x, y];
    };

    let d = "";
    data.forEach((v, i) => {
      const [x, y] = toPoint(i, v);
      d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });
    return d;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Date */}
      <span className="flex items-start justify-between pl-5 font-bold text-2xl mt-4 mb-4 py-2 rounded-lg sm:text-xl text-white bg-gradient-to-r from-blue-500 to-[#0256c4]">
        {getCurrentDate()}
      </span>

      {/* Header */}
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={() => console.log("Sharing data...")}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-700 dark:text-[#f5fefd]" />
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

      {/* Stats & Analytics */}
      {role === "penghadap" || role === "notaris" ? (
        <section className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 md:gap-6 items-stretch">
          {/* Kiri: 2 kartu (2 baris × 1 kolom) */}
          <div className="space-y-4 flex flex-col">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-[#f5fefd]">
              Statistik dan Analitis
            </h2>
            <div className="grid grid-rows-2 gap-3 sm:gap-4 auto-rows-fr flex-1">
              {metricCards.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-blue-500 to-[#0256c4] rounded-2xl p-5 sm:p-5 shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a] flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between w-full">
                    <p className="text-[14px] sm:text-[14px] sm:p-1 text-[#f5fefd]">
                      {m.title}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-xl">
                      {m.icon}
                    </span>
                  </div>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#f5fefd]">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Grafik */}
          <div className="space-y-3 flex flex-col">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-[#f5fefd]">
              Grafik Aktivitas Bulanan
            </h2>

            {/* HAPUS flex-1 di sini */}
            <div className="bg-white dark:bg-[#003782] rounded-2xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a] flex flex-col">
              <div className="text-[11px] sm:text-xs text-right text-gray-500 dark:text-[#cfe0ff] mb-2">
                2025
              </div>

              {/* GANTI h-full jadi tinggi fix */}
              <div className="w-full h-48 sm:h-56 lg:h-[260px]">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <path
                    d={`${buildPath(chartData, 400, 200)} L 384,184 L 16,184 Z`}
                    fill="url(#areaFill)"
                    stroke="none"
                  />
                  <path
                    d={buildPath(chartData, 400, 200)}
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16"
                    y1="184"
                    x2="384"
                    y2="184"
                    stroke="rgba(2,86,196,0.2)"
                  />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#0256c4" />
                    </linearGradient>
                    <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(2,86,196,0.25)" />
                      <stop offset="100%" stopColor="rgba(2,86,196,0.02)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // layout lama kamu untuk admin/notaris (biarkan seperti semula)
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Kiri: Kartu metrik (2 baris x 2) */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-[#f5fefd]">
              Statistik dan Analitis
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {metricCards.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-blue-500 to-[#0256c4] rounded-2xl p-5 sm:p-5 shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a] min-h-[160px] sm:min-h-[135px] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between w-full">
                    <p className="text-[14px] sm:text-[14px] sm:p-1 text-[#f5fefd]">
                      {m.title}
                    </p>
                    <span className="inline-flex items-center justify-center rounded-xl">
                      {m.icon}
                    </span>
                  </div>
                  <p className="text-4xl sm:text-5xl font-extrabold text-[#f5fefd]">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Card grafik */}
          <div className="space-y-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-[#f5fefd]">
              Grafik Aktivitas Bulanan
            </h2>
            <div className="bg-white dark:bg-[#003782] rounded-2xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a]">
              <div className="text-[11px] sm:text-xs text-right text-gray-500 dark:text-[#cfe0ff] mb-2">
                2025
              </div>
              <div className="w-full h-48 sm:h-56">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <path
                    d={`${buildPath(chartData, 400, 200)} L 384,184 L 16,184 Z`}
                    fill="url(#areaFill)"
                    stroke="none"
                  />
                  <path
                    d={buildPath(chartData, 400, 200)}
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16"
                    y1="184"
                    x2="384"
                    y2="184"
                    stroke="rgba(2,86,196,0.2)"
                  />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#0256c4" />
                    </linearGradient>
                    <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(2,86,196,0.25)" />
                      <stop offset="100%" stopColor="rgba(2,86,196,0.02)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Banner Verifikasi Notaris */}
      {role === "notaris" && metrics?.status_verifikasi && (
        <div className="bg-white dark:bg-[#003782] rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100/60 dark:border-[#002d6a]">
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

      {/* Section Verifikasi (Admin only) */}
      {role === "admin" && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-[#f5fefd]">
            Verifikasi Pengguna
          </h2>
          <div className="bg-white dark:bg-[#003782] rounded-2xl shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a] overflow-hidden">
            {/* GRID 3 BUBBLE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-7 gap-4 sm:gap-6">
              {[
                {
                  label: "Disetujui",
                  value: verifikasi?.approved ?? 0,
                  badgeClass: "bg-green-50 text-green-700 ring-green-600/20",
                },
                {
                  label: "Menunggu",
                  value: verifikasi?.pending ?? 0,
                  badgeClass: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
                },
                {
                  label: "Ditolak",
                  value: verifikasi?.rejected ?? 0,
                  badgeClass: "bg-red-50 text-red-700 ring-red-600/10",
                },
              ].map((v) => (
                <div
                  key={v.label}
                  className="p-5 sm:p-6 bg-[#edf4ff] dark:bg-[#002d6a] rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-default border border-gray-200 dark:border-[#002d6a]"
                >
                  <div className="flex items-center justify-between h-full">
                    {/* Sisi Kiri: Label */}
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-[3px] text-sm font-bold ${v.badgeClass} shadow-md`}
                    >
                      {v.label}
                    </span>

                    {/* Sisi Kanan: Nilai (Value) */}
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0b3a82] dark:text-white transition-colors duration-300">
                      {v.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTON DETAIL DI BAWAH GRID */}
            <div className="px-5 sm:px-6 pt-0 pb-4 sm:pb-6">
              <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-[#f5fefd] bg-gradient-to-r from-blue-500 to-[#0256c4] hover:from-blue-600 hover:to-blue-700 transition-colors ">
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-3 sm:mb-4">
        Aktivitas Terkini
      </h2>
      <div className="relative bg-white dark:bg-[#003782] rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_8px_24px_rgba(2,86,196,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-gray-100/60 dark:border-[#002d6a] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl"
        />

        {/* Mobile Card */}
        <div className="block lg:hidden space-x-3 sm:space-x-4 space-y-3 sm:space-y-4">
          {recent.map((a, index) => (
            <div
              key={a.id || index}
              className="border border-gray-200 dark:border-[#7b9cc9] rounded-xl p-3.5 sm:p-4 bg-white/70 dark:bg-[#002d6a]/40 transition-shadow hover:shadow-md hover:border-blue-300/60"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-[#f5fefd]">
                  #{index + 1}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    a.status_approval === "approved"
                      ? "bg-green-100 text-green-800"
                      : a.status_approval === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
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
            <div className="rounded-xl border border-dashed border-gray-200 dark:border-[#7b9cc9]/60 p-6 text-center text-xs sm:text-sm bg-white/60 dark:bg-[#002d6a]/40">
              <svg
                viewBox="0 0 24 24"
                className="mx-auto mb-2 h-6 w-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h8m-8 4h5m3 8H6a2 2 0 01-2-2V7a2 2 0 012-2h7l5 5v9a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 dark:text-[#cfe0ff]">
                Belum ada aktivitas. Aktivitas baru akan muncul di sini.
              </p>
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
