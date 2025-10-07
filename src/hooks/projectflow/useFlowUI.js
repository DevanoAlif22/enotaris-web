import { useCallback, useState } from "react";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function useFlowUI({
  activityId,
  isAdmin,
  isAdminOwner,
  setIsMutating,
  setStepStatus,
  fetchActivity,
}) {
  const [expandedStep, setExpandedStep] = useState("respond");

  const toggleStep = useCallback((id, stepStatus) => {
    if (stepStatus[id] === "pending") return;
    setExpandedStep((cur) => (cur === id ? null : id));
  }, []);

  const markDone = useCallback(
    async (id) => {
      if (isAdmin && !isAdminOwner) return; // admin non-owner read-only
      try {
        if (id === "sign") {
          setIsMutating(true);
          const { signService } = await import("../../services/signService");
          await signService.markDone(activityId);
          showSuccess("Step Tanda Tangan ditandai selesai.");
          setStepStatus((st) => ({ ...st, [id]: "done" }));
          await fetchActivity();
        } else {
          setStepStatus((st) => ({ ...st, [id]: "done" }));
        }
      } catch (e) {
        showError(e?.message || "Gagal menandai selesai.");
      } finally {
        setIsMutating(false);
      }
    },
    [
      activityId,
      fetchActivity,
      isAdmin,
      isAdminOwner,
      setIsMutating,
      setStepStatus,
    ]
  );

  const onMarkDocsDone = useCallback(async () => {
    if (isAdmin && !isAdminOwner) return;
    try {
      setIsMutating(true);
      const { activityService } = await import(
        "../../services/activityService"
      );
      await activityService.markDocsDone(activityId);
      showSuccess("Step dokumen ditandai selesai.");
      setStepStatus((st) => ({ ...st, docs: "done" }));
      await fetchActivity();
    } finally {
      setIsMutating(false);
    }
  }, [
    activityId,
    fetchActivity,
    isAdmin,
    isAdminOwner,
    setIsMutating,
    setStepStatus,
  ]);

  return {
    expandedStep,
    setExpandedStep,
    toggleStep,
    markDone,
    onMarkDocsDone,
  };
}
