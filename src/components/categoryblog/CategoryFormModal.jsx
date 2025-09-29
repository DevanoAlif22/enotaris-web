"use client";
import { useEffect, useState } from "react";

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initialData, // { id?, name? }
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ id: initialData?.id, name: name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#002d6a] shadow-lg">
        <div className="px-5 py-4 border-b border-gray-200/70 dark:border-white/10">
          <h3 className="text-lg font-semibold dark:text-[#f5fefd]">
            {initialData?.id ? "Edit Kategori" : "Tambah Kategori"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Nama Kategori
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:text-[#f5fefd]"
              placeholder="Contoh: Tutorial"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
