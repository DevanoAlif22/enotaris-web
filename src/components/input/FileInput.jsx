import React, { useEffect, useMemo, useRef, useState } from "react";

function FileInput({
  labelTitle,
  labelStyle = "",
  containerStyle = "",
  accept = ".jpg,.jpeg,.png",
  required = false,
  maxSizeMB = 2, // ⬅️ batas ukuran (default 2MB)
  updateFormValue, // ({ updateType, value: { file, previewUrl } })
  updateType,
  defaultFile = null,
  defaultPreviewUrl = "",
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(defaultFile);
  const [previewUrl, setPreviewUrl] = useState(defaultPreviewUrl);
  const [error, setError] = useState(""); // ⬅️ pesan error ukuran/format

  // Sinkronkan URL server saat belum ada file lokal
  useEffect(() => {
    if (!file && defaultPreviewUrl !== previewUrl) {
      setPreviewUrl(defaultPreviewUrl || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPreviewUrl]);

  const isImage = useMemo(() => {
    if (file) return file.type?.startsWith("image/");
    if (!previewUrl) return false;
    return /\.(png|jpe?g|webp|gif)$/i.test(previewUrl);
  }, [file, previewUrl]);

  const isPdf = useMemo(() => {
    if (file) return file.type === "application/pdf";
    if (!previewUrl) return false;
    return /\.pdf($|\?)/i.test(previewUrl);
  }, [file, previewUrl]);

  const fileName = useMemo(() => {
    if (file?.name) return file.name;
    if (previewUrl) {
      try {
        const clean = previewUrl.split("?")[0];
        return clean.split("/").pop() || "file";
      } catch {
        return "file";
      }
    }
    return "";
  }, [file, previewUrl]);

  const emitChange = (f, url) => {
    updateFormValue?.({
      updateType,
      value: { file: f || null, previewUrl: url || "" },
    });
  };

  const revokeBlob = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  };

  const handlePick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validasi ukuran (MB)
    const sizeMB = f.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      setError(
        `Ukuran file melebihi batas ${maxSizeMB}MB (ukuran sekarang ${sizeMB.toFixed(
          2
        )}MB).`
      );
      // reset input agar bisa pilih file sama lagi
      e.target.value = "";
      return;
    }
    setError("");

    // Bersihkan preview sebelumnya jika blob
    revokeBlob();

    setFile(f);

    if (f.type.startsWith("image/") || f.type === "application/pdf") {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      emitChange(f, url);
    } else {
      setPreviewUrl("");
      emitChange(f, "");
    }
  };

  const handleRemove = () => {
    revokeBlob();
    setFile(null);
    setPreviewUrl("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    emitChange(null, "");
  };

  const handlePreviewPDFLocal = () => {
    if (!file) return;
    const url = previewUrl || URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  //   const handlePreviewRemote = () => {
  //     if (!previewUrl) return;
  //     window.open(previewUrl, "_blank", "noopener,noreferrer");
  //   };

  const hasLocalFile = !!file;
  const hasRemoteUrl = !file && !!previewUrl;

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>
          {labelTitle}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </span>
      </label>

      {/* 1) FILE LOKAL */}
      {hasLocalFile && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white dark:bg-[#002d6a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isImage ? (
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-[#f5fefd]">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {(file.size / 1024 / 1024).toFixed(2)} MB (maks {maxSizeMB}MB)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {isImage && previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Preview (local)"
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handlePick}
              className="bg-[#0256c4] text-white px-6 py-2 text-sm rounded-lg hover:bg-[#0145a3] transition-colors font-medium disabled:opacity-60"
            >
              Ganti File
            </button>
            {isPdf && (
              <button
                type="button"
                onClick={handlePreviewPDFLocal}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors"
              >
                Preview PDF
              </button>
            )}
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {/* 2) FILE DARI SERVER */}
      {!hasLocalFile && hasRemoteUrl && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white dark:bg-[#002d6a]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-[#f5fefd]">
                {fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Sumber: Server (maks {maxSizeMB}MB bila ganti)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePick}
                className="bg-[#0256c4] text-white px-6 py-2 text-sm rounded-lg hover:bg-[#0145a3] transition-colors font-medium disabled:opacity-60"
              >
                Ganti File
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors inline-block"
              >
                Lihat
              </a>
            </div>
          </div>

          {isImage && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Preview (server)"
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {/* 3) BELUM ADA FILE */}
      {!hasLocalFile && !hasRemoteUrl && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0256c4] transition-colors cursor-pointer bg-white dark:bg-[#002d6a]"
          onClick={handlePick}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Klik untuk upload file
            </p>
            <p className="text-xs text-gray-400">
              {accept.toUpperCase()} (Maks {maxSizeMB}MB)
            </p>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default FileInput;
