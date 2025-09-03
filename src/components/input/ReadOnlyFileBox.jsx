function ReadOnlyFileBox({ labelTitle, previewUrl, hint, required = false }) {
  const isPdf =
    typeof previewUrl === "string" && previewUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full">
      {/* Label */}
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-[#f5fefd]">
          {labelTitle}
        </label>
        {required && (
          <span className="text-xs text-red-500 font-medium">* wajib</span>
        )}
      </div>

      {/* Kotak preview (tanpa input) */}
      <div className="border border-gray-300 rounded-lg bg-white dark:bg-[#002d6a]">
        <div className="p-3">
          {previewUrl ? (
            isPdf ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#0256c4] hover:underline"
                title="Buka PDF"
              >
                <span className="truncate max-w-[18rem]">
                  Lihat dokumen PDF
                </span>
              </a>
            ) : (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full h-40  rounded-md overflow-hidden"
                title="Klik untuk buka gambar"
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </a>
            )
          ) : (
            <div className="w-full h-40  rounded-md flex items-center justify-center text-gray-400 text-sm">
              Tidak ada file
            </div>
          )}
        </div>

        {/* Footer hint (opsional) */}
        {hint && (
          <div className="px-3 pb-3">
            <span className="text-xs text-gray-500">{hint}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReadOnlyFileBox;
