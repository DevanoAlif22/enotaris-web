import { useCallback, useMemo } from "react";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function useFlowDraft({
  activity,
  me,
  isNotary,
  isClient,
  isAdmin,
  isAdminOwner,
  fetchActivity,
  setIsMutating,
  setStepStatus,
}) {
  const draftApprovals =
    activity?.draft?.clientDrafts ?? activity?.draft?.client_drafts ?? [];
  const myDraftPivot = draftApprovals.find?.((cd) => cd.user_id === me?.id);
  const myDraftStatus = (myDraftPivot?.status_approval || "").toLowerCase();

  const canInteract = !isAdmin || isAdminOwner;

  const onApproveDraft = useCallback(async () => {
    if (!canInteract) return;
    try {
      setIsMutating(true);
      const { clientDraftService } = await import(
        "../../services/clientDraftService"
      );
      const draftId = activity?.draft?.id;
      if (!draftId) throw new Error("Draft belum tersedia.");
      await clientDraftService.approve(draftId);
      showSuccess("Draft disetujui.");
      setStepStatus((st) => ({
        ...st,
        draft: st.draft === "todo" ? "pending" : st.draft,
      }));
      await fetchActivity();
    } catch (e) {
      showError(e?.message || "Gagal menyetujui draft.");
    } finally {
      setIsMutating(false);
    }
  }, [
    activity?.draft?.id,
    canInteract,
    fetchActivity,
    setIsMutating,
    setStepStatus,
  ]);

  const onRejectDraft = useCallback(async () => {
    if (!canInteract) return;
    try {
      setIsMutating(true);
      const { clientDraftService } = await import(
        "../../services/clientDraftService"
      );
      const draftId = activity?.draft?.id;
      if (!draftId) throw new Error("Draft belum tersedia.");
      await clientDraftService.reject(draftId);
      showSuccess("Draft ditolak.");
      setStepStatus((st) => ({ ...st, draft: "reject" }));
      await fetchActivity();
    } catch (e) {
      showError(e?.message || "Gagal menolak draft.");
    } finally {
      setIsMutating(false);
    }
  }, [
    activity?.draft?.id,
    canInteract,
    fetchActivity,
    setIsMutating,
    setStepStatus,
  ]);

  const onUploadDraft = useCallback(
    async (file) => {
      if (!file || !(isNotary || isClient || isAdminOwner)) return;
      try {
        setIsMutating(true);
        const draftId = activity?.draft?.id;
        if (!draftId) throw new Error("Draft belum tersedia.");
        const { draftService } = await import("../../services/draftService");
        await draftService.uploadFile(draftId, file);
        showSuccess("Draft berhasil diunggah.");
        await fetchActivity();
      } catch (e) {
        showError(e?.message || "Gagal mengunggah draft.");
      } finally {
        setIsMutating(false);
      }
    },
    [
      activity?.draft?.id,
      fetchActivity,
      isAdminOwner,
      isClient,
      isNotary,
      setIsMutating,
    ]
  );

  return useMemo(
    () => ({
      draftApprovals,
      myDraftStatus,
      onApproveDraft,
      onRejectDraft,
      onUploadDraft,
    }),
    [
      draftApprovals,
      myDraftStatus,
      onApproveDraft,
      onRejectDraft,
      onUploadDraft,
    ]
  );
}
