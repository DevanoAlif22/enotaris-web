"use client";
import { useEffect, useRef, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import { verificationService } from "../../services/verificationService";
import { showError, showSuccess } from "../../utils/toastConfig";

// modal2
import VerificationDetailModal from "../../components/verification/VerficationDetailModal";
import VerificationDecisionModal from "../../components/verification/VerificationDecisionModal";

const TAB_MAP = [
  { label: "Semua", type: "all" },
  { label: "Menunggu", type: "pending" },
  { label: "Disetujui", type: "approved" },
  { label: "Ditolak", type: "rejected" },
];

const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

export default function VerificationUserPage() {
  // state server data
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  // UI state
  const [activeTab, setActiveTab] = useState(TAB_MAP[0]); // default Menunggu
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(false);

  // modals
  const [detail, setDetail] = useState({ open: false, userId: null });
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    action: null, // 'approve' | 'reject'
    item: null,
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
      fetchRows(1, perPage, activeTab.type, v);
    }, 400);
  };

  const fetchRows = async (
    pg = page,
    pp = perPage,
    type = activeTab.type,
    search = query
  ) => {
    try {
      setLoading(true);
      const res = await verificationService.list(type, {
        page: pg,
        per_page: pp,
        search,
      });

      console.log(res.data);
      // Map data BE → FE rows
      const mapped = (res?.data || []).map((d) => ({
        id: d.user_id,
        name: d.user_name,
        email: d.user_email,
        role: d.role,
        nik: d.ktp,
        npwp: d.npwp,
        ktp_url: d.file_ktp,
        kk_url: d.file_kk,
        npwp_url: d.file_npwp,
        ktp_notaris_url: d.file_ktp_notaris,
        ttd_url: d.file_sign,
        foto_url: d.file_photo,
        status: mapStatusToBadge(d.verification_status),
        updated_at: d.updated_at,
      }));

      setRows(mapped);
      setMeta(res?.meta ?? {});
    } catch (e) {
      showError(e.message || "Gagal mengambil data verifikasi.");
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
  };

  useEffect(() => {
    fetchRows(page, perPage, activeTab.type, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  useEffect(() => setPage(1), [activeTab]);

  const totalPages = meta?.last_page || 1;

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const askApprove = (item) =>
    setVerifyModal({ open: true, action: "approve", item, loading: false });
  const askReject = (item) =>
    setVerifyModal({ open: true, action: "reject", item, loading: false });

  // submit dari modal verifikasi (dapat notes)
  // ganti handler-mu
  const doVerify = async (payload) => {
    const { action } = payload;
    const note = (payload.notes ?? payload.reason ?? "").trim(); // ← ambil salah satu
    const item = verifyModal.item;
    const status_verification = action === "approve" ? "approved" : "rejected";

    try {
      setVerifyModal((s) => ({ ...s, loading: true }));
      await verificationService.verifyIdentity({
        id: item.id,
        status_verification,
        // hanya kirim kalau ada isinya (biar nggak ke-null-kan di BE kalau kosong)
        notes_verification: note || undefined,
      });

      showSuccess(
        `Status pengguna "${item.name}" diubah ke ${
          action === "approve" ? "Disetujui" : "Ditolak"
        }.`
      );
      setVerifyModal({ open: false, action: null, item: null, loading: false });
      fetchRows(page, perPage, activeTab.type, query);
    } catch (e) {
      setVerifyModal((s) => ({ ...s, loading: false }));
      showError(e.message || "Gagal memproses verifikasi.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-8 relative">
        {loading && (
          <div className="absolute inset-0 dark:text-[#f5fefd] bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-sm">
            Memuat...
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Verifikasi Identitas
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 ">
            {/* Tabs */}
            <div className="flex rounded-lg border dark:border-[#f5fefd] overflow-hidden w-full sm:w-auto">
              {TAB_MAP.map((t) => {
                const active = activeTab.type === t.type;
                return (
                  <button
                    key={t.type}
                    onClick={() => setActiveTab(t)}
                    className={
                      "px-3 py-2 text-sm font-semibold flex-1 sm:flex-none " +
                      (active
                        ? "bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#f5fefd]"
                        : "bg-[#f5fefd] text-gray-800")
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                defaultValue={query}
                onChange={onChangeSearch}
                placeholder="Cari nama atau email..."
                className="dark:text-[#f5fefd] w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40"
              />
              <MagnifyingGlassIcon className="dark:text-[#f5fefd] w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-max border-collapse border-b border-gray-200/80 text-center">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Email
                </th>
                {/* <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  NIK
                </th> */}
                {/* <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  KTP
                </th> */}
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Role
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Diperbarui
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
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
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd] font-semibold">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap text-[#6b7280] dark:text-gray-400">
                    {r.email}
                  </td>
                  <td className="py-4 px-5 dark:text-[#f5fefd] whitespace-nowrap">
                    {r.role === 2
                      ? "Penghadap"
                      : r.role === 3
                      ? "Notaris"
                      : "-"}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-5 dark:text-[#f5fefd] whitespace-nowrap">
                    {fmtDate(r.updated_at)}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="info"
                        onClick={() => setDetail({ open: true, userId: r.id })}
                      >
                        Detail
                      </ActionButton>
                      {r.status === "Menunggu" && (
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
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 px-5 text-center text-gray-500 whitespace-nowrap"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              <span className="md:hidden">{meta.current_page || page}</span>
              <span className="hidden md:inline">
                Hal {meta.current_page || page} / {totalPages}
              </span>
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={(meta.current_page || 1) >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VerificationDetailModal
        open={detail.open}
        onClose={() => setDetail({ open: false, userId: null })}
        userId={detail.userId}
      />

      <VerificationDecisionModal
        open={verifyModal.open}
        onClose={() =>
          setVerifyModal({
            open: false,
            action: null,
            item: null,
            loading: false,
          })
        }
        action={verifyModal.action}
        itemName={verifyModal.item?.name}
        loading={verifyModal.loading}
        onConfirm={doVerify}
        requireReason="reject" // ⬅️ hanya reject yang wajib ada alasan
        showReasonField="reject" // ⬅️ hanya reject yang tampilkan textarea
      />
    </div>
  );
}
