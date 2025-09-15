"use client";
import Modal from "../Modal";
import PagedPreview from "../deed/PagedPreview";

export default function HtmlPreviewModal({
  open,
  onClose,
  html,
  title = "Preview",
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="text-xl dark:text-[#f5fefd]">{title}</span>}
      titleAlign="center"
      size="xl" // bisa "lg" / "xl" / "fullscreen" sesuai komponen Modal kamu
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-colors"
        >
          Tutup
        </button>
      }
    >
      <div className="max-h-[80vh] overflow-auto">
        <PagedPreview html={html} />
      </div>
    </Modal>
  );
}
