"use client";
import { useEffect, useRef } from "react";
import Modal from "./Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onConfirm: () => void | Promise<void>
 * - itemName?: string            // ditampilkan di kutip
 * - title?: string               // default: "Konfirmasi Hapus"
 * - confirmLabel?: string        // default: "Hapus"
 * - loading?: boolean            // optional: state tombol saat proses
 */
export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemName = "",
  title = <span className="dark:text-[#f5fefd]">Konfirmasi Hapus</span>,
  confirmLabel = "Hapus",
  loading = false,
}) {
  const cancelRef = useRef(null);

  // fokus ke tombol batal saat modal dibuka
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  const message = itemName ? (
    <span className="dark:text-[#f5fefd]">
      Yakin ingin menghapus "<span className="font-semibold">{itemName}</span>"
      ini?
    </span>
  ) : (
    <span className="dark:text-[#f5fefd]">Yakin ingin menghapus item ini?</span>
  );

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      actions={
        <>
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Menghapus…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5" />
        <p className="text-[15px] leading-6">{message}</p>
      </div>
    </Modal>
  );
}
