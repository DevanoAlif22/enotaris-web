"use client";

import { useState } from "react";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import {
  ArrowPathIcon,
  ShareIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ArrowDownIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { ArchiveBoxArrowDownIcon } from "@heroicons/react/16/solid";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  const metrics = [
    {
      title: "Total Notaris",
      value: "34.7k",
      change: "↗ 2300 (22%)",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Penghadap",
      value: "34,545",
      subtitle: "Current month",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Akta",
      value: "450",
      subtitle: "50 in hot leads",
      icon: <CircleStackIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Aktivitas Notaris",
      value: "5.6k",
      change: "↗ 300 (18%)",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
  ];

  const verificationStats = [
    { label: "Disetujui", value: "25,600", color: "text-green-600" },
    { label: "Menunggu", value: "5,600", color: "text-yellow-600" },
    { label: "Ditolak", value: "5,600", color: "text-red-600" },
  ];

  const activities = [
    {
      nomor: 1,
      kode: "FB-001",
      jenisAkta: "Akta Jual Beli",
      penghadap1: "John Doe",
      penghadap2: "Jane Doe",
      status: "Disetujui",
    },
    {
      nomor: 2,
      kode: "GA-002", // updated kode from FB-002 to GA-002
      jenisAkta: "Akta Hibah", // updated from Akta Perjanjian to Akta Hibah
      penghadap1: "Alice Smith", // updated from Ahmad Ali to Alice Smith
      penghadap2: "Bob Johnson", // updated from Siti Nurhaliza to Bob Johnson
      status: "Menunggu",
    },
    {
      nomor: 3,
      kode: "IA-003", // updated kode from FB-003 to IA-003
      jenisAkta: "Akta Waris", // updated from Akta Hibah to Akta Waris
      penghadap1: "Charlie Brown", // updated from Budi Santoso to Charlie Brown
      penghadap2: "David Wilson", // updated from Maya Sari to David Wilson
      status: "Menunggu", // updated from Ditolak to Menunggu
    },
    {
      nomor: 4,
      kode: "AF-004",
      jenisAkta: "Akta Pendirian",
      penghadap1: "Eve Davis",
      penghadap2: "Frank Miller",
      status: "Menunggu",
    },
    {
      nomor: 5,
      kode: "OR-005",
      jenisAkta: "Akta Perjanjian",
      penghadap1: "Grace Lee",
      penghadap2: "Henry Taylor",
      status: "Ditolak",
    },
  ];

  const handleRefresh = () => {
    // Logic untuk refresh data
    console.log("Refreshing data...");
    // Anda bisa menambahkan logic untuk reload data di sini
  };

  const handleShare = () => {
    // Logic untuk share
    console.log("Sharing data...");
    // Anda bisa menambahkan logic untuk share di sini
  };

  const handleMore = () => {
    // Logic untuk menu more
    console.log("More options...");
  };

  // Format tanggal hari ini
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header dengan Tanggal dan Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#002d6a] rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-600 dark:text-[#f5fefd]">
          {getCurrentDate()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-[#0256c4] rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 dark:text-[#f5fefd]" />
            <span className="hidden sm:inline dark:text-[#f5fefd]">
              Refresh Data
            </span>
          </button>
          <button
            onClick={handleShare}
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
                    console.log("Email Digests clicked");
                    setIsOpen(false);
                  }}
                  className="w-full flex text-sm items-center gap-3 px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4] dark:hover:bg-[#003782] hover:text-white hover:rounded-md duration-100 ease-in"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Email Digests
                </button>
                <button
                  onClick={() => {
                    console.log("Download clicked");
                    setIsOpen(false);
                  }}
                  className="w-full flex text-sm items-center gap-3 px-4 py-3 text-gray-700 dark:text-[#f5fefd] hover:bg-[#0256c4]  dark:hover:bg-[#003782] hover:text-white hover:rounded-md duration-100 ease-in"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
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
              {metric.change && (
                <p className="text-xs sm:text-sm ">{metric.change}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Section - Updated with AmountStats design */}
      <div className="bg-white dark:bg-[#003782] rounded-xl shadow-sm overflow-hidden">
        <div className="text-lg sm:text-xl text-gray-600 dark:text-white font-medium mt-5 ml-5">
          Verifikasi Pengguna
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {/* Disetujui Card */}
          <div className="relative p-6 bg-white dark:bg-[#003782]">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Disetujui
              </span>
            </div>
            <div className="pt-8">
              <div className="text-center text-blue-600 text-4xl font-bold mb-6 dark:text-[#f5fefd]">
                25,600
              </div>
            </div>
          </div>

          {/* Menunggu Card */}
          <div className="relative p-6 bg-white dark:bg-[#003782] ">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                Menunggu
              </span>
            </div>
            <div className="pt-8">
              <div className="text-center text-blue-600 text-4xl font-bold mb-6 dark:text-[#f5fefd]">
                5,600
              </div>
            </div>
          </div>

          {/* Ditolak Card */}
          <div className="relative p-6 bg-white dark:bg-[#003782] ">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                Ditolak
              </span>
            </div>
            <div className="pt-8">
              <div className="text-center text-blue-600 text-4xl font-bold mb-6 dark:text-[#f5fefd]">
                5,600
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center text-center">
          <button className="mt-2 mb-6 w-290 text-white font-semibold text-sm transition-colors bg-gradient-to-r from-blue-500 to-[#0256c4] sm:p-20 sm:py-2 rounded-[10px] hover:from-blue-600 hover:to-blue-700">
            Lihat Detail
          </button>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white dark:bg-[#003782] rounded-xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-4 sm:mb-6">
          Aktivitas Terkini
        </h2>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-[#7b9cc9] rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  #{activity.nomor}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === "Disetujui"
                      ? "bg-green-100 text-green-800"
                      : activity.status === "Menunggu"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Kode:</span> {activity.kode}
                </p>
                <p>
                  <span className="font-medium">Jenis:</span>{" "}
                  {activity.jenisAkta}
                </p>
                <p>
                  <span className="font-medium">Penghadap 1:</span>{" "}
                  {activity.penghadap1}
                </p>
                <p>
                  <span className="font-medium">Penghadap 2:</span>{" "}
                  {activity.penghadap2}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
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
                  Penghadap 1
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Penghadap 2
                </th>
                <th className="text-center py-3 px-4 font-medium bg-[#edf4ff] dark:bg-[#0256c4] text-[#0256c4] dark:text-[#f5fefd] text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr
                  key={index}
                  className="text-center border-b border-gray-100 hover:bg-[#002d6a] dark:text-[#f5fefd]"
                >
                  <td className="py-3 px-4 text-sm">{activity.nomor}</td>
                  <td className="py-3 px-4 text-sm">{activity.kode}</td>
                  <td className="py-3 px-4 text-sm">{activity.jenisAkta}</td>
                  <td className="py-3 px-4 text-sm">{activity.penghadap1}</td>
                  <td className="py-3 px-4 text-sm">{activity.penghadap2}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === "Disetujui"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "Menunggu"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mt-7">
            <button className="w-full h-10 rounded-md text-sm transition-colors font-medium bg-[#edf4ff] text-[#0256c4] hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-[#0256c4] dark:text-[#edf4ff] dark:bg-[#0256c4] dark:hover:bg-[#003782]">
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
