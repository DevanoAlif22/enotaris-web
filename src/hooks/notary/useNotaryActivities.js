import { useCallback, useEffect, useMemo, useState } from "react";
import { activityService } from "../../services/activityService";
import { showError, showSuccess } from "../../utils/toastConfig";
import { mapRowNotary } from "../../helpers/notary/activity";

export const TABS = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "pending" },
  { label: "Disetujui", value: "approved" },
  { label: "Ditolak", value: "rejected" },
];

export default function useNotaryActivities({
  enabled = true,
  perPage = 10,
  tabDefault = TABS[0],
  isNotaris = false,
} = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(tabDefault);
  const [query, setQuery] = useState("");

  const totalPages = meta?.last_page || 1;

  const fetchRows = useCallback(
    async (pg = page, status = activeTab.value, search = query) => {
      if (!enabled) return;
      try {
        setLoading(true);
        const res = await activityService.list({
          page: pg,
          per_page: perPage,
          search,
          status,
        });
        const mapped = (res?.data || []).map(mapRowNotary);
        setRows(mapped);
        setMeta(
          res?.meta || {
            current_page: pg,
            per_page: perPage,
            total: mapped.length,
            last_page: 1,
            from: mapped.length ? 1 : 0,
            to: mapped.length,
          }
        );
      } catch (e) {
        showError(e.message || "Gagal mengambil daftar aktivitas.");
        setRows([]);
        setMeta({
          current_page: 1,
          per_page: perPage,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [activeTab.value, enabled, page, perPage, query]
  );

  useEffect(() => {
    if (!enabled) return;
    fetchRows(page, activeTab.value, query);
  }, [enabled, fetchRows, page, activeTab.value]);

  const refetch = useCallback(
    () => fetchRows(1, activeTab.value, query),
    [fetchRows, activeTab.value, query]
  );

  // guard CRUD hanya notaris
  const ensureNotaris = () => {
    if (!isNotaris) {
      showError("Aksi ini hanya untuk Notaris.");
      return false;
    }
    return true;
  };

  const crud = {
    async remove(id) {
      if (!ensureNotaris()) return;
      await activityService.destroy(id);
      showSuccess("Aktivitas berhasil dihapus.");
      if (rows.length === 1 && (meta.current_page || 1) > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchRows(page, activeTab.value, query);
      }
    },
    async save(payload) {
      if (!ensureNotaris()) return;

      const client_ids = (payload.parties || [])
        .map((p) => {
          const n = Number(p.value);
          return Number.isFinite(n) ? n : null;
        })
        .filter((v) => v !== null);

      const body = { name: payload.name, deed_id: payload.deed_id, client_ids };

      if (payload.id) {
        await activityService.update(payload.id, body);
        showSuccess("Aktivitas berhasil diperbarui.");
      } else {
        await activityService.create(body);
        showSuccess("Aktivitas berhasil dibuat.");
      }
      fetchRows(page, activeTab.value, query);
    },
    async detail(id) {
      const res = await activityService.detail(id);
      return res?.data;
    },
  };

  const pagination = useMemo(
    () => ({ page, setPage, totalPages, meta }),
    [meta, page, totalPages]
  );
  const filters = useMemo(
    () => ({ activeTab, setActiveTab, query, setQuery }),
    [activeTab, query]
  );

  return { rows, loading, pagination, filters, refetch, crud };
}
