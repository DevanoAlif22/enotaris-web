"use client";
import { useCallback } from "react";
import Modal from "../Modal";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

/**
 * SimpleVerificationModal - Modal konfirmasi tanpa reason field
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - action: 'approve' | 'reject'
 * - itemName?: string
 * - onConfirm: ({ action: 'approve'|'reject' }) => void | Promise<void>
 * - loading?: boolean
 */
export default function SimpleVerificationModal({
  open,
  onClose,
  action = "approve",
  itemName = "",
  onConfirm,
  loading = false,
}) {
  const isReject = action === "reject";

  const title = isReject ? "Tolak Verifikasi" : "Setujui Verifikasi";
  const confirmLabel = isReject ? "Tolak" : "Setujui";
  const message = isReject
    ? `Kamu yakin ingin menolak${itemName ? ` verifikasi "${itemName}"` : ""}?`
    : `Kamu yakin menyetujui${itemName ? ` verifikasi "${itemName}"` : ""}?`;

  const handleSubmit = useCallback(() => {
    if (loading) return;
    onConfirm?.({ action });
  }, [action, onConfirm, loading]);

  // UX: Enter untuk submit (kecuali sedang loading), Esc untuk batal
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "Escape" && !loading) {
      onClose?.();
    } else if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={<span className="dark:text-[#f5fefd]">{title}</span>}
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
            disabled={loading}
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
          <p className="text-[15px] leading-6 dark:text-[#f5fefd]">{message}</p>
        </div>

        {/* Hint keyboard */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Tip: Tekan <kbd className="px-1 py-0.5 border rounded">Enter</kbd>{" "}
          untuk konfirmasi,
          <span className="mx-1" />{" "}
          <kbd className="px-1 py-0.5 border rounded">Esc</kbd> untuk batal.
        </div>
      </div>
    </Modal>
  );
}
