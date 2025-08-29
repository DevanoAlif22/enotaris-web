"use client";
import InputField from "../../components/input/InputField";
import FileInput from "../../components/input/FileInput";
import StatusBadge from "../../utils/StatusBadge";

function StatusPill({ children = "Menunggu" }) {
  return (
    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
      {children}
    </span>
  );
}

/**
 * ExtraFieldCard
 * type: "file" | "text"
 * value:
 *   - type "file": { file: File|null, previewUrl?: string } (seperti FileInput-mu)
 *   - type "text": string
 * onFileChange: ({ updateType, value }) => void      // forward ke FileInput
 * onTextChange: (e) => void                          // forward ke InputField
 * updateKey: string                                  // key untuk FileInput (updateType)
 */
export default function ExtraFieldCard({
  title,
  status = "Menunggu",
  type = "file",
  value,
  onFileChange,
  onTextChange,
  updateKey,
  textName,
  textPlaceholder = "Isi teks dokumen...",
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 2,
}) {
  const isEmpty =
    type === "file"
      ? !value?.file && !value?.previewUrl
      : !String(value || "").trim();

  return (
    <div className="border border-gray-300 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <StatusBadge status={status}></StatusBadge>
      </div>

      {/* Empty hint */}
      <p className="text-gray-600 mb-4">
        {isEmpty ? "Belum ada nilai/file." : "Sudah ada nilai/file."}
      </p>

      {/* Input area boxed */}
      {type === "file" ? (
        <div>
          <div className="text-gray-700 mb-2 font-medium">Unggah File</div>
          <FileInput
            labelTitle={null}
            accept={accept}
            maxSizeMB={maxSizeMB}
            // default value dari state
            defaultFile={value?.file || null}
            defaultPreviewUrl={value?.previewUrl || ""}
            updateFormValue={onFileChange}
            updateType={updateKey}
            // biarkan FileInput-mu men-set { updateType, value }
          />
          <div className="text-xs text-gray-500 mt-2">
            .PDF,.JPG,.JPEG,.PNG (Maks {maxSizeMB}MB)
          </div>
        </div>
      ) : (
        <div>
          <div className="text-gray-700 mb-2 font-medium">Nilai (Teks)</div>
          <InputField
            label={null}
            name={textName || updateKey}
            value={value || ""}
            onChange={onTextChange}
            placeholder={textPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
