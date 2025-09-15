"use client";
import Modal from "../Modal";
import PagedPreview from "./PagedPreview";

export default function DeedPreviewModal({ open, onClose, html }) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="text-xl dark:text-[#f5fefd]">Preview Akta</span>}
      titleAlign="center"
      size="xl" // pakai "lg" / "xl" / "fullscreen" sesuai Modal kamu
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-colors"
        >
          Tutup
        </button>
      }
    >
      {/* area scroll supaya halaman preview nggak kepanjangan */}
      <div className="max-h-[80vh] overflow-auto">
        {/* PagedPreview sudah mengatur tampilan “halaman” */}
        <PagedPreview html={html} />
      </div>
    </Modal>
  );
}
