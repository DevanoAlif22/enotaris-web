import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clientActivityService } from "../../services/clientActivityService";
import { showError, showSuccess } from "../../utils/toastConfig";
import { getCurrentUserEmail, mapRow } from "../../helpers/client/activity";

export default function useClientActivities() {
  const currentUserEmail = useMemo(() => getCurrentUserEmail(), []);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // debounced search
  const debRef = useRef(null);
  const onChangeSearch = (v) => {
    setQuery(v);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setPage(1);
      fetchRows(1, perPage, v);
    }, 400);
  };

  const fetchRows = useCallback(
    async (pg = page, pp = perPage, search = query) => {
      try {
        setLoading(true);
        const res = await clientActivityService.list({
          page: pg,
          per_page: pp,
          search,
        });
        const mapped = (res?.data || []).map((a) =>
          mapRow(a, currentUserEmail)
        );
        setRows(mapped);
        setMeta(
          res?.meta || {
            current_page: pg,
            per_page: pp,
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
          per_page: pp,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0,
        });
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentUserEmail]
  );

  useEffect(() => {
    fetchRows(page, perPage, query);
  }, [fetchRows, page]);

  // verify modals state
  const [verify, setVerify] = useState({
    open: false,
    action: null,
    row: null,
    loading: false,
  });
  const askApprove = (row) =>
    setVerify({ open: true, action: "approve", row, loading: false });
  const askReject = (row) =>
    setVerify({ open: true, action: "reject", row, loading: false });
  const closeVerify = () =>
    setVerify({ open: false, action: null, row: null, loading: false });

  const doVerify = async () => {
    try {
      setVerify((s) => ({ ...s, loading: true }));
      if (verify.action === "approve") {
        await clientActivityService.approve(verify.row.id);
        showSuccess("Persetujuan berhasil dikirim.");
      } else {
        await clientActivityService.reject(verify.row.id);
        showSuccess("Penolakan berhasil dikirim.");
      }
      closeVerify();
      fetchRows(page, perPage, query);
    } catch (e) {
      setVerify((s) => ({ ...s, loading: false }));
      showError(e.message || "Gagal memproses.");
    }
  };

  const canTakeAction = (row) => row.statusRaw === "pending";

  // schedule view modal
  const [schedView, setSchedView] = useState({ open: false, row: null });

  return {
    // data
    rows,
    meta,
    loading,
    // paging/search
    page,
    setPage,
    query,
    onChangeSearch,
    // actions
    canTakeAction,
    // verify modal
    verify,
    askApprove,
    askReject,
    closeVerify,
    doVerify,
    // schedule modal
    schedView,
    setSchedView,
  };
}
