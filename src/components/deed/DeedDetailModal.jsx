"use client";
import Modal from "../Modal";

function Pill({ children, onDelete }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-white">
      {children}
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 text-red-500 hover:text-red-700 font-bold focus:outline-none"
          title="Hapus"
        >
          ×
        </button>
      )}
    </span>
  );
}

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

export default function DeedDetailModal({
  open,
  onClose,
  data,
  onDeleteExtra,
}) {
  if (!data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Akta"
      titleAlign="center"
      size="lg"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10"
        >
          Tutup
        </button>
      }
    >
      <div className="space-y-4">
        {/* Nama */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Nama</div>
          <div className="text-2xl font-bold">{data.name}</div>
        </div>

        {/* 2 kartu: Jumlah Penghadap & Dibuat */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Dibuat</div>
            <div className="text-xl font-semibold">
              {fmtDateTime(data.created_at)}
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Deskripsi</div>
          <div className="text-lg font-semibold">{data.description || "-"}</div>
        </div>

        {/* Dokumen Tambahan */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-2">Dokumen Tambahan</div>
          {data.extra_requirements?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.extra_requirements.map((req) => (
                <span
                  key={req.id}
                  className="inline-flex items-center px-3 py-1 rounded-full border text-sm whitespace-nowrap bg-white"
                >
                  {req.name}
                  <button
                    onClick={() => onDeleteExtra?.(data.id, req.id, req.name)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold focus:outline-none"
                    title="Hapus"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Tidak ada dokumen.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
