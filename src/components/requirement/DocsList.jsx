// components/notary/DocsList.jsx
import ExtraFieldCard from "../../components/input/ExtraFieldCard";

export default function DocsList({ docs, onUpload, onTextSave }) {
  if (!docs.length)
    return (
      <div className="text-sm text-gray-500">
        Tidak ada persyaratan untuk pengguna ini.
      </div>
    );

  return (
    <>
      <div className="text-sm text-gray-700 dark:text-[#f5fefd] mb-6">
        Upload dokumen-dokumen berikut untuk melengkapi verifikasi aktivitas
        Anda. File yang diperbolehkan: PDF, JPG, JPEG, PNG (maksimal 2MB per
        file). Dokumen akan tersimpan otomatis setelah diupload.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dark:text-[#f5fefd]">
        {docs.map((d) => (
          <ExtraFieldCard
            key={d.id}
            reqId={d.id}
            title={d.requirement_name}
            status={
              d.status_approval === "approved"
                ? "Disetujui"
                : d.status_approval === "rejected"
                ? "Ditolak"
                : "Menunggu"
            }
            type={d.is_file_snapshot ? "file" : "text"}
            textValue={d.value || ""}
            onTextChange={() => {}}
            onTextSave={onTextSave(d.id)}
            fileValue={{ file: null, previewUrl: d.file || "" }}
            onFileChange={() => {}}
            onFileSave={onUpload(d.id)}
          />
        ))}
      </div>
    </>
  );
}
