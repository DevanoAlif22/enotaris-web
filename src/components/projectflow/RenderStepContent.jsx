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
    onOpenAddRequirement,
    permissions = {},
    activity,
    clients = [],
    currentUserId,
    requirementList = [],
    onDeleteRequirement,

    // draft props
    isNotary = false,
    myDraftStatus = "",
    onApproveDraft,
    onRejectDraft,
    draftApprovals = [],
    onUploadDraft, // <- handler upload dipass dari page
  } = actions;

  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const primaryButton = `${buttonClass} inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c] dark:bg-gradient-to-r from-blue-500 to-[#0256c4]`;
  const secondaryButton = `${buttonClass} inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]`;

  const approveButton = `${buttonClass} bg-green-500 text-white hover:bg-green-600`;
  const rejectButton = `${buttonClass} bg-red-500 text-white hover:bg-red-600`;

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

  // helper: tombol upload (dipakai notaris & klien)
  const UploadButton = ({ label = "Unggah Draft" }) => (
    <label className={secondaryButton}>
      {label}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.odt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && typeof onUploadDraft === "function") onUploadDraft(file);
          // reset value biar bisa upload file yang sama lagi kalau perlu
          e.target.value = "";
        }}
      />
    </label>
  );

  switch (stepId) {
    case "docs":
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2 dark:text-[#f5fefd]">
                {docsPerm.canSelectAnyParty
                  ? "Data & Dokumen Semua Penghadap"
                  : `Data & Dokumen`}
              </h4>
              {docsPerm.canSelectAnyParty ? (
                <Link
                  to={`/app/requirement-notaris/${activity?.id}`}
                  className={primaryButton}
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

              {docsPerm.canSelectAnyParty && requirementList.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
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
              {docsPerm.canSelectAnyParty &&
                typeof onOpenAddRequirement === "function" && (
                  <button
                    type="button"
                    onClick={onOpenAddRequirement}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]"
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

    case "draft": {
      const hasDraftFile = Boolean(
        activity?.draft?.file || activity?.draft?.file_path
      );
      const draftFileUrl = activity?.draft?.file || "";

      // Tombol link ke file draft (preview/download)
      const DraftLinkButton = ({
        label = "Lihat Draft",
        downloadFile = false,
      }) => {
        const disabled = !hasDraftFile || !draftFileUrl;
        return (
          <a
            href={disabled ? undefined : draftFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${secondaryButton} ${
              disabled ? "opacity-50 pointer-events-none" : ""
            }`}
            title={disabled ? "Belum ada file draft" : "Buka draft (PDF)"}
            {...(downloadFile ? { download: true } : {})}
          >
            {label}
          </a>
        );
      };

      return (
        <div className="space-y-4">
          {RejectNotice}

          {/* Info singkat */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Unggah atau buat draft akta untuk direview oleh para pihak.
            </p>

            {!hasDraftFile && (
              <div className="mt-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                Draft sedang dibuat. Silakan menunggu notaris generate file
                draft.
              </div>
            )}
          </div>

          {/* Ringkasan status persetujuan semua penghadap */}
          {draftApprovals?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium dark:text-[#f5fefd]">
                Status Persetujuan Draft:
              </div>
              <div className="space-y-2">
                {draftApprovals.map((cd) => {
                  const s = (cd.status_approval || "").toLowerCase();
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
                  const fallback =
                    clients.find?.((c) => c.id === cd.user_id)?.name ||
                    clients.find?.((c) => c.id === cd.user_id)?.email ||
                    cd?.user?.name ||
                    cd?.user?.email ||
                    `#${cd.user_id}`;

                  return (
                    <div
                      key={cd.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${boxClass}`}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span className="font-medium">{fallback}</span>
                      </div>
                      <span className="text-sm">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Aksi */}
          <div className="flex flex-wrap gap-3">
            {/* NOTARIS */}
            {isNotary && (
              <>
                {/* Lihat Draft (Editor) disembunyikan bila step draft sudah 'done' */}
                {status !== "done" && (
                  <Link
                    to={`/app/project-flow/draft/${activity?.id}`}
                    className={secondaryButton}
                  >
                    Lihat Draft (Editor)
                  </Link>
                )}

                {/* Link ke file PDF bila tersedia */}
                {hasDraftFile && (
                  <DraftLinkButton label="Unduh Draft" downloadFile />
                )}
              </>
            )}

            {/* KLIEN */}
            {!isNotary && (
              <>
                {/* Klien hanya melihat file PDF (bukan editor). Nonaktif jika belum ada file */}
                <DraftLinkButton label="Lihat Draft" />

                {/* Setujui/Tolak hanya jika file SUDAH ada & status approval masih pending/empty */}
                {typeof onApproveDraft === "function" &&
                  status !== "reject" &&
                  hasDraftFile &&
                  (myDraftStatus === "" || myDraftStatus === "pending") && (
                    <>
                      <button
                        className={approveButton}
                        onClick={onApproveDraft}
                      >
                        Setujui Draft
                      </button>
                      <button className={rejectButton} onClick={onRejectDraft}>
                        Tolak Draft
                      </button>
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      );
    }

    case "schedule": {
      const hasSchedule = Boolean(activity?.schedules?.[0]);

      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Jadwalkan sesi pembacaan akta dengan para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className={secondaryButton}
              onClick={onViewSchedule}
              disabled={!hasSchedule}
              title={
                hasSchedule
                  ? "Lihat jadwal yang sudah dibuat"
                  : "Belum ada jadwal"
              }
            >
              Lihat Jadwal
            </button>

            {permissions?.schedule?.canEdit &&
              status !== "reject" &&
              !hasSchedule && (
                <button className={secondaryButton} onClick={onSchedule}>
                  Jadwalkan
                </button>
              )}

            {/* Jika ingin tampilkan tombol “Edit Jadwal” ketika sudah ada jadwal */}
            {permissions?.schedule?.canEdit &&
              status !== "reject" &&
              hasSchedule && (
                <button className={secondaryButton} onClick={onSchedule}>
                  Ubah Jadwal
                </button>
              )}
          </div>
        </div>
      );
    }

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
