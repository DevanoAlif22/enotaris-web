import { requirementService } from "../services/requirementService";
import { showError, showSuccess } from "../utils/toastConfig";

export function useRequirements({
  activity,
  fetchActivity,
  setStepStatus,
  setIsMutating,
}) {
  const handleExtrasCreate = async ({ deed_id, name, input_type }) => {
    const is_file = input_type ? input_type === "file" : true;
    try {
      await requirementService.create({
        deed_id: deed_id || activity?.deed?.id,
        name,
        is_file,
      });
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
