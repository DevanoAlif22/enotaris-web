"use client";
import { useEffect, useMemo, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ScheduleModal from "../../components/activitynotaris/ScheduleModal";
import ActivityFormModal from "../../components/activitynotaris/ActivityFormModal";

export default function NotaryActivityPage() {
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
      status: "Menunggu",
      updated_at: "2025-08-24T09:38:00.000Z",
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
      schedule: null,
      status: "Menunggu",
      updated_at: "2025-08-24T09:38:00.000Z",
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
      status: "Menunggu",
      updated_at: "2025-08-24T09:38:00.000Z",
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
      status: "Ditolak",
      updated_at: "2025-08-24T09:38:00.000Z",
    },
  ]);

  /* tabs, search, pagination */
  const tabs = ["Semua", "Menunggu", "Disetujui", "Ditolak"];
  const [activeTab, setActiveTab] = useState("Semua");
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
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.deed_type.toLowerCase().includes(q) ||
          (r.party1 || "").toLowerCase().includes(q) ||
          (r.party2 || "").toLowerCase().includes(q)
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

  /* modal states */
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [form, setForm] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  /* handlers */
  const openAdd = () => setForm({ open: true, initial: null });
  const openEdit = (row) => setForm({ open: true, initial: row });
  //   const openSchedule = (row) => setSchedule({ open: true, row });

  const onSaveForm = (payload) => {
    setRows((prev) => {
      if (payload.id) {
        return prev.map((r) =>
          r.id === payload.id ? { ...r, ...payload } : r
        );
      }
      const nextId = Math.max(0, ...prev.map((x) => x.id)) + 1;
      return [
        {
          id: nextId,
          party1_status: "Menunggu",
          party2_status: payload.party2 ? "Menunggu" : "-",
          extra: [],
          draft: "-",
          schedule: null,
          status: "Menunggu",
          updated_at: new Date().toISOString(),
          ...payload,
        },
        ...prev,
      ];
    });
  };

  //   const onSaveSchedule = ({ datetime }) => {
  //     setRows((prev) =>
  //       prev.map((r) =>
  //         r.id === schedule.row.id ? { ...r, schedule: datetime } : r
  //       )
  //     );
  //   };

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });
  const doDelete = async () => {
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      // TODO: await api.delete(`/activities/${confirm.row.id}`)
      setRows((prev) => prev.filter((r) => r.id !== confirm.row.id));
      setConfirm({ open: false, row: null, loading: false });
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      alert("Gagal menghapus." + e.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Proyek Notaris
          </h1>

          <div className="flex items-center gap-2 w-full max-w-3xl justify-end">
            {/* Tabs */}
            <div className="flex rounded-lg border border-[#f5fefd] overflow-hidden">
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
            <div className="relative w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode, jenis akta, penghadap..."
                className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#f5fefd]" />
            </div>

            <button
              onClick={openAdd}
              className="h-11 px-4 rounded-lg font-semibold bg-[#0256c4] text-white hover:opacity-90 transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />
        {/* Table */}
        <div className="mt-3 -mx-5 overflow-x-auto ">
          <table className="text-center w-full min-w-max ">
            <thead className="">
              <tr className="text-center text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Kode
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Jenis Akta
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Penghadap 1
                </th>
                {/* <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status Penghadap 1
                </th> */}
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
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
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Status
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
                  className={`border-t border-gray-200/80 dark:text-[#f5fefd] ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-5 whitespace-nowrap">{r.code}</td>
                  <td className="py-4 px-5 whitespace-nowrap font-semibold dark:text-[#f5fefd]">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">{r.deed_type}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {r.party1 || "-"}
                  </td>
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.party1_status} />
                  </td> */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {r.party2 || "-"}
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
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <ActionButton
                      variant="info"
                      onClick={() => openSchedule(r)}
                    >
                      Jadwalkan
                    </ActionButton>
                  </td> */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActionButton variant="info" onClick="">
                        Detail
                      </ActionButton>
                      <ActionButton
                        variant="success"
                        onClick={() => openEdit(r)}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => askDelete(r)}
                      >
                        Hapus
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

      <ScheduleModal
        open={schedule.open}
        onClose={() => setSchedule({ open: false, row: null })}
        activity={{
          code: schedule.row?.code,
          deed_type: schedule.row?.deed_type,
          party1: schedule.row?.party1,
          party2: schedule.row?.party2,
        }}
        initial={{
          datetime: schedule.row?.schedule,
          place: schedule.row?.place,
          note: schedule.row?.note,
        }}
        onSave={({ datetime, place, note }) => {
          // update state / panggil API
          setRows((prev) =>
            prev.map((r) =>
              r.id === schedule.row.id
                ? { ...r, schedule: datetime, place, note }
                : r
            )
          );
        }}
      />

      <ActivityFormModal
        open={form.open}
        onClose={() => setForm({ open: false, initial: null })}
        initial={form.initial}
        onSubmit={onSaveForm}
      />
      <ConfirmDeleteModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, row: null, loading: false })}
        onConfirm={doDelete}
        itemName={confirm.row?.name}
        loading={confirm.loading}
      />
    </div>
  );
}
