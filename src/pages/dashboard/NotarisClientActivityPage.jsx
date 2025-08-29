"use client";
import { useEffect, useMemo, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import VerificationDecisionModal from "../../components/verification/VerificationDecisionModal";
import ScheduleViewModal from "../../components/activitynotarisclient/ScheduleViewModal";
// import { fmtDate } from "../../helpers/fmtDate";
// import { fmtTime } from "../../helpers/fmtTime";

/* ========= page ========= */
export default function NotarisClientActivityPage() {
  // asumsikan nama user sekarang:
  const currentUser = "devano";

  const [rows, setRows] = useState([
    {
      id: 1,
      code: "ACT-X43JU83C",
      name: "Pendirian PT Otak Kanan",
      deed_type: "Pendirian PT",
      party1: "devano",
      party1_status: "Menunggu",
      party2: "yasmin",
      party2_status: "Menunggu",
      extra: [{ name: "NPWP", status: "Menunggu" }],
      draft: "-",
      schedule: null,
      place: "",
      note: "",
      status: "Menunggu",
    },
    {
      id: 2,
      code: "ACT-D0QVPNNI",
      name: "Pendirian PT Otak Kanan",
      deed_type: "Pendirian PT",
      party1: "devano",
      party1_status: "Menunggu",
      party2: "yasmin",
      party2_status: "Menunggu",
      extra: [{ name: "KTP", status: "Menunggu" }],
      draft: "-",
      schedule: "2025-08-29T11:44:00.000Z",
      place: "Kantor Notaris",
      note: "",
      status: "Menunggu",
    },
    {
      id: 3,
      code: "ACT-0W0C92HW",
      name: "fdsfsdfd",
      deed_type: "Pendirian PT",
      party1: "yasmin",
      party1_status: "Menunggu",
      party2: "devano",
      party2_status: "Menunggu",
      extra: [{ name: "TTD", status: "Menunggu" }],
      draft: "-",
      schedule: null,
      place: "",
      note: "",
      status: "Menunggu",
    },
    {
      id: 4,
      code: "ACT-R0Q4WE7F",
      name: "Pendirian CV Otak Bawah",
      deed_type: "Pendirian CV",
      party1: "devano",
      party1_status: "Menunggu",
      party2: "",
      party2_status: "-",
      extra: [{ name: "Paspor", status: "Menunggu" }],
      draft: "-",
      schedule: null,
      place: "",
      note: "",
      status: "Ditolak",
    },
  ]);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.deed_type.toLowerCase().includes(q) ||
          (r.party1 || "").toLowerCase().includes(q) ||
          (r.party2 || "").toLowerCase().includes(q)
      );
    }
    // hanya yang melibatkan user sebagai penghadap 1/2
    list = list.filter(
      (r) => r.party1 === currentUser || r.party2 === currentUser
    );
    return list;
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => setPage(1), [query]);

  // modals
  const [schedView, setSchedView] = useState({ open: false, row: null });
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    action: null,
    row: null,
    loading: false,
  });

  //   const openSchedule = (row) => setSchedView({ open: true, row });

  const askApprove = (row) =>
    setVerifyModal({ open: true, action: "approve", row, loading: false });
  const askReject = (row) =>
    setVerifyModal({ open: true, action: "reject", row, loading: false });

  const doVerify = async ({ action }) => {
    try {
      setVerifyModal((s) => ({ ...s, loading: true }));
      // TODO: await api.post(`/client-activities/${verifyModal.row.id}/${action}`, { reason })
      setRows((prev) =>
        prev.map((r) =>
          r.id === verifyModal.row.id
            ? { ...r, status: action === "approve" ? "Disetujui" : "Ditolak" }
            : r
        )
      );
      setVerifyModal({ open: false, action: null, row: null, loading: false });
    } catch (e) {
      setVerifyModal((s) => ({ ...s, loading: false }));
      alert("Gagal memproses." + (e?.message || ""));
    }
  };

  const renderPenghadap = (name) =>
    name === currentUser ? (
      <span className="text-blue-600 font-semibold">Anda</span>
    ) : (
      name || "-"
    );

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#0f1220] rounded-2xl shadow-sm p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Project Penghadap</h1>

          <div className="relative w-96">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode, nama, jenis akta, atau penghadap..."
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="mt-3 -mx-5 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200/80">
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
                  Penghadap 1
                </th>
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status Penghadap 1
                </th> */}
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Penghadap 2
                </th>
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status Penghadap 2
                </th> */}
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Data Tambahan
                </th> */}
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Draft Akta
                </th> */}
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Penjadwalan
                </th> */}
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
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
                  <td className="py-4 px-5 whitespace-nowrap">{r.code}</td>
                  <td className="py-4 px-5 whitespace-nowrap font-semibold">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">{r.deed_type}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {renderPenghadap(r.party1)}
                  </td>
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.party1_status} />
                  </td> */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {renderPenghadap(r.party2 || "-")}
                  </td>
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.party2_status} />
                  </td> */}
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <button className="text-blue-600 underline" onClick="">
                      Lihat
                    </button>
                  </td> */}
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    {r.draft || "-"}
                  </td> */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActionButton variant="info">Detail</ActionButton>
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

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <p>
            Menampilkan {paged.length} – dari {filtered.length}
          </p>
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
