"use client";
import { useEffect, useState, useCallback } from "react";
import Modal from "../Modal";
import TextAreaField from "../input/TextAreaField";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

/**
 * VerificationDecisionModal
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - action: 'approve' | 'reject'
 * - itemName?: string
 * - onConfirm: ({ action: 'approve'|'reject', reason: string }) => void | Promise<void>
 * - loading?: boolean
 * - requireReason?: boolean | 'approve' | 'reject' | 'both' - Controls when reason is required
 * - showReasonField?: boolean | 'approve' | 'reject' | 'both' - Controls when reason field is shown
 * - reasonLabel?: string - Custom label for reason field
 * - reasonPlaceholder?: string - Custom placeholder for reason field
 */
export default function VerificationDecisionModal({
  open,
  onClose,
  action = "approve",
  itemName = "",
  onConfirm,
  loading = false,
  requireReason = "reject", // Default: only reject requires reason
  showReasonField = "both", // Default: show reason field for both actions
  reasonLabel,
  reasonPlaceholder,
}) {
  const isReject = action === "reject";

  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  // reset isi saat modal dibuka / action berubah
  useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
    }
  }, [open, action]);

  // Determine if reason is required for current action
  const isReasonRequired = () => {
    if (requireReason === true || requireReason === "both") return true;
    if (requireReason === false) return false;
    if (requireReason === "approve" && !isReject) return true;
    if (requireReason === "reject" && isReject) return true;
    return false;
  };

  // Determine if reason field should be shown for current action
  const shouldShowReasonField = () => {
    if (showReasonField === true || showReasonField === "both") return true;
    if (showReasonField === false) return false;
    if (showReasonField === "approve" && !isReject) return true;
    if (showReasonField === "reject" && isReject) return true;
    return false;
  };

  const title = isReject ? "Tolak Verifikasi" : "Setujui Verifikasi";
  const confirmLabel = isReject ? "Tolak" : "Setujui";
  const message = isReject
    ? `Kamu yakin ingin menolak${itemName ? ` verifikasi "${itemName}"` : ""}?`
    : `Kamu yakin menyetujui${itemName ? ` verifikasi "${itemName}"` : ""}?`;

  // Get dynamic labels
  const getReasonLabel = () => {
    if (reasonLabel) return reasonLabel;
    return isReject ? "Alasan Penolakan" : "Alasan/Keterangan";
  };

  const getReasonPlaceholder = () => {
    if (reasonPlaceholder) return reasonPlaceholder;
    return isReject
      ? "Tulis alasan penolakan di sini…"
      : "Tulis alasan atau keterangan di sini…";
  };

  // validasi: cek apakah reason required untuk action saat ini
  const reasonRequired = isReasonRequired();
  const canSubmit = !loading && (!reasonRequired || reason.trim().length > 0);
  const showReasonError =
    touched && reasonRequired && reason.trim().length === 0;

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm?.({ action, reason: reason.trim() });
  }, [action, reason, canSubmit, onConfirm]);

  // UX: Enter untuk submit (kecuali sedang loading), Esc untuk batal
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "Escape" && !loading) {
      onClose?.();
    } else if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-60 ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (isReject ? "Menolak…" : "Menyetujui…") : confirmLabel}
          </button>
        </>
      }
    >
      <div onKeyDown={handleKeyDown} tabIndex={0}>
        <div className="flex items-start gap-3">
          {isReject ? (
            <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
          ) : (
            <CheckCircleIcon className="h-6 w-6 text-emerald-600 mt-0.5" />
          )}
          <p className="text-[15px] leading-6">{message}</p>
        </div>

        {shouldShowReasonField() && (
          <div className="mt-4">
            <TextAreaField
              label={
                <span>
                  {getReasonLabel()}{" "}
                  {reasonRequired && <span className="text-red-500">*</span>}
                </span>
              }
              name="reason"
              placeholder={getReasonPlaceholder()}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
            {showReasonError && (
              <div className="text-sm text-red-600 mt-1">
                {isReject
                  ? "Alasan penolakan wajib diisi."
                  : "Alasan wajib diisi."}
              </div>
            )}
          </div>
        )}

        {/* Hint keyboard */}
        <div className="mt-4 text-xs text-gray-500">
          Tip: Tekan <kbd className="px-1 py-0.5 border rounded">Enter</kbd>{" "}
          untuk konfirmasi,
          <span className="mx-1" />{" "}
          <kbd className="px-1 py-0.5 border rounded">Esc</kbd> untuk batal.
        </div>
      </div>
    </Modal>
  );
}
