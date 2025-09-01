"use client";
import { useEffect, useMemo, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import FileLink from "../../utils/FileLink";

// modal2
import VerificationDetailModal from "../../components/verification/VerficationDetailModal";
import VerificationDecisionModal from "../../components/verification/VerificationDecisionModal";

export default function VerificationUserPage() {
  // mock data; ganti ke API
  const [rows, setRows] = useState([
    {
      id: 1,
      name: "yasmin",
      email: "yasmin@gmail.com",
      nik: "12345678910",
      npwp: "12345678910",
      ktp_url: "#",
      kk_url: "#",
      ttd_url: "#",
      foto_url: "",
      status: "Menunggu",
      updated_at: "2025-08-24T09:38:00.000Z",
    },
    {
      id: 2,
      name: "devano",
      email: "devano@gmail.com",
      nik: "12345678910",
      npwp: "12345678910",
      ktp_url: "#",
      kk_url: "#",
      ttd_url: "#",
      foto_url: "#",
      status: "Menunggu",
      updated_at: "2025-08-25T09:59:00.000Z",
    },
  ]);

  // filter tabs
  const tabs = ["Menunggu", "Disetujui", "Ditolak", "Semua"];
  const [activeTab, setActiveTab] = useState("Menunggu");

  // search & pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (activeTab !== "Semua") {
      list = list.filter(
        (r) => r.status.toLowerCase() === activeTab.toLowerCase()
      );
    }
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => setPage(1), [activeTab, query]);

  // modals
  const [detail, setDetail] = useState({ open: false, item: null });
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    action: null, // 'approve' | 'reject'
    item: null,
    loading: false,
  });

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const askApprove = (item) =>
    setVerifyModal({ open: true, action: "approve", item, loading: false });
  const askReject = (item) =>
    setVerifyModal({ open: true, action: "reject", item, loading: false });

  // handler submit dari modal verifikasi
  const doVerify = async ({ action }) => {
    try {
      setVerifyModal((s) => ({ ...s, loading: true }));
      // TODO: await api.post(`/verifications/${verifyModal.item.id}/${action}`)
      setRows((prev) =>
        prev.map((r) =>
          r.id === verifyModal.item.id
            ? {
                ...r,
                status: action === "approve" ? "Disetujui" : "Ditolak",
                updated_at: new Date().toISOString(),
              }
            : r
        )
      );
      setVerifyModal({ open: false, action: null, item: null, loading: false });
    } catch (e) {
      setVerifyModal((s) => ({ ...s, loading: false }));
      alert("Gagal memproses. Coba lagi." + e.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Verifikasi Identitas
          </h1>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex rounded-lg border dark:border-[#f5fefd] overflow-hidden">
              {tabs.map((t) => {
                const active = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={
                      "px-3 py-2 text-sm font-semibold " +
                      (active
                        ? "bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#f5fefd]"
                        : "bg-[#f5fefd] text-gray-800")
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-72">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau email..."
                className="dark:text-[#f5fefd] w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table (full bleed) */}
        <div className="mt-3 -mx-5 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Email
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  NIK
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  KTP
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
              {paged.map((r, idx) => (
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
                    {r.nik || "-"}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <FileLink url={r.ktp_url} />
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
                        onClick={() => setDetail({ open: true, item: r })}
                      >
                        Detail
                      </ActionButton>
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
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
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

        {/* Footer: pagination */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="dark:text-[#f5fefd]">
            <p>
              Menampilkan {paged.length} – dari {filtered.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-gray-100"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              «
            </button>
            <div className="px-4 py-2 rounded-lg bg-gray-100 font-semibold">
              Hal {page} / {totalPages}
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-100"
              disabled={page === totalPages}
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
        onClose={() => setDetail({ open: false, item: null })}
        item={detail.item}
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
      />
    </div>
  );
}
