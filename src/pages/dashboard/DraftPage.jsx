// pages/projectflow/DraftPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useActivityData } from "../../hooks/useActivityData";
import DeedTemplateEditor from "../../components/deed/DeedTemplateEditor";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { draftService } from "../../services/draftService";
import { showError, showSuccess } from "../../utils/toastConfig";
import { Link } from "react-router-dom";

export default function DraftPage() {
  const DEFAULT_PDF_OPTIONS = {
    page_size: "A4", // A4 | Letter | Legal | A3 | Folio
    orientation: "portrait", // portrait | landscape
    margins_mm: { top: 20, right: 20, bottom: 20, left: 20 }, // mm
    font_family: "times", // times | arial | calibri | georgia | garamond | cambria | helvetica
    font_size_pt: 12,
  };

  const { activityId } = useParams();
  const { activity, isSubmitting, isMutating, refetch } =
    useActivityData(activityId);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfOptions, setPdfOptions] = useState(DEFAULT_PDF_OPTIONS);

  const draft = useMemo(
    () =>
      Array.isArray(activity?.draft) ? activity.draft[0] : activity?.draft,
    [activity]
  );

  const initialHtml =
    [draft?.custom_value_template, activity?.deed?.default_template].find(
      (v) => typeof v === "string" && v.trim() !== ""
    ) || undefined;

  // Load saved PDF options from draft or localStorage
  useEffect(() => {
    if (draft?.pdf_options) {
      setPdfOptions({ ...DEFAULT_PDF_OPTIONS, ...draft.pdf_options });
    } else {
      // Try to load from localStorage as fallback
      const savedOptions = localStorage.getItem(`pdf_options_${activityId}`);
      if (savedOptions) {
        try {
          const parsed = JSON.parse(savedOptions);
          setPdfOptions({ ...DEFAULT_PDF_OPTIONS, ...parsed });
        } catch (e) {
          console.warn("Failed to parse saved PDF options:", e);
        }
      }
    }
  }, [draft, activityId]);

  if (!activity) {
    return (
      <LoadingOverlay
        show={isSubmitting || isMutating}
        text="Memuat data aktivitas..."
      />
    );
  }

  const handleSave = async (html) => {
    if (!draft?.id) return showError("Draft belum tersedia.");
    try {
      setSaving(true);
      // Simpan template mentah dan PDF options ke DB
      await draftService.update(draft.id, {
        custom_value_template: html,
        pdf_options: pdfOptions,
      });
      showSuccess("Draft disimpan.");
      refetch?.();
    } catch (e) {
      showError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // DraftPage.jsx - handleExportServer dengan logging
  const handleExportServer = async (htmlFinal) => {
    if (!draft?.id) return showError("Draft belum tersedia.");

    try {
      setExporting(true);

      // sanitasi options (buang proxy/fn)
      const cleanOptions = JSON.parse(JSON.stringify(pdfOptions || {}));

      // fallback default kalau ada key yang belum kepasang
      const mergedOptions = {
        page_size: cleanOptions.page_size || "A4",
        orientation: cleanOptions.orientation || "portrait",
        margins_mm: {
          top: Number(cleanOptions?.margins_mm?.top ?? 20),
          right: Number(cleanOptions?.margins_mm?.right ?? 20),
          bottom: Number(cleanOptions?.margins_mm?.bottom ?? 20),
          left: Number(cleanOptions?.margins_mm?.left ?? 20),
        },
        font_family: cleanOptions.font_family || "times",
        font_size_pt: Number(cleanOptions.font_size_pt ?? 12),

        // nomor halaman (opsional)
        show_page_numbers: !!cleanOptions.show_page_numbers,
        page_number_h_align: cleanOptions.page_number_h_align || "right", // left|center|right
        page_number_v_align: cleanOptions.page_number_v_align || "bottom", // top|bottom
        // page_number_size_pt: Number(cleanOptions.page_number_size_pt ?? 11),
      };

      console.log("➡️ renderPdf payload", {
        id: draft.id,
        html_len: htmlFinal?.length,
        pdf_options: mergedOptions,
      });

      const res = await draftService.renderPdf(draft.id, {
        html: htmlFinal, // sudah HTML final (token diganti)
        pdf_options: mergedOptions, // kirim opsi ke BE
      });

      console.log("✅ renderPdf result", res);

      const url = res?.data?.file || res?.file;
      if (url) window.open(url, "_blank", "noopener");

      showSuccess("PDF berhasil dibuat & diunggah.");
      refetch?.();
      return url;
    } catch (e) {
      console.error("❌ renderPdf error:", e);
      // tampilkan detail dari BE kalau ada
      const msg = e?.message || "Gagal membuat PDF.";
      const more = e?.errors
        ? ` (${Object.values(e.errors).flat().join(", ")})`
        : "";
      showError(msg + more);
    } finally {
      setExporting(false);
    }
  };

  const handlePdfOptionsChange = (newOptions) => {
    setPdfOptions(newOptions);
    // Save to localStorage as backup
    localStorage.setItem(
      `pdf_options_${activityId}`,
      JSON.stringify(newOptions)
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#01043c] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white dark:bg-[#002d6a] rounded-lg shadow p-6">
        <Link
          to={`/app/project-flow/${activity?.id}`}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 dark:bg-[#002d6a] hover:bg-gray-200 dark:hover:bg-[#01043c] text-gray-700 dark:text-[#f5fefd] transition"
        >
          <span aria-hidden>←</span> Kembali
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-[#f5fefd]">
              Draft Akta: {activity?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kode Aktivitas: {activity?.tracking_code}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-xs text-gray-500 dark:text-[#fef5fd] bg-gray-100 dark:bg-[#01043c] px-3 py-1.5 rounded-full">
              PDF: {pdfOptions.page_size} • {pdfOptions.orientation} •{" "}
              {pdfOptions.font_size_pt}pt
            </div>
          </div>
        </div>

        <DeedTemplateEditor
          activity={activity}
          initialHtml={initialHtml}
          initialPdfOptions={pdfOptions}
          onSave={handleSave}
          onExportPdf={handleExportServer}
          onPdfOptionsChange={handlePdfOptionsChange}
          saving={saving}
          exporting={exporting}
          fileUrl={draft?.file}
        />
      </div>
    </div>
  );
}
