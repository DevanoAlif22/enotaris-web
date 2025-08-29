"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import TextAreaField from "../input/TextAreaField";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - action: 'approve' | 'reject'
 * - itemName?: string              // nama user/akta utk ditampilkan
 * - onConfirm: ({ action, reason }) => void | Promise<void>
 * - loading?: boolean
 */
export default function VerificationDecisionModal({
  open,
  onClose,
  action = "approve",
  itemName = "",
  onConfirm,
  loading = false,
}) {
  const isReject = action === "reject";
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setTouched(false);
    }
  }, [open, action]);

  const title = isReject ? "Tolak Verifikasi" : "Setujui Verifikasi";
  const confirmLabel = isReject ? "Tolak" : "Setujui";
  const message = isReject
    ? `Kamu yakin ingin menolak${itemName ? ` verifikasi "${itemName}"` : ""}?`
    : `Kamu yakin menyetujui${itemName ? ` verifikasi "${itemName}"` : ""}?`;

  const canSubmit = !loading && (!isReject || reason.trim().length > 0);

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm({ action, reason: reason.trim() });
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
              isReject ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {loading ? (isReject ? "Menolak…" : "Menyetujui…") : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {isReject ? (
          <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
        ) : (
          <CheckCircleIcon className="h-6 w-6 text-emerald-600 mt-0.5" />
        )}
        <p className="text-[15px] leading-6">{message}</p>
      </div>

      {isReject && (
        <div className="mt-4">
          <TextAreaField
            label={
              <span>
                Alasan Penolakan <span className="text-red-500">*</span>
              </span>
            }
            name="reason"
            placeholder="Tulis alasan penolakan di sini…"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {touched && reason.trim().length === 0 && (
            <div className="text-sm text-red-600">
              Alasan penolakan wajib diisi.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
