// src/components/projectflow/RenderStepContent.jsx
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Pill from "../../utils/Pill";

/**
 * Gabungkan client_drafts dari activity dengan daftar clients.
 * - Jika klien belum punya baris di client_drafts -> dianggap pending.
 * - Jika ada di client_drafts -> pakai status dari server.
 */
function buildDraftApprovals(activity, clients = [], draftApprovalsProp = []) {
  const rawClientDrafts =
    activity?.draft?.client_drafts &&
    Array.isArray(activity.draft.client_drafts)
      ? activity.draft.client_drafts
      : [];

  const byUserId = new Map();

  for (const cd of rawClientDrafts) {
    if (!cd) continue;
    byUserId.set(cd.user_id, {
      id: cd.id ?? `server-${cd.user_id}`,
      user_id: cd.user_id,
      status_approval: (cd.status_approval || "pending").toLowerCase(),
      user: cd.user,
      _source: "server",
    });
  }

  for (const cd of draftApprovalsProp || []) {
    if (!cd) continue;
    if (!byUserId.has(cd.user_id)) {
      byUserId.set(cd.user_id, {
        id: cd.id ?? `prop-${cd.user_id}`,
        user_id: cd.user_id,
        status_approval: (cd.status_approval || "pending").toLowerCase(),
        user: cd.user,
        _source: "prop",
      });
    }
  }

  for (const c of clients || []) {
    if (!byUserId.has(c.id)) {
      byUserId.set(c.id, {
        id: `phantom-${c.id}`,
        user_id: c.id,
        status_approval: "pending",
        user: c,
        _source: "phantom",
      });
    } else {
      const exist = byUserId.get(c.id);
      if (!exist.user) exist.user = c;
    }
  }

  const withOrder = Array.from(byUserId.values()).map((row) => {
    const client = (clients || []).find((c) => c.id === row.user_id);
    return {
      ...row,
      _order: client?.pivot?.order ?? client?.order ?? 999999,
      _name: client?.name || row?.user?.name || "",
    };
  });

  withOrder.sort((a, b) => {
    if (a._order !== b._order) return a._order - b._order;
    return a._name.localeCompare(b._name);
  });

  return withOrder;
}

export default function renderStepContent(stepId, status, actions = {}) {
  const {
    isAdminMonitoring = false, // <<— flag penting

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
    onUploadDraft,
  } = actions;

  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const primaryButton = `${buttonClass} inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]`;
  const secondaryButton = `${buttonClass} inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]`;

  const approveButton = `${buttonClass} bg-green-500 text-white hover:bg-green-600`;
  const rejectButton = `${buttonClass} bg-red-500 text-white hover:bg-red-600`;

  const canMarkDone = permissions.canMarkDone ?? true;
  const docsPerm = permissions.docs || { canSelectAnyParty: true };

  // status sign dari backend (track), fallback ke status step lokal
  const signDone =
    status === "done" ||
    (activity?.track?.status_sign || "").toLowerCase() === "done";

  const signedUrl = activity?.draft?.file_ttd || ""; // hasil TTD final
  const hasSignedFile = Boolean(signedUrl);

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
  const UploadButton = ({ label = "Unggah Draft" }) =>
    isAdminMonitoring ? null : (
      <label className={secondaryButton}>
        {label}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.odt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && typeof onUploadDraft === "function")
              onUploadDraft(file);
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

              {/* Admin monitoring: sembunyikan tombol Buka Form */}
              {docsPerm.canSelectAnyParty ? (
                isAdminMonitoring ? null : (
                  <Link
                    to={`/app/requirement-notaris/${activity?.id}`}
                    className={primaryButton}
                  >
                    Buka Form
                  </Link>
                )
              ) : (
                (() => {
                  const me = clients.find((c) => c.id === currentUserId);
                  return isAdminMonitoring ? null : (
                    <Link
                      to={`/app/requirement/${activity?.id}`}
                      className={secondaryButton}
                    >
                      {`Buka Form ${me?.name ? `(${me.name})` : ""}`}
                    </Link>
                  );
                })()
              )}

              {/* Kelola persyaratan hanya jika bukan monitoring */}
              {docsPerm.canSelectAnyParty &&
                requirementList.length > 0 &&
                !isAdminMonitoring && (
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

          {status === "todo" && !isAdminMonitoring && (
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

      const viewDraftApprovals = buildDraftApprovals(
        activity,
        clients,
        draftApprovals
      );

      const DraftLinkButton = ({
        label = "Lihat Draft",
        downloadFile = false,
      }) => {
        const disabled = !hasDraftFile || !draftFileUrl;
        return isAdminMonitoring ? null : (
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

          {viewDraftApprovals.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium dark:text-[#f5fefd]">
                Status Persetujuan Draft:
              </div>
              <div className="space-y-2">
                {viewDraftApprovals.map((cd) => {
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

          <div className="flex flex-wrap gap-3">
            {/* NOTARIS */}
            {isNotary && !isAdminMonitoring && (
              <>
                {status !== "done" && (
                  <Link
                    to={`/app/project-flow/draft/${activity?.id}`}
                    className={secondaryButton}
                  >
                    Lihat Draft (Editor)
                  </Link>
                )}

                {hasDraftFile && (
                  <DraftLinkButton label="Unduh Draft" downloadFile />
                )}

                {/* Jika ingin mengaktifkan upload: */}
                {/* {typeof onUploadDraft === "function" && <UploadButton />} */}
              </>
            )}

            {/* KLIEN */}
            {!isNotary && !isAdminMonitoring && (
              <>
                <DraftLinkButton label="Lihat Draft" />

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

                {/* {typeof onUploadDraft === "function" && <UploadButton />} */}
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
            {!isAdminMonitoring && (
              <button
                className={`${secondaryButton} ${
                  !hasSchedule ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
            )}

            {permissions?.schedule?.canEdit &&
              status !== "reject" &&
              !hasSchedule &&
              !isAdminMonitoring && (
                <button className={secondaryButton} onClick={onSchedule}>
                  Jadwalkan
                </button>
              )}

            {permissions?.schedule?.canEdit &&
              status !== "reject" &&
              hasSchedule &&
              !isAdminMonitoring && (
                <button className={secondaryButton} onClick={onSchedule}>
                  Ubah Jadwal
                </button>
              )}
          </div>
        </div>
      );
    }

    case "sign": {
      const hasSigned = hasSignedFile;
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Kelola proses tanda tangan para pihak.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {!signDone && status !== "reject" && !isAdminMonitoring && (
              <button
                className={primaryButton}
                onClick={() =>
                  actions?.onOpenSignPage?.() ??
                  window.location.assign(
                    `/app/project-flow/${activity?.id}/sign`
                  )
                }
              >
                Buka Halaman TTD
              </button>
            )}

            {!isAdminMonitoring && (
              <a
                href={hasSigned ? signedUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButton} ${
                  hasSigned ? "" : "opacity-50 pointer-events-none"
                }`}
                title={
                  hasSigned ? "Buka hasil TTD (PDF)" : "Belum ada hasil TTD"
                }
              >
                Lihat File TTD
              </a>
            )}

            {!signDone &&
              status !== "reject" &&
              canMarkDone &&
              !isAdminMonitoring && (
                <button
                  className={secondaryButton}
                  onClick={() => markDone?.("sign")}
                >
                  Tandai Selesai
                </button>
              )}
          </div>
        </div>
      );
    }

    case "print": {
      const disabled = !hasSignedFile;
      return (
        <div className="space-y-4">
          {RejectNotice}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Cetak dan arsipkan akta yang telah final.
            </p>
          </div>
          <div className="flex gap-3">
            {!isAdminMonitoring && (
              <a
                href={disabled ? undefined : signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButton} ${
                  disabled ? "opacity-50 pointer-events-none" : ""
                }`}
                title={
                  disabled
                    ? "Belum ada hasil TTD"
                    : "Unduh PDF final (hasil TTD)"
                }
                download
              >
                Unduh PDF Final
              </a>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
