"use client";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import ActionButton from "../../components/ActionButton";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ScheduleModal from "../../components/activitynotaris/ScheduleModal";
import ActivityFormModal from "../../components/activitynotaris/ActivityFormModal";

import useRoleAuth from "../../hooks/notary/useRoleAuth";
import useDebounce from "../../hooks/notary/useDebounce";
import useNotaryActivities, {
  TABS,
} from "../../hooks/notary/useNotaryActivities";
import { showError } from "../../utils/toastConfig";

export default function NotaryActivityPage() {
  const { isAdmin, isNotaris } = useRoleAuth();

  const { rows, loading, pagination, filters, refetch, crud } =
    useNotaryActivities({
      enabled: true, // list ini dapat dilihat semua role
      perPage: 10,
      tabDefault: TABS[0],
      isNotaris, // untuk guard CRUD
    });

  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [form, setForm] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  // search debounce
  const debouncedQuery = useDebounce(filters.query, 400);
  useMemo(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters.activeTab.value]);

  const openAdd = () => {
    if (!isNotaris) return showError("Aksi ini hanya untuk Notaris.");
    setForm({ open: true, initial: null });
  };

  const openEdit = async (row) => {
    if (!isNotaris) return showError("Aksi ini hanya untuk Notaris.");
    try {
      const a = await crud.detail(row.id);
      const clients = Array.isArray(a?.clients) ? a.clients : [];
      setForm({
        open: true,
        initial: {
          id: a.id,
          name: a.name,
          deed_id: a.deed_id,
          parties: clients.map((c) => ({
            value: c.id,
            label: c.name ? `${c.name} (${c.email})` : c.email || `#${c.id}`,
            name: c.name,
            email: c.email,
          })),
        },
      });
    } catch (e) {
      showError(e.message || "Gagal memuat detail aktivitas.");
      setForm({
        open: true,
        initial: {
          id: row.id,
          name: row.name,
          deed_id: undefined,
          parties: (row.parties || []).map((n, i) => ({
            value: i + 1,
            label: n,
          })),
        },
      });
    }
  };

  const askDelete = (row) => {
    if (!isNotaris) return showError("Aksi ini hanya untuk Notaris.");
    setConfirm({ open: true, row, loading: false });
  };

  const doDelete = async () => {
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await crud.remove(confirm.row.id);
      setConfirm({ open: false, row: null, loading: false });
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus aktivitas.");
    }
  };

  const { meta, totalPages, page, setPage } = pagination;

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
            Proyek Notaris
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full max-w-3xl relative">
            {/* Tabs */}
            <div className="flex rounded-lg border border-[#f5fefd] overflow-hidden">
              {TABS.map((t) => {
                const active = filters.activeTab.value === t.value;
                return (
                  <button
                    key={t.label}
                    onClick={() => {
                      filters.setActiveTab(t);
                      setPage(1);
                    }}
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
            <div className="relative w-full max-w-sm">
              <input
                value={filters.query}
                onChange={(e) => {
                  filters.setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode, nama, jenis akta, penghadap…"
                className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-[#f5fefd]" />
            </div>

            {/* Tambah: Hanya Notaris */}
            {isNotaris && (
              <button
                onClick={openAdd}
                className="h-11 px-4 rounded-lg font-semibold bg-[#0256c4] text-white hover:opacity-90 transition-colors"
              >
                Tambah
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="mt-3 -mx-5 overflow-x-auto">
          <table className="text-center w-full min-w-max border-collapse border-b border-gray-200/80">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Kode
                </th>
                {isAdmin && (
                  <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                    Notaris
                  </th>
                )}
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Jenis Akta
                </th>
                <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Jumlah Penghadap
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
                  className={`border-t border-gray-200/80 dark:text-[#f5fefd] ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-5 whitespace-nowrap">{r.code}</td>
                  {isAdmin && (
                    <td className="py-4 px-5 whitespace-nowrap">
                      {r.notaris_name}
                    </td>
                  )}
                  <td className="py-4 px-5 whitespace-nowrap font-semibold">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">{r.deed_type}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {(r.parties || []).length}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <ActionButton variant="info">
                        <Link to={`/app/project-flow/${r.id}`}>Detail</Link>
                      </ActionButton>
                      {isNotaris && (
                        <>
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
                        </>
                      )}
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

        {/* Footer */}
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

      {/* ===== Modals ===== */}
      <ScheduleModal
        open={schedule.open}
        onClose={() => setSchedule({ open: false, row: null })}
        activity={{
          code: schedule.row?.code,
          deed_type: schedule.row?.deed_type,
          parties: schedule.row?.parties || [],
        }}
        initial={{
          datetime: schedule.row?.schedule,
          place: schedule.row?.place,
          note: schedule.row?.note,
        }}
      />

      <ActivityFormModal
        open={form.open}
        onClose={() => setForm({ open: false, initial: null })}
        initial={form.initial}
        onSubmit={crud.save}
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
