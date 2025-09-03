// app/requirement/RequirementPage.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom"; // kalau NextJS: useParams from next/navigation
import ExtraFieldCard from "../../components/input/ExtraFieldCard";
import { clientActivityService } from "../../services/clientActivityService";
import { documentRequirementService } from "../../services/documentRequirementService";
import { showError } from "../../utils/toastConfig";

/**
 * Route SARAN:
 * - /requirement/:activityId  (untuk role penghadap)
 *   halaman ini akan fetch activity (client) lalu menampilkan semua documentRequirements untuk user login
 */
export default function RequirementPage() {
  const params = useParams();
  const activityId = params?.activityId;

  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState(null);
  const [docs, setDocs] = useState([]);

  const title = useMemo(
    () => activity?.name || "Data Tambahan",
    [activity?.name]
  );

  const deedName = activity?.deed?.name;

  const fetchData = async () => {
    if (!activityId) return;
    try {
      setLoading(true);
      const res = await clientActivityService.detail(activityId);
      const a = res?.data || null;
      setActivity(a);

      const items = Array.isArray(a?.document_requirements)
        ? a.document_requirements
        : [];

      setDocs(items);
    } catch (e) {
      showError(e.message || "Gagal memuat persyaratan.");
      setActivity(null);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk update text
  const handleTextUpdate = (docId, newText) => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, value: newText } : doc))
    );
  };

  // Handler untuk update file
  const handleFileUpdate = (docId, fileData) => {
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, file: fileData.previewUrl } : doc
      )
    );
  };

  // Autosave text handler
  const handleTextSave = async (docId, text) => {
    try {
      await documentRequirementService.update(docId, {
        value: text,
        activity_notaris_id: activityId,
      });
    } catch (error) {
      showError(error.message || "Gagal menyimpan teks");
      throw error;
    }
  };

  // Autosave file handler
  const handleFileSave = async (docId, file) => {
    try {
      await documentRequirementService.update(docId, {
        file: file,
        activity_notaris_id: activityId,
      });
    } catch (error) {
      showError(error.message || "Gagal mengunggah file");
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  return (
    <div className="p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl shadow-sm p-6">
        {loading && (
          <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center text-sm">
            Memuat…
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-1">
          Data Tambahan {deedName ? `- ${deedName}` : ""}
        </h1>
        <div className="text-sm text-gray-600 mb-4">{title}</div>

        <div className="h-px bg-gray-200 mb-6" />
        <div className="text-sm text-gray-700 dark:text-[#f5fefd] mb-6">
          Upload dokumen-dokumen berikut untuk melengkapi verifikasi aktivitas
          Anda. File yang diperbolehkan: PDF, JPG, JPEG, PNG (maksimal 2MB per
          file). Dokumen akan tersimpan otomatis setelah diupload.
          <br />
          <span className="text-xs opacity-70 mt-2 block mb-4">
            ※ Teks akan otomatis tersimpan 5 detik setelah Anda berhenti
            mengetik
          </span>
        </div>

        {/* Grid persyaratan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              // Props untuk text
              textValue={d.value || ""}
              onTextChange={(newText) => handleTextUpdate(d.id, newText)}
              onTextSave={(text) => handleTextSave(d.id, text)}
              // Props untuk file
              fileValue={{
                file: null,
                previewUrl: d.file || "",
              }}
              onFileChange={(fileData) => handleFileUpdate(d.id, fileData)}
              onFileSave={(file) => handleFileSave(d.id, file)}
              // Props lainnya
              textPlaceholder={`Isi ${d.requirement_name.toLowerCase()}...`}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              maxSizeMB={2}
            />
          ))}

          {!docs.length && !loading && (
            <div className="text-sm text-gray-500">
              Tidak ada persyaratan untuk diunggah.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
