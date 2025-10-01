"use client";
import Modal from "../Modal";

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hh = d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dd} ${hh}`;
};

export default function PartnerDetailModal({ open, onClose, data }) {
  if (!data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="text-xl dark:text-[#f5fefd]">Detail Partner</span>
      }
      titleAlign="center"
      size="lg"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-colors disabled:opacity-60"
        >
          Tutup
        </button>
      }
    >
      <div className="space-y-4">
        {/* Nama + Logo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            {data.image ? (
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">
              Nama
            </div>
            <div className="text-2xl font-bold dark:text-[#f5fefd]">
              {data.name}
            </div>
          </div>
        </div>

        {/* Link */}
        <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
          <div className="text-sm text-gray-500 mb-1 dark:text-gray-400">
            Link
          </div>
          <div className="text-lg">
            {data.link ? (
              <a
                href={data.link}
                target="_blank"
                rel="noreferrer"
                className="text-[#0256c4] underline break-all"
              >
                {data.link}
              </a>
            ) : (
              <span className="text-gray-500 dark:text-gray-300">-</span>
            )}
          </div>
        </div>

        {/* Dibuat */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="bg-gray-100 dark:bg-[#01043c] rounded-xl p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Dibuat
            </div>
            <div className="text-xl font-light dark:text-[#f5fefd]">
              {fmtDateTime(data.created_at)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
