// components/activitynotaris/AddPartyModal.jsx
"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import SearchSelect from "../input/SearchSelect";

export default function AddPartyModal({
  open,
  onClose,
  options = [], // [{value,label}]
  loading = false,
  onConfirm, // (selectedUserId) => void|Promise<void>
}) {
  const [selected, setSelected] = useState(null); // string|null

  useEffect(() => {
    if (open) setSelected(null); // reset setiap buka modal
  }, [open]);

  const canConfirm = !!selected && !loading && options.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Penghadap"
      size="md"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            disabled={!canConfirm}
            className="px-4 py-2 rounded-lg bg-[#0256c4] text-white font-semibold disabled:opacity-60"
          >
            Tambah
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <SearchSelect
          label="Pilih Klien"
          placeholder={
            loading
              ? "Memuat klien..."
              : options.length
              ? "Cari & pilih klien..."
              : "Tidak ada klien yang tersedia"
          }
          options={options}
          value={selected}
          onChange={setSelected}
          disabled={loading || options.length === 0}
          required
        />
        <p className="text-xs text-gray-500">
          Hanya menampilkan klien yang belum menjadi penghadap pada aktivitas
          ini.
        </p>
      </div>
    </Modal>
  );
}
