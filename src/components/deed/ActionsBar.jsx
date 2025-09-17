"use client";

export default function ActionsBar({
  onSave,
  onGenerate,
  onPreview, // ⬅️ baru
  saving,
  exporting,
  fileUrl,
}) {
  return (
    <div className="mt-16 flex flex-wrap gap-3 items-center">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
      >
        {saving ? "Menyimpan…" : "Simpan Draft"}
      </button>

      <button
        type="button"
        onClick={onGenerate}
        disabled={exporting}
        className="px-3 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
      >
        {exporting ? "Mengekspor…" : "Generate File"}
      </button>

      {fileUrl ? (
        <a
          href={fileUrl || undefined}
          target="_blank"
          rel="noopener"
          className={`px-3 py-2 rounded transition-colors ${
            fileUrl
              ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
              : "bg-gray-100 text-gray-400 pointer-events-none"
          }`}
          title={fileUrl ? "Buka PDF terakhir" : "Belum ada file PDF"}
        >
          Lihat PDF
        </a>
      ) : (
        ""
      )}

      <button
        type="button"
        onClick={onPreview} // ⬅️ panggil modal
        className="px-3 py-2 rounded dark:text-[#f5fefd] bg-gray-100 dark:bg-[#01043c] hover:bg-gray-200 dark:hover:bg-[#0b0255] transition-colors"
      >
        Lihat Preview
      </button>
    </div>
  );
}
