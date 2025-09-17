"use client";
import { useEffect, useState } from "react";
import { templateService } from "../../services/templateService";

export default function TemplatePicker({ onPick, onReset, onOpenSettings }) {
  const [tplItems, setTplItems] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [selectedTplId, setSelectedTplId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setTplLoading(true);
        const res = await templateService.list({ per_page: 100 });
        const items = Array.isArray(res?.data) ? res.data : [];
        setTplItems(items.map((it) => ({ id: it.id, name: it.name })));
      } catch (e) {
        console.error("Gagal load templates:", e?.message || e);
      } finally {
        setTplLoading(false);
      }
    })();
  }, []);

  const handleUse = async () => {
    if (!selectedTplId) return;
    try {
      const res = await templateService.get(selectedTplId);
      const html = String(res?.data?.custom_value || "");
      onPick?.(html);
    } catch (e) {
      console.error("Gagal memuat template:", e?.message || e);
      alert("Gagal memuat template terpilih.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 dark:text-[#f5fefd]">
      <select
        className="border rounded px-2 py-1 text-sm"
        value={selectedTplId}
        onChange={(e) => setSelectedTplId(e.target.value)}
        disabled={tplLoading}
        title="Pilih template tersimpan"
      >
        <option value="">
          {tplLoading ? "Memuat…" : "— Pilih template —"}
        </option>
        {tplItems.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleUse}
        disabled={!selectedTplId || tplLoading}
        className="px-3 py-1.5 rounded dark:text-[#f5fefd] bg-gray-100 hover:bg-gray-200 text-sm dark:bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#0256c4]"
      >
        Gunakan
      </button>

      <button
        type="button"
        onClick={() => onReset?.()}
        className="px-3 py-1.5 rounded dark:text-[#f5fefd] bg-gray-100 hover:bg-gray-200 text-sm dark:bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#0256c4]"
        title="Kembalikan ke template bawaan"
      >
        Reset Bawaan
      </button>

      {/* Tombol Pengaturan PDF */}
      {typeof onOpenSettings === "function" && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3 py-1.5 rounded bg-gray-100 dark:text-[#f5fefd] hover:bg-gray-300 text-sm"
          title="Pengaturan PDF (ukuran kertas, orientasi, margin, font)"
        >
          Pengaturan PDF
        </button>
      )}
    </div>
  );
}
