// app/notary/NotaryActivityPage.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"; // jika pakai Next.js ganti ke next/link
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ScheduleModal from "../../components/activitynotaris/ScheduleModal";
import ActivityFormModal from "../../components/activitynotaris/ActivityFormModal";
import { activityService } from "../../services/activityService";
import { showError, showSuccess } from "../../utils/toastConfig";

// ==== helpers ====
const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

const inferStatusFromClients = (a) => {
  const pivots = Array.isArray(a.clientActivities || a.client_activities)
    ? a.clientActivities || a.client_activities
    : [];
  if (!pivots.length) return "pending";
  const allApproved = pivots.every((p) => p.status_approval === "approved");
  const anyRejected = pivots.some((p) => p.status_approval === "rejected");
  if (allApproved) return "approved";
  if (anyRejected) return "rejected";
  return "pending";
};

const mapRow = (a) => {
  const clients = Array.isArray(a.clients) ? a.clients : [];
  const parties = clients.map((c) => c.name || c.email || `#${c.id}`);
  const statusRaw = a.status_approval || inferStatusFromClients(a);
  return {
    id: a.id,
    code: a.tracking_code,
    name: a.name,
    deed_type: a.deed?.name || "-",
    parties, // array dinamis
    status: mapStatusToBadge(statusRaw),
    updated_at: a.updated_at,
  };
};

// ==== component ====
export default function NotaryActivityPage() {
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
  const totalPages = meta?.last_page || 1;

  // filter/search/pagination
  const TABS = [
    { label: "Semua", value: "" },
    { label: "Menunggu", value: "pending" },
    { label: "Disetujui", value: "approved" },
    { label: "Ditolak", value: "rejected" },
  ];
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modals
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [form, setForm] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({
    open: false,
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
      fetchRows(1, perPage, activeTab.value, v);
    }, 400);
  };

  // fetch list
  const fetchRows = async (
    pg = page,
    pp = perPage,
    status = activeTab.value,
    search = query
  ) => {
    try {
      setLoading(true);
      const res = await activityService.list({
        page: pg,
        per_page: pp,
        search,
        status,
      });
      const mapped = (res?.data || []).map(mapRow);
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
    fetchRows(page, perPage, activeTab.value, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  useEffect(() => setPage(1), [activeTab]);

  // handlers
  const openAdd = () => setForm({ open: true, initial: null });

  const openEdit = async (row) => {
    try {
      const res = await activityService.detail(row.id);
      const a = res?.data;
      const clients = Array.isArray(a?.clients) ? a.clients : [];
      setForm({
        open: true,
        initial: {
          id: a.id,
          name: a.name,
          deed_id: a.deed_id,
          // urutan penghadap sudah dari BE (pivot.order) → FE preserve
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
      // fallback minimal (tanpa urutan/relasi lengkap)
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

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });

  const doDelete = async () => {
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await activityService.destroy(confirm.row.id);
      showSuccess("Aktivitas berhasil dihapus.");
      setConfirm({ open: false, row: null, loading: false });

      // refresh halaman; adjust page jika kosong
      const remaining = rows.length - 1;
      if (remaining === 0 && (meta.current_page || 1) > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchRows(page, perPage, activeTab.value, query);
      }
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus aktivitas.");
    }
  };

  // submit dari ActivityFormModal
  // payload: { id?, name, deed_id, parties: [{value,label}, ...] }
  const onSaveForm = async (payload) => {
    try {
      // preserve order sesuai array → BE akan pakai sebagai pivot.order
      const client_ids = (payload.parties || [])
        .map((p) => {
          const n = Number(p.value);
          return Number.isFinite(n) ? n : null;
        })
        .filter((v) => v !== null);

      const body = {
        name: payload.name,
        deed_id: payload.deed_id,
        client_ids, // urutan penting!
      };

      if (payload.id) {
        await activityService.update(payload.id, body);
        showSuccess("Aktivitas berhasil diperbarui.");
      } else {
        await activityService.create(body);
        showSuccess("Aktivitas berhasil dibuat.");
      }

      setForm({ open: false, initial: null });
      fetchRows(page, perPage, activeTab.value, query);
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menyimpan aktivitas.");
      // biarkan modal tetap terbuka (ActivityFormModal handle sendiri isSubmitting)
      throw e; // supaya modal tahu ada error & stop loading
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
            Proyek Notaris
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full max-w-3xl relative">
            {/* Tabs */}
            <div className="flex rounded-lg border border-[#f5fefd] overflow-hidden">
              {TABS.map((t) => {
                const active = activeTab.value === t.value;
                return (
                  <button
                    key={t.label}
                    onClick={() => setActiveTab(t)}
                    className={
                      "px-3 py-2 flex-1 text-sm font-semibold " +
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
                defaultValue={query}
                onChange={onChangeSearch}
                placeholder="Cari kode, nama, jenis akta, penghadap…"
                className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-[#f5fefd]" />
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
        <div className="mt-3 -mx-5 overflow-x-auto">
          <table className="text-center w-full min-w-max">
            <thead>
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
                  Jumlah Penghadap
                </th>
                {/* <th className="py-3 px-5 font-semibold dark:text-[#f5fefd] whitespace-nowrap">
                  Status
                </th> */}
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
                  <td className="py-4 px-5 whitespace-nowrap font-semibold">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">{r.deed_type}</td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {(r.parties || []).length}
                  </td>
                  {/* <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td> */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <ActionButton variant="info">
                        <Link to={`/app/project-flow/${r.id}`}>Detail</Link>
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
        onSubmit={onSaveForm} // Modal handle isSubmitting sendiri
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
