// hooks/useParties.js
import { useEffect, useMemo, useState } from "react";
import { activityService } from "../services/activityService";
import { showSuccess, showError } from "../utils/toastConfig";

export function useParties({
  activityId,
  fetchActivity,
  setIsMutating,
  setAddModalOpen,
  setRemoveConfirm,
  partyList,
  addModalOpen,
}) {
  // ===== ADD/REMOVE penghadap =====
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

  // ===== FETCH calon klien untuk AddPartyModal =====
  const [allClients, setAllClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!addModalOpen) return;
    (async () => {
      try {
        setLoadingClients(true);
        const res = await activityService.listClients("");
        const items = Array.isArray(res?.data) ? res.data : [];
        setAllClients(items.map((c) => ({ ...c, value: String(c.value) })));
      } catch {
        setAllClients([]);
      } finally {
        setLoadingClients(false);
      }
    })();
  }, [addModalOpen]);

  const addOptions = useMemo(() => {
    const chosen = new Set(partyList.map((u) => String(u.id)));
    return allClients
      .filter((c) => !chosen.has(String(c.value)))
      .map((c) => ({ value: c.value, label: c.label }));
  }, [allClients, partyList]);

  return { handleConfirmAdd, doRemove, addOptions, loadingClients };
}
