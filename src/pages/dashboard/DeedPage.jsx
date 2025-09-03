"use client";
import { useEffect, useRef, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";

import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DeedFormModal from "../../components/deed/DeedFormModal";
import DeedDetailModal from "../../components/deed/DeedDetailModal";
import DeedExtraFieldsModal from "../../components/deed/DeedExtraFieldsModal";
import Pill from "../../utils/Pill";
import ActionButton from "../../components/ActionButton";
import { deedService } from "../../services/deedService";
import { requirementService } from "../../services/requirementService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function DeedPage() {
  // ===== server data =====
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  // ===== UI state =====
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(false);

  // ===== modal states =====
  const [modal, setModal] = useState({ type: null, payload: null });
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
      fetchRows(1, perPage, v);
    }, 400);
  };

  const mapRow = (d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    penghadap_count: d.total_client,
    extra_fields: Array.isArray(d.requirements)
      ? d.requirements.map((r) => r.name)
      : [],
    extra_requirements: Array.isArray(d.requirements)
      ? d.requirements.map((r) => ({
          id: r.id,
          name: r.name,
          is_file: r.is_file,
        }))
      : [],
    created_at: d.created_at,
  });

  const handleDeleteExtra = async (deedId, requirementId, name) => {
    try {
      // panggil API hapus
      await requirementService.destroy(requirementId);
      showSuccess(`Persyaratan "${name}" dihapus.`);

      // update list di tabel
      setRows((old) =>
        old.map((it) =>
          it.id === deedId
            ? {
                ...it,
                extra_fields: (it.extra_fields || []).filter((n) => n !== name),
                extra_requirements: (it.extra_requirements || []).filter(
                  (r) => r.id !== requirementId
                ),
              }
            : it
        )
      );

      // kalau modal detail lagi kebuka, sinkronkan payload modalnya juga
      setModal((m) => {
        if (m.type !== "detail" || !m.payload || m.payload.id !== deedId)
          return m;
        const updated = {
          ...m.payload,
          extra_fields: (m.payload.extra_fields || []).filter(
            (n) => n !== name
          ),
          extra_requirements: (m.payload.extra_requirements || []).filter(
            (r) => r.id !== requirementId
          ),
        };
        return { ...m, payload: updated };
      });
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menghapus persyaratan.");
    }
  };

  const fetchRows = async (pg = page, pp = perPage, search = query) => {
    try {
      setLoading(true);
      const res = await deedService.list({ page: pg, per_page: pp, search });
      const mapped = (res?.data || []).map(mapRow);
      setRows(mapped);
      setMeta(
        res?.meta || {
          current_page: pg,
          per_page: pp,
          total: mapped.length,
          last_page: 1,
        }
      );
    } catch (e) {
      showError(e.message || "Gagal mengambil daftar akta.");
      setRows([]);
      setMeta({ current_page: 1, per_page: perPage, total: 0, last_page: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(page, perPage, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => setPage(1), [query]);

  const totalPages = meta?.last_page || 1;

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ===== open/close modal helpers =====
  const openAdd = () => setModal({ type: "form", payload: null });
  const openEdit = (row) => setModal({ type: "form", payload: row });
  const openDetail = async (row) => {
    // optional: fetch detail terbaru (kalau modal detail butuh relations lengkap)
    try {
      const res = await deedService.detail(row.id);
      const d = res?.data;
      setModal({
        type: "detail",
        payload: {
          ...mapRow(d),
          // kamu bisa lempar relation lengkap ke modal detail kalau perlu:
          activities: d.activities || [],
          main_values: d.mainValueDeeds || [],
        },
      });
    } catch (e) {
      // fallback: pakai row list
      console.log(e);
      setModal({ type: "detail", payload: row });
    }
  };
  const openExtras = (row) => setModal({ type: "extras", payload: row });
  const closeModal = () => setModal({ type: null, payload: null });

  // ===== CRUD Handlers =====
  const handleFormSubmit = async (payload) => {
    // payload dari form: { id?, name, description, penghadap_count | total_client }
    try {
      const body = {
        name: payload.name,
        description: payload.description,
        total_client: payload.total_client ?? payload.penghadap_count, // jaga-jaga
      };

      if (payload.id) {
        await deedService.update(payload.id, body);
        showSuccess("Akta berhasil diperbarui.");
      } else {
        await deedService.create(body);
        showSuccess("Akta berhasil dibuat.");
      }

      closeModal();
      fetchRows(page, perPage, query);
    } catch (e) {
      // tampilkan error pertama jika ada detail dari BE
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menyimpan akta.");
    }
  };

  const handleExtrasCreate = async ({ deed_id, name, input_type }) => {
    // asumsikan input_type: 'file'|'text' → map ke boolean BE is_file
    const is_file = input_type ? input_type === "file" : true;
    try {
      await requirementService.create({ deed_id, name, is_file });
      showSuccess("Persyaratan berhasil ditambahkan.");

      // Optimistic update di tabel list (tambah nama field ke baris terkait)
      setRows((old) =>
        old.map((it) =>
          it.id === deed_id
            ? { ...it, extra_fields: [...(it.extra_fields || []), name] }
            : it
        )
      );
      closeModal();
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menambah persyaratan.");
    }
  };

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });

  const doDelete = async () => {
    const row = confirm.row;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await deedService.destroy(row.id);
      showSuccess("Akta berhasil dihapus.");
      setConfirm({ open: false, row: null, loading: false });

      // refresh page sekarang; kalau halaman jadi kosong, mundurkan page
      const remaining = rows.length - 1;
      if (remaining === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchRows(page, perPage, query);
      }
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus akta.");
    }
  };

  // ===== derived =====
  const filtered = rows; // server-side search; biarkan apa adanya
  const paged = filtered; // server-side paging juga; tabel langsung pakai rows

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-6 relative">
        {loading && (
          <div className="absolute inset-0 dark:text-[#f5fefd] bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-sm">
            Memuat...
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Akta Otentik
          </h1>

          <div className="flex items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <input
                defaultValue={query}
                onChange={onChangeSearch}
                placeholder="Cari nama atau deskripsi…"
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
        <div className="mt-5 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80 dark:text-[#f5fefd]">
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
                  <td className="py-4 px-4 align-top whitespace-nowrap text-[#6b7280] text-center dark:text-[#f5fefd]">
                    {row.description?.length > 40
                      ? row.description.slice(0, 30) + "…"
                      : row.description}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap text-center dark:text-[#f5fefd]">
                    {row.penghadap_count}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap text-center dark:text-[#f5fefd]">
                    {row.extra_fields?.length ? (
                      <div className="flex items-center gap-2 justify-center">
                        {row.extra_fields.slice(0, 3).map((t) => (
                          <Pill key={t}>{t}</Pill>
                        ))}

                        {row.extra_fields.length > 3 && (
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            +{row.extra_fields.length - 3} lainnya
                          </span>
                        )}
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
              {paged.length === 0 && !loading && (
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

        {/* Footer: server-side pagination */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="dark:text-[#f5fefd]">
            <p>
              Menampilkan {(meta.current_page - 1) * meta.per_page + 1 || 0}–
              {Math.min(meta.current_page * meta.per_page, meta.total) || 0}{" "}
              dari {meta.total || 0}
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
              Hal {meta.current_page || page} / {totalPages}
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

      {/* ======= Modals ======= */}
      <DeedFormModal
        open={modal.type === "form"}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={
          modal.payload
            ? {
                id: modal.payload.id,
                name: modal.payload.name,
                description: modal.payload.description,
                penghadap_count: modal.payload.penghadap_count,
                total_client: modal.payload.penghadap_count,
              }
            : null
        }
      />

      <DeedDetailModal
        open={modal.type === "detail"}
        onClose={closeModal}
        data={modal.payload}
        onDeleteExtra={handleDeleteExtra}
      />

      <DeedExtraFieldsModal
        open={modal.type === "extras"}
        onClose={closeModal}
        deed={{ id: modal.payload?.id, name: modal.payload?.name }}
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
