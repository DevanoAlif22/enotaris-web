"use client";
import { useEffect, useMemo, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";

// Modal components (sesuaikan path import-nya dengan struktur project kamu)
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DeedFormModal from "../../components/deed/DeedFormModal";
import DeedDetailModal from "../../components/deed/DeedDetailModal";
import DeedExtraFieldsModal from "../../components/deed/DeedExtraFieldsModal";
import Pill from "../../utils/Pill";
import ActionButton from "../../components/ActionButton";

export default function DeedPage() {
  // ===== mock data awal (ganti ke fetch API) =====
  const [data, setData] = useState([
    {
      id: 2,
      name: "Pendirian CV",
      description: "Akta Otentik untuk Pendirian CV",
      penghadap_count: 1,
      extra_fields: [],
      created_at: "2025-08-25T10:00:00.000Z",
    },
    {
      id: 1,
      name: "Pendirian PT",
      description: "Akta pendirian PT adalah dokumen…",
      penghadap_count: 2,
      extra_fields: ["NPWP", "Paspor", "NIK"],
      created_at: "2025-08-22T10:00:00.000Z",
    },
  ]);

  // ===== search & pagination =====
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data;
    if (q) {
      rows = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => setPage(1), [query]);

  // ===== modal states =====
  const [modal, setModal] = useState({ type: null, payload: null }); // 'form' | 'detail' | 'extras'
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  // ===== open/close modal helpers =====
  const openAdd = () => setModal({ type: "form", payload: null });
  const openEdit = (row) => setModal({ type: "form", payload: row });
  const openDetail = (row) => setModal({ type: "detail", payload: row });
  const openExtras = (row) => setModal({ type: "extras", payload: row });
  const closeModal = () => setModal({ type: null, payload: null });

  // ===== CRUD handlers (mock; ganti dengan API) =====
  const handleFormSubmit = (payload) => {
    setData((old) => {
      if (payload.id) {
        // edit
        return old.map((it) =>
          it.id === payload.id ? { ...it, ...payload } : it
        );
      }
      // tambah
      const nextId = Math.max(0, ...old.map((x) => x.id)) + 1;
      return [
        {
          id: nextId,
          created_at: new Date().toISOString(),
          extra_fields: [],
          ...payload,
        },
        ...old,
      ];
    });
  };

  const handleExtrasCreate = ({ deed_id, name /*, input_type*/ }) => {
    // simpan nama field ke list (sesuaikan dengan struktur backend-mu)
    setData((old) =>
      old.map((it) =>
        it.id === deed_id
          ? { ...it, extra_fields: [...(it.extra_fields || []), name] }
          : it
      )
    );
  };

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });

  const doDelete = async () => {
    const row = confirm.row;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      // TODO: await api.delete(`/deeds/${row.id}`)
      setData((old) => old.filter((x) => x.id !== row.id));
      setConfirm({ open: false, row: null, loading: false });
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      alert("Gagal menghapus. Coba lagi." + e.message);
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-4 md:p-6">
      {/* Card */}
      <div className="bg-white dark:bg-[#0f1220] rounded-2xl shadow-sm p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Akta Otentik</h1>

          <div className="flex items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau deskripsi…"
                className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <button
              onClick={openAdd}
              className="h-11 px-4 rounded-lg font-semibold bg-[#0256c4] text-white hover:opacity-90"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-5 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table (scroll x + nowrap) */}
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-max">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Deskripsi
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Jumlah Penghadap
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Data Tambahan
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Dibuat
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-t border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-4 align-top whitespace-nowrap font-semibold text-[#0e1528] dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap text-[#6b7280]">
                    {row.description}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    {row.penghadap_count}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    {row.extra_fields?.length ? (
                      <div className="flex items-center gap-2">
                        {row.extra_fields.map((t) => (
                          <Pill key={t}>{t}</Pill>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-6 rounded-full bg-gray-100 text-gray-600">
                        -
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap text-[#0e1528] dark:text-white">
                    {fmtDate(row.created_at)}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="success"
                        onClick={() => openExtras(row)}
                      >
                        Tambah Data
                      </ActionButton>
                      <ActionButton
                        variant="info"
                        onClick={() => openDetail(row)}
                      >
                        Detail
                      </ActionButton>
                      <ActionButton
                        variant="warning"
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => askDelete(row)}
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
                    colSpan={6}
                    className="py-8 px-4 text-center text-gray-500 whitespace-nowrap"
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

      {/* ======= Modals ======= */}
      <DeedFormModal
        open={modal.type === "form"}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={modal.payload}
      />

      <DeedDetailModal
        open={modal.type === "detail"}
        onClose={closeModal}
        data={modal.payload}
      />

      <DeedExtraFieldsModal
        open={modal.type === "extras"}
        onClose={closeModal}
        deed={modal.payload} // {id, name}
        onSubmit={handleExtrasCreate}
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
