// components/track/TrackResult.jsx
import {
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

export default function TrackResult({ res, progress }) {
  const data = res?.data;
  const activity = data?.activity;
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const current = data?.current_step;

  return (
    <div className="space-y-6">
      {/* jika tidak ada steps */}
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

      {/* meta aktivitas */}
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
            value={<span className="font-mono">{activity.tracking_code}</span>}
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

      {/* progress */}
      {!!steps.length && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[#0f1d3b]">Progres</p>
            <p className="text-sm font-semibold text-[#0f1d3b]">
              {progress.percent}%
            </p>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-[#0256c4] to-[#002d6a] transition-all"
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

      {/* steps list */}
      {!!steps.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <StepCard
              key={s.key ?? i}
              index={i + 1}
              label={s.label}
              status={s.status}
              highlight={current?.key === s.key}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, value, pill = false, pillColor }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-[#e9eefb]">
      {title && (
        <div className="flex items-center gap-3 mb-1">
          {icon}
          <p className="text-sm font-medium text-gray-700">{title}</p>
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
          <p className="text-gray-900 font-semibold break-words">
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
      className={`rounded-xl p-4 border transition ${
        highlight ? "border-blue-300 bg-blue-50/60" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="font-semibold text-[#0f1d3b]">
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
