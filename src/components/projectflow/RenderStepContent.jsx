// components/projectflow/RenderStepContent.jsx
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Pill from "../../utils/Pill";

export default function renderStepContent(stepId, status, actions = {}) {
  const {
    markDone,
    onSchedule,
    onViewSchedule,
    onMarkDocsDone,
    onOpenAddRequirement, // ⬅️ baru: buka modal tambah persyaratan
    permissions = {},
    activity,
    clients = [],
    currentUserId,
    requirementList = [],
    onDeleteRequirement,
  } = actions;

  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const primaryButton = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`;
  const secondaryButton = `${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  const canMarkDone = permissions.canMarkDone ?? true;
  const docsPerm = permissions.docs || { canSelectAnyParty: true };

  const RejectNotice =
    status === "reject" ? (
      <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
        <XCircleIcon className="w-5 h-5 mt-0.5" />
        <span>
          Step ini berstatus <b>Ditolak</b>. Perlu tindakan perbaikan sebelum
          dilanjutkan.
        </span>
      </div>
    ) : null;

  switch (stepId) {
    case "docs":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">
                {docsPerm.canSelectAnyParty
                  ? "Data & Dokumen Semua Penghadap"
                  : `Data & Dokumen`}
              </h4>
              {docsPerm.canSelectAnyParty ? (
                <Link
                  to={`/app/requirement-notaris/${activity?.id}`}
                  className={secondaryButton}
                >
                  Buka Form
                </Link>
              ) : (
                (() => {
                  const me = clients.find((c) => c.id === currentUserId);
                  return (
                    <Link
                      to={`/app/requirement/${activity?.id}`}
                      className={secondaryButton}
                    >
                      {`Buka Form ${me?.name ? `(${me.name})` : ""}`}
                    </Link>
                  );
                })()
              )}
              {/* daftar persyaratan (lengkap & bisa dihapus, khusus notaris) */}
              {docsPerm.canSelectAnyParty && requirementList.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-700 mb-2">
                    Kelola persyaratan:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requirementList.map((req) => (
                      <span
                        key={req.id}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                        title={req.name}
                      >
                        {req.name}
                        {typeof onDeleteRequirement === "function" && (
                          <button
                            onClick={() =>
                              onDeleteRequirement(req.id, req.name)
                            }
                            className="ml-1 text-red-500 hover:text-red-700 font-bold focus:outline-none"
                            title="Hapus"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {status === "todo" && (
            <div className="flex gap-3">
              <button
                className={primaryButton}
                onClick={() => onMarkDocsDone?.("docs")}
              >
                Tandai Selesai
              </button>
              {/* Tombol Tambah Persyaratan (khusus notaris) */}
              {docsPerm.canSelectAnyParty &&
                typeof onOpenAddRequirement === "function" && (
                  <button
                    type="button"
                    onClick={onOpenAddRequirement}
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    title="Tambah Persyaratan"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Tambah Persyaratan
                  </button>
                )}
            </div>
          )}
        </div>
      );

    // ——— case lain tetap sama (invite/respond/draft/schedule/sign/print) ———
    case "invite":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Pengiriman undangan kepada penghadap telah selesai / dapat
              dikelola dari menu undangan.
            </p>
          </div>
        </div>
      );

    case "respond":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="space-y-3">
            {clients.map((c) => {
              const s = (c.pivot?.status_approval || "").toLowerCase();
              const boxClass =
                s === "approved"
                  ? "bg-green-50 border-green-200"
                  : s === "rejected"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200";
              const icon =
                s === "approved" ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : s === "rejected" ? (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-amber-600" />
                );
              const label =
                s === "approved"
                  ? "Disetujui"
                  : s === "rejected"
                  ? "Ditolak"
                  : "Menunggu";
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${boxClass}`}
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-medium">
                      {c.name || c.email || `#${c.id}`}
                    </span>
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

    case "draft":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Unggah atau buat draft akta untuk direview oleh para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Lihat Draft</button>
            {!permissions?.draft?.readOnly && status !== "reject" && (
              <>
                <button className={secondaryButton}>Unggah Draft</button>
                {canMarkDone && (
                  <button
                    className={primaryButton}
                    onClick={() => markDone?.("draft")}
                  >
                    Tandai Selesai
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );

    case "schedule":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Jadwalkan sesi pembacaan akta dengan para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton} onClick={onViewSchedule}>
              Lihat Jadwal
            </button>
            {permissions?.schedule?.canEdit && status !== "reject" && (
              <>
                <button className={secondaryButton} onClick={onSchedule}>
                  Jadwalkan
                </button>
                {canMarkDone && (
                  <button
                    className={primaryButton}
                    onClick={() => markDone?.("schedule")}
                  >
                    Tandai Selesai
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );

    case "sign":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Kelola proses tanda tangan para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            {canMarkDone && status !== "reject" && (
              <>
                <button className={secondaryButton}>Rekam Tanda Tangan</button>
                <button
                  className={primaryButton}
                  onClick={() => markDone?.("sign")}
                >
                  Tandai Selesai
                </button>
              </>
            )}
          </div>
        </div>
      );

    case "print":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Cetak dan arsipkan akta yang telah final.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Unduh PDF Final</button>
            {canMarkDone && status !== "reject" && (
              <button
                className={primaryButton}
                onClick={() => markDone?.("print")}
              >
                Tandai Selesai
              </button>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
