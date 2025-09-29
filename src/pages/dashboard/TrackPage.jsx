"use client";
import { useMemo, useState } from "react";
import { trackService } from "../../services/trackService";
import { showError } from "../../utils/toastConfig";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const STATUS_MAP = {
  done: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  todo: { bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-400" },
  rejected: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
};

const statusStyle = (s) =>
  STATUS_MAP[(s || "").toLowerCase()] || STATUS_MAP.todo;

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null); // response.data

  const progress = useMemo(() => {
    if (!res?.data) return { percent: 0, is_done: false };
    return {
      percent: res.data.progress_percent ?? 0,
      is_done: !!res.data.is_done,
    };
  }, [res]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setLoading(true);
      const out = await trackService.lookup(code.trim());
      setRes(out);
    } catch (err) {
      setRes(null);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const data = res?.data;
  const activity = data?.activity;
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const current = data?.current_step;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#002d6a] rounded-xl p-4 shadow-sm">
        <h1 className="text-xl font-semibold dark:text-[#f5fefd]">
          Lacak Progres Aktivitas
        </h1>
        <p className="text-sm text-gray-500 dark:text-[#f5fefd]">
          Masukkan <span className="font-mono font-medium">tracking_code</span>{" "}
          untuk melihat status tiap langkah.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Mis. ACT-XXXXXX"
            className="flex-1 rounded-md border px-3 py-2 dark:bg-[#002d6a] dark:text-[#f5fefd]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-500 to-[#0256c4] hover:from-blue-600 hover:to-[#014ea7] disabled:opacity-60"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            {loading ? "Mencari…" : "Cari"}
          </button>
        </form>
      </div>

      {/* Result */}
      {res && (
        <div className="bg-white dark:bg-[#002d6a] rounded-xl p-4 shadow-sm space-y-6">
          {/* Jika tidak ada track */}
          {Array.isArray(steps) && steps.length === 0 && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-yellow-50 text-yellow-800">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <div>
                <p className="font-medium">Track belum tersedia</p>
                <p className="text-sm">
                  Aktivitas ditemukan, namun langkah pelacakan belum dibuat.
                </p>
              </div>
            </div>
          )}

          {/* Activity meta */}
          {activity && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard
                icon={<DocumentTextIcon className="w-5 h-5 text-blue-500" />}
                title="Judul Aktivitas"
                value={activity.name || "-"}
              />
              <InfoCard
                icon={<UserIcon className="w-5 h-5 text-purple-500" />}
                title="Notaris"
                value={activity.notaris || "-"}
              />
              <InfoCard
                icon={<TagIcon className="w-5 h-5 text-orange-500" />}
                title="Tracking Code"
                value={
                  <span className="font-mono">{activity.tracking_code}</span>
                }
              />
              <InfoCard title="Jenis Akta" value={activity.deed || "-"} />
              <InfoCard
                title="Status Persetujuan Klien"
                value={capitalize(activity.status_approval || "-")}
                pill
                pillColor={pillForApproval(activity.status_approval)}
              />
            </div>
          )}

          {/* Progress bar */}
          {!!steps.length && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium dark:text-[#f5fefd]">
                  Progres
                </p>
                <p className="text-sm font-semibold dark:text-[#f5fefd]">
                  {progress.percent}%
                </p>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-blue-500 to-[#0256c4] transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              {progress.is_done ? (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-50 text-green-700 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  Selesai
                </div>
              ) : current ? (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm">
                  Langkah aktif: <b>{current.label}</b> ({current.status})
                </div>
              ) : null}
            </div>
          )}

          {/* Steps timeline/cards */}
          {!!steps.length && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {steps.map((s, i) => (
                <StepCard
                  key={s.key}
                  index={i + 1}
                  label={s.label}
                  status={s.status}
                  highlight={current?.key === s.key}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, value, pill = false, pillColor }) {
  return (
    <div className="bg-gray-50 dark:bg-[#01043c] rounded-2xl p-4">
      {title && (
        <div className="flex items-center gap-3 mb-1">
          {icon}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </p>
        </div>
      )}
      <div className="mt-1">
        {pill ? (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${pillColor}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-gray-900 dark:text-white font-semibold break-words">
            {value ?? "-"}
          </p>
        )}
      </div>
    </div>
  );
}

function StepCard({ index, label, status, highlight }) {
  const s = (status || "").toLowerCase();
  const style = statusStyle(s);

  const icon =
    s === "done" ? (
      <CheckCircleIcon className="w-5 h-5 text-green-600" />
    ) : s === "rejected" ? (
      <XCircleIcon className="w-5 h-5 text-red-600" />
    ) : (
      <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
    );

  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight
          ? "border-blue-300 bg-blue-50/40 dark:border-blue-400/40"
          : "border-gray-100 dark:border-gray-600 bg-white dark:bg-[#002d6a]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="font-semibold dark:text-[#f5fefd]">
            {index}. {label}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
        >
          {capitalize(status || "-")}
        </span>
      </div>
    </div>
  );
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

function pillForApproval(status) {
  const st = (status || "").toLowerCase();
  if (st === "approved") return "bg-green-100 text-green-800";
  if (st === "rejected") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}
