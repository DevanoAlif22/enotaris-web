// app/notary-client/NotarisClientActivityPage.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import VerificationDecisionModal from "../../components/activitynotarisclient/VerificationDecisionModal";
import ScheduleViewModal from "../../components/activitynotarisclient/ScheduleViewModal";
import { clientActivityService } from "../../services/clientActivityService";
import { showError, showSuccess } from "../../utils/toastConfig";

// helper map status server -> label badge FE
const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

// Get current user email from localStorage
const getCurrentUserEmail = () => {
  try {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      const userData = JSON.parse(authUser);
      return userData.email?.toLowerCase() || null;
    }
  } catch (e) {
    console.error("Error parsing auth_user from localStorage:", e);
  }
  return null;
};

// Get user-specific status from activity data
const getUserSpecificStatus = (activity, userEmail) => {
  if (!userEmail || !activity.clients || !Array.isArray(activity.clients)) {
    return null;
  }

  // Find the client that matches current user's email
  const currentUserClient = activity.clients.find(
    (client) => client.email?.toLowerCase() === userEmail
  );

  if (currentUserClient && currentUserClient.pivot) {
    return currentUserClient.pivot.status_approval;
  }

  // Fallback: check client_activities array if clients don't have pivot
  if (activity.client_activities && Array.isArray(activity.client_activities)) {
    // First, find user ID by email in clients array
    const userClient = activity.clients?.find(
      (c) => c.email?.toLowerCase() === userEmail
    );
    if (userClient) {
      const userActivity = activity.client_activities.find(
        (ca) => ca.user_id === userClient.id
      );
      if (userActivity) {
        return userActivity.status_approval;
      }
    }
  }

  return null;
};

// derive status kalau perlu (fallback)
const inferStatusFromPivots = (a) => {
  const pivots = Array.isArray(a.clientActivities) ? a.clientActivities : [];
  if (!pivots.length) return "pending";
  const allApproved = pivots.every((p) => p.status_approval === "approved");
  const anyRejected = pivots.some((p) => p.status_approval === "rejected");
  if (allApproved) return "approved";
  if (anyRejected) return "rejected";
  return "pending";
};

const mapRow = (a, currentUserEmail) => {
  // Get user-specific status first
  let statusRaw = getUserSpecificStatus(a, currentUserEmail);

  // If no user-specific status found, use fallback
  if (!statusRaw) {
    statusRaw = a.status_approval || inferStatusFromPivots(a);
  }

  // Get user's order number for additional context
  let userOrder = null;
  if (currentUserEmail && a.clients) {
    const userClient = a.clients.find(
      (c) => c.email?.toLowerCase() === currentUserEmail
    );
    if (userClient && userClient.pivot) {
      userOrder = userClient.pivot.order;
    }
  }

  return {
    id: a.id,
    code: a.tracking_code,
    name: a.name,
    deed_type: a.deed?.name || "-",
    status: mapStatusToBadge(statusRaw),
    statusRaw: statusRaw, // Keep raw status for logic
    userOrder: userOrder, // User's order in the activity
    schedule: null, // isi jika kamu mau render jadwal singkat
  };
};

export default function NotarisClientActivityPage() {
  // Get current user email once on component mount
  const [currentUserEmail] = useState(() => getCurrentUserEmail());

  // server data
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

  // filter/search/pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modals
  const [schedView, setSchedView] = useState({ open: false, row: null });
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    action: null,
    row: null,
    loading: false,
  });

  // debounced search
  const debRef = useRef(null);
  const onChangeSearch = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setPage(1);
      fetchRows(1, perPage, v);
    }, 400);
  };

  const fetchRows = async (pg = page, pp = perPage, search = query) => {
    try {
      setLoading(true);
      const res = await clientActivityService.list({
        page: pg,
        per_page: pp,
        search,
      });
      const mapped = (res?.data || []).map((activity) =>
        mapRow(activity, currentUserEmail)
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
  };

  useEffect(() => {
    fetchRows(page, perPage, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // open modals
  const askApprove = (row) =>
    setVerifyModal({ open: true, action: "approve", row, loading: false });

  const askReject = (row) =>
    setVerifyModal({ open: true, action: "reject", row, loading: false });

  // approve/reject handler
  const doVerify = async ({ action }) => {
    try {
      setVerifyModal((s) => ({ ...s, loading: true }));
      if (action === "approve") {
        await clientActivityService.approve(verifyModal.row.id);
      } else {
        await clientActivityService.reject(verifyModal.row.id);
      }
      showSuccess(
        action === "approve"
          ? "Persetujuan berhasil dikirim."
          : "Penolakan berhasil dikirim."
      );
      setVerifyModal({ open: false, action: null, row: null, loading: false });

      // refresh list
      fetchRows(page, perPage, query);
    } catch (e) {
      setVerifyModal((s) => ({ ...s, loading: false }));
      showError(e.message || "Gagal memproses.");
    }
  };

  // Helper function to determine if user can take action
  const canTakeAction = (row) => {
    return row.statusRaw === "pending";
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-sm">
            Memuat...
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Project Penghadap
          </h1>

          <div className="relative w-96">
            <input
              defaultValue={query}
              onChange={onChangeSearch}
              placeholder="Cari kode, nama, jenis akta…"
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
            />
            <MagnifyingGlassIcon className="dark:text-[#f5fefd] w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="text-center mt-3 -mx-5 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80 dark:text-[#f5fefd]">
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Kode
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Jenis Akta
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status Saya
                </th>
                {/* Add order column if needed */}
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Urutan
                </th> */}
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-t border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd]">
                    {r.code}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd] font-semibold">
                    {r.name}
                    {/* Show user order as small badge if needed */}
                    {/* {r.userOrder && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        #{r.userOrder}
                      </span>
                    )} */}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd]">
                    {r.deed_type}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-center">
                      <ActionButton variant="info">
                        <Link to={`/app/project-flow/${r.id}`}>Detail</Link>
                      </ActionButton>

                      {/* Only show approve/reject if user can take action */}
                      {canTakeAction(r) && (
                        <>
                          <ActionButton
                            variant="success"
                            onClick={() => askApprove(r)}
                          >
                            Setujui
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => askReject(r)}
                          >
                            Tolak
                          </ActionButton>
                        </>
                      )}

                      {/* Show message if already processed */}
                      {/* {!canTakeAction(r) && r.statusRaw === "approved" && (
                        <span className="text-green-600 text-sm font-medium">
                          Sudah disetujui
                        </span>
                      )}
                      {!canTakeAction(r) && r.statusRaw === "rejected" && (
                        <span className="text-red-600 text-sm font-medium">
                          Sudah ditolak
                        </span>
                      )} */}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-8 px-5 text-center text-gray-500 whitespace-nowrap"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: server-side pagination */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="dark:text-[#f5fefd]">
            <p>
              Menampilkan {meta.from || 0}–{meta.to || 0} dari {meta.total || 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={(meta.current_page || 1) <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              «
            </button>
            <div className="px-4 py-2 rounded-lg bg-gray-100 font-semibold">
              Hal {meta.current_page || page} / {meta.last_page || 1}
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
              onClick={() =>
                setPage((p) => Math.min(meta.last_page || 1, p + 1))
              }
            >
              »
            </button>
          </div>
        </div>
      </div>

      <ScheduleViewModal
        open={schedView.open}
        onClose={() => setSchedView({ open: false, row: null })}
        row={schedView.row}
      />

      <VerificationDecisionModal
        open={verifyModal.open}
        onClose={() =>
          setVerifyModal({
            open: false,
            action: null,
            row: null,
            loading: false,
          })
        }
        action={verifyModal.action}
        itemName={verifyModal.row?.name}
        loading={verifyModal.loading}
        onConfirm={doVerify}
      />
    </div>
  );
}
