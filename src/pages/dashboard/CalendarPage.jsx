"use client";
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarDaysIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  DocumentTextIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { scheduleUserService } from "../../services/scheduleUserService";
import { showError } from "../../utils/toastConfig";

// ===== Helpers: normalisasi tanggal dari API =====
const getDateOnly = (isoZ) => (isoZ || "").slice(0, 10); // "YYYY-MM-DD"
const buildStartISO = (dateIsoZ, hhmm) => {
  // bangun ISO lokal TANPA "Z" agar tidak bergeser timezone
  const d = getDateOnly(dateIsoZ); // "2025-09-19"
  const t = hhmm && /^\d{2}:\d{2}$/.test(hhmm) ? hhmm : "00:00";
  return `${d}T${t}:00`;
};

const pickColor = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("client"))
    return {
      bg: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
      border: "#f59e0b",
      text: "#ffffff",
      dot: "#fbbf24",
    };
  if (t.includes("product"))
    return {
      bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      border: "#10b981",
      text: "#ffffff",
      dot: "#34d399",
    };
  if (t.includes("meeting") || t.includes("rapat"))
    return {
      bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      border: "#3b82f6",
      text: "#ffffff",
      dot: "#60a5fa",
    };
  return {
    bg: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    border: "#6b7280",
    text: "#ffffff",
    dot: "#9ca3af",
  };
};

const toCalendarEvent = (row) => {
  const title = row?.activity?.name || row?.notes || "Jadwal";
  const color = pickColor(title);
  return {
    id: String(row.id),
    title,
    start: buildStartISO(row.date, row.time), // <- aman timezone
    allDay: !row.time,
    extendedProps: row,
    backgroundColor: color.bg,
    borderColor: color.border,
    textColor: color.text,
  };
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, row: null });

  const loadEvents = useMemo(
    () => async () => {
      try {
        setLoading(true);
        const res = await scheduleUserService.index({ per_page: 1000 });
        const rows = Array.isArray(res?.data) ? res.data : [];
        setEvents(rows.map(toCalendarEvent));
      } catch (e) {
        showError(e.message || "Gagal memuat jadwal");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onEventClick = (clickInfo) => {
    setDialog({ open: true, row: clickInfo?.event?.extendedProps || null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Kalender Jadwal
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Kelola dan lihat semua jadwal aktivitas Anda
          </p>
        </div>

        {/* Calendar Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden">
          <div className="p-6">
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "today",
                }}
                firstDay={0}
                events={events}
                eventClick={onEventClick}
                eventDisplay="block"
                fixedWeekCount={false}
                dayMaxEvents={3}
                moreLinkClick="popover"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
                eventContent={(arg) => {
                  const r = arg.event.extendedProps;
                  const color = pickColor(arg.event.title);
                  return (
                    <div
                      className="p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105 bg-[#0256c4] dark:bg-[#002d6a]"
                      style={{
                        border: `1px solid ${color.border}`,
                        color: color.text,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">
                            {arg.timeText && (
                              <span className="opacity-90">
                                {arg.timeText}{" "}
                              </span>
                            )}
                            {arg.event.title}
                          </div>
                          {r?.location && (
                            <div className="text-xs opacity-75 truncate mt-1 flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {r.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Memuat jadwal...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialog.open && (
        <EnhancedDialog
          row={dialog.row}
          onClose={() => setDialog({ open: false, row: null })}
        />
      )}
    </div>
  );
}

// ===== Enhanced Dialog Component =====
function EnhancedDialog({ row, onClose }) {
  if (!row) return null;

  const localDate = getDateOnly(row.date);
  //   const color = pickColor(row?.activity?.name || row?.notes || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden transform transition-all">
        {/* Header with gradient */}
        <div className="px-6 py-4 text-white relative bg-[#0256c4] dark:bg-[#002d6a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CalendarDaysIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Detail Jadwal</h3>
            </div>
            <button
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              onClick={onClose}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul Kegiatan
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {row?.activity?.name || row?.notes || "Tidak ada judul"}
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold truncate">
                    {localDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Waktu
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold truncate">
                    {row?.time || "Sepanjang hari"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {row?.location && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lokasi
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {row.location}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 gap-4">
            {row?.activity?.notaris?.name && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notaris
                    </p>
                    <p className="text-gray-900 dark:text-white font-semibold truncate">
                      {row.activity.notaris.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {row?.activity?.tracking_code && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kode Aktivitas
                    </p>
                    <p className="text-gray-900 dark:text-white font-semibold font-mono truncate">
                      {row.activity.tracking_code}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
