import { useCallback } from "react";
import { scheduleService } from "../../services/scheduleService";
import { toYmd, toHm } from "../../utils/dateTime";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function useFlowSchedule({
  activity,
  fetchActivity,
  setIsMutating,
  canEditSchedule,
}) {
  const handleScheduleSave = useCallback(
    async ({ datetime, place, note }) => {
      if (!canEditSchedule) return;
      try {
        setIsMutating(true);
        const d = new Date(datetime);
        const payload = {
          activity_id: activity?.id,
          date: toYmd(d),
          time: toHm(d),
          location: place || null,
          notes: note || null,
        };
        const existingId = activity?.schedules?.[0]?.id;

        if (existingId) {
          await scheduleService.update(existingId, payload);
          showSuccess("Jadwal diperbarui.");
        } else {
          await scheduleService.store(payload);
          showSuccess("Jadwal dibuat.");
        }
        await fetchActivity();
      } catch (e) {
        showError(e?.message || "Gagal menyimpan jadwal.");
      } finally {
        setIsMutating(false);
      }
    },
    [
      activity?.id,
      activity?.schedules,
      canEditSchedule,
      fetchActivity,
      setIsMutating,
    ]
  );

  const handleScheduleDelete = useCallback(async () => {
    if (!canEditSchedule) return;
    try {
      setIsMutating(true);
      const existingId = activity?.schedules?.[0]?.id;
      if (!existingId) return;
      await scheduleService.destroy(existingId);
      showSuccess("Jadwal dihapus.");
      await fetchActivity();
    } catch (e) {
      showError(e?.message || "Gagal menghapus jadwal.");
    } finally {
      setIsMutating(false);
    }
  }, [activity?.schedules, canEditSchedule, fetchActivity, setIsMutating]);

  return { handleScheduleSave, handleScheduleDelete };
}
