import { activityService } from "../services/activityService";
import { showError, showSuccess } from "../utils/toastConfig";

export function useParties({
  activityId,
  fetchActivity,
  setIsMutating,
  setAddModalOpen,
  setRemoveConfirm,
}) {
  const handleConfirmAdd = async (selectedUserId) => {
    if (!selectedUserId) return;
    try {
      setIsMutating(true);
      setAddModalOpen(false);
      await activityService.addUser(selectedUserId, activityId);
      showSuccess("Penghadap ditambahkan.");
      await fetchActivity();
    } catch (e) {
      showError(e.message || "Gagal menambah penghadap.");
    } finally {
      setIsMutating(false);
    }
  };

  const doRemove = async (user) => {
    if (!user) return;
    try {
      setRemoveConfirm((c) => ({ ...c, loading: true }));
      setIsMutating(true);
      setRemoveConfirm({ open: false, user: null, loading: false });
      await activityService.removeUser(user.id, activityId);
      showSuccess("Penghadap dihapus.");
      await fetchActivity();
    } catch (e) {
      setRemoveConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus penghadap.");
    } finally {
      setIsMutating(false);
    }
  };

  return { handleConfirmAdd, doRemove };
}
