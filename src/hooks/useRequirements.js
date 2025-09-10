import { requirementService } from "../services/requirementService";
import { showError, showSuccess } from "../utils/toastConfig";

export function useRequirements({
  activity,
  fetchActivity,
  setStepStatus,
  setIsMutating,
}) {
  // hooks/useRequirements.js (atau tempat kamu define handleExtrasCreate)
  const handleExtrasCreate = async (payload) => {
    // ------- normalisasi input lama vs baru -------
    const name = String(payload?.name || "").trim();
    const activity_id =
      payload?.activity_id ?? // format baru
      activity?.id; // fallback dari context

    // is_file: prioritas boolean langsung, fallback dari input_type, terakhir default true
    const is_file =
      typeof payload?.is_file === "boolean"
        ? payload.is_file
        : payload?.input_type
        ? payload.input_type === "file"
        : true;

    if (!name) {
      showError("Nama persyaratan wajib diisi.");
      return;
    }
    if (!activity_id) {
      showError("Activity tidak ditemukan.");
      return;
    }

    try {
      await requirementService.create({ activity_id, name, is_file });
      showSuccess("Persyaratan berhasil ditambahkan.");
      await fetchActivity();
      setStepStatus((s) => (s.docs === "pending" ? { ...s, docs: "todo" } : s));
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menambah persyaratan.");
    }
  };

  const handleDeleteRequirement = async (reqId, reqName) => {
    try {
      setIsMutating?.(true);
      await requirementService.destroy(reqId);
      showSuccess(`Persyaratan "${reqName}" dihapus.`);
      await fetchActivity();
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menghapus persyaratan.");
    } finally {
      setIsMutating?.(false);
    }
  };

  return { handleExtrasCreate, handleDeleteRequirement };
}
