"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import InputField from "../../components/input/InputField";
import FileInput from "../../components/input/FileInput";
import StatusBadge from "../../utils/StatusBadge";
export default function ExtraFieldCard({
  title,
  status = "Menunggu",
  type = "file",
  reqId,

  // Text props
  textValue = "",
  onTextChange,
  onTextSave,
  textPlaceholder = "Isi teks dokumen...",

  // File props
  fileValue = { file: null, previewUrl: "" },
  onFileChange,
  onFileSave,
  accept = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx",
  maxSizeMB = 2,
}) {
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // untuk debounce text
  const debRef = useRef(null);
  const lastSentRef = useRef("");

  // State lokal untuk text input
  const [localTextValue, setLocalTextValue] = useState(textValue);

  // Sync dengan props textValue
  useEffect(() => {
    setLocalTextValue(textValue);
  }, [textValue]);

  const isEmpty =
    type === "file"
      ? !fileValue?.file && !fileValue?.previewUrl
      : !String(localTextValue || "").trim();

  const showSaved = () => {
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 1200);
  };

  // ===== AUTOSAVE TEXT (debounce) =====
  useEffect(() => {
    if (type !== "text") return;
    if (!onTextSave) return;

    // localTextValue berubah → debounce
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      const text = String(localTextValue ?? "");
      if (text === lastSentRef.current) return;

      try {
        setSaving(true);
        setErrorMsg("");
        await onTextSave(text);
        lastSentRef.current = text;
        showSaved();
      } catch (err) {
        setErrorMsg(err?.message || "Gagal menyimpan.");
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [type, localTextValue, onTextSave]);

  // Handler untuk text input
  const handleTextInputChange = (e) => {
    const newValue = e.target.value;
    setLocalTextValue(newValue);
    setErrorMsg("");
    onTextChange?.(newValue);
  };

  // ===== AUTOSAVE FILE (langsung ketika pilih) =====
  const handleFileChange = async (payload) => {
    // payload dari FileInput: { updateType, value }
    // value = { file, previewUrl }
    onFileChange?.(payload.value);

    const file = payload?.value?.file;
    if (!file || !onFileSave) return;

    try {
      setSaving(true);
      setErrorMsg("");
      await onFileSave(file);
      showSaved();
    } catch (err) {
      setErrorMsg(err?.message || "Gagal mengunggah file.");
    } finally {
      setSaving(false);
    }
  };

  // Badge warna status
  const badgeLabel = useMemo(() => {
    const v = (status || "").toLowerCase();
    if (v === "disetujui" || v === "approved") return "Disetujui";
    if (v === "ditolak" || v === "rejected") return "Ditolak";
    return "Menunggu";
  }, [status]);

  return (
    <div className="relative border border-gray-300 rounded-2xl p-5">
      {/* overlay saving */}
      {saving && (
        <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center text-sm z-10">
          Menyimpan…
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-3">
          {savedTick && (
            <span className="text-green-600 text-sm">Tersimpan ✓</span>
          )}
          <StatusBadge status={badgeLabel} />
        </div>
      </div>

      {/* Empty hint */}
      <p className="text-gray-600 dark:text-[#f5fefd] mb-4">
        {isEmpty ? "Belum ada nilai/file." : "Sudah ada nilai/file."}
      </p>

      {/* Input area */}
      {type === "file" ? (
        <div>
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
            Unggah File
          </div>
          <FileInput
            labelTitle={null}
            accept={accept}
            maxSizeMB={maxSizeMB}
            defaultFile={fileValue?.file || null}
            defaultPreviewUrl={fileValue?.previewUrl || ""}
            updateFormValue={handleFileChange}
            updateType={`file_${reqId}`}
          />
          <div className="text-xs text-gray-500 dark:text-gray-300 mt-2">
            PDF, JPG, JPEG, PNG, WEBP, DOC, DOCX (Maks {maxSizeMB}MB)
          </div>
        </div>
      ) : (
        <div>
          <div className="text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
            Nilai (Teks)
          </div>
          <InputField
            label={null}
            name={`text_${reqId}`}
            value={localTextValue}
            onChange={handleTextInputChange}
            placeholder={textPlaceholder}
          />
        </div>
      )}

      {!!errorMsg && (
        <div className="mt-3 text-xs text-red-600">{errorMsg}</div>
      )}
    </div>
  );
}
