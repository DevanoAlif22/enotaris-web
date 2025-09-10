// pages/projectflow/DraftPage.jsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useActivityData } from "../../hooks/useActivityData";
import DeedTemplateEditor from "../../components/deed/DeedTemplateEditor";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { draftService } from "../../services/draftService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function DraftPage() {
  const { activityId } = useParams();
  const { activity, isSubmitting, isMutating, refetch } =
    useActivityData(activityId);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const draft = useMemo(() => {
    // activity.draft kadang array (hasMany). Ambil yang pertama.
    return Array.isArray(activity?.draft) ? activity.draft[0] : activity?.draft;
  }, [activity]);

  const initialHtml =
    [draft?.custom_value_template, activity?.deed?.default_template].find(
      (v) => typeof v === "string" && v.trim() !== ""
    ) || undefined;

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
      await draftService.update(draft.id, { custom_value_template: html });
      showSuccess("Draft disimpan.");
      refetch?.();
    } catch (e) {
      showError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportServer = async (html) => {
    if (!draft?.id) return showError("Draft belum tersedia.");
    try {
      setExporting(true);
      // opsi A (recommended): BE render PDF & upload
      await draftService.renderPdf(draft.id, { html }); // lihat services di bawah
      showSuccess("PDF berhasil dibuat & diunggah.");
      refetch?.();
    } catch (e) {
      showError(e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Draft Akta: {activity?.name}
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Kode Aktivitas: {activity?.tracking_code}
        </p>

        <DeedTemplateEditor
          activity={activity}
          // template awal dari BE (boleh string kosong)
          initialHtml={initialHtml}
          onSave={handleSave}
          onExportPdf={handleExportServer}
          saving={saving}
          exporting={exporting}
        />
      </div>
    </div>
  );
}
