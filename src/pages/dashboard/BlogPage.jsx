"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ActionButton from "../../components/ActionButton";
import { blogService } from "../../services/blogService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function BlogPage() {
  // ===== server data =====
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  // ===== UI state =====
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // ===== modal confirm delete =====
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  const navigate = useNavigate();

  // ===== fetch & helpers =====
  const fetchRows = async (pg = page, search = query) => {
    try {
      setLoading(true);
      const res = await blogService.list({
        page: pg,
        per_page: perPage,
        search,
      });

      const list = res?.data || [];
      setRows(list);

      const m = res?.meta || {
        current_page: pg,
        per_page: perPage,
        total: list.length,
        last_page: 1,
      };
      setMeta(m);
    } catch (e) {
      showError(e.message || "Gagal memuat blog.");
      setRows([]);
      setMeta({
        current_page: 1,
        per_page: perPage,
        total: 0,
        last_page: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => setPage(1), [query]);

  // ===== search (debounce) =====
  const debRef = useRef(null);
  const onChangeSearch = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setPage(1);
      fetchRows(1, v);
    }, 400);
  };

  // ===== actions =====
  const openAdd = () => navigate("/app/blog/new");
  const openEdit = (row) => navigate(`/app/blog/${row.id}/edit`);
  const askDelete = (row) => setConfirm({ open: true, row, loading: false });

  const doDelete = async () => {
    const row = confirm.row;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await blogService.destroy(row.id);
      showSuccess("Blog berhasil dihapus.");
      setConfirm({ open: false, row: null, loading: false });

      const remaining = rows.length - 1;
      if (remaining === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchRows(meta.current_page, query);
      }
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus blog.");
    }
  };

  // ===== utils =====
  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const totalPages = meta?.last_page || 1;

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
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">Blog</h1>

          <div className="flex items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <input
                defaultValue={query}
                onChange={onChangeSearch}
                placeholder="Cari judul/deskripsi…"
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
                  Gambar
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Judul
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
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-t border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-4 align-top text-center">
                    {row.image ? (
                      <img
                        src={row.image}
                        alt={row.title}
                        className="w-14 h-14 object-cover rounded-md inline-block"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded-md inline-flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap font-semibold text-[#0e1528] dark:text-white text-center">
                    {row.title}
                  </td>
                  <td className="py-4 px-4 align-top whitespace-nowrap text-[#0e1528] dark:text-white text-center">
                    {fmtDate(row.created_at)}
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex justify-center gap-2">
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
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
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
          <div className="dark:text-[#f5fefd]">
            <p>
              Menampilkan{" "}
              {(meta.current_page - 1) * meta.per_page + (rows.length ? 1 : 0)}–
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

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, row: null, loading: false })}
        onConfirm={doDelete}
        itemName={confirm.row?.title}
        loading={confirm.loading}
      />
    </div>
  );
}
