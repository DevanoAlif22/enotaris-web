"use client";
import { useEffect, useRef, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import Avatar from "../../components/Avatar";
import UserDetailModal from "../../components/user/UserDetailModal";
import { adminUserService } from "../../services/adminUserService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function UserPage() {
  // server-side rows & meta
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  });

  // ui state
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modals
  const [detail, setDetail] = useState({ open: false, userId: null });
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  // debounce search
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

  const fetchRows = async (pg = page, pp = perPage, q = query) => {
    try {
      setLoading(true);
      const res = await adminUserService.getAll({
        page: pg,
        per_page: pp,
        q,
      });
      setRows(res?.data ?? []);
      setMeta(res?.meta ?? {});
    } catch (e) {
      showError(e.message || "Gagal mengambil data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(page, perPage, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });

  const doDelete = async () => {
    const row = confirm.row;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      await adminUserService.destroy(row.id);
      showSuccess("Pengguna berhasil dihapus.");
      setConfirm({ open: false, row: null, loading: false });
      // refetch page saat ini. Jika page jadi kosong karena deletion, mundurkan 1 page
      const isLastItemOnPage = rows.length === 1 && page > 1;
      const nextPage = isLastItemOnPage ? page - 1 : page;
      setPage(nextPage);
      fetchRows(nextPage, perPage, query);
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      showError(e.message || "Gagal menghapus pengguna.");
    }
  };

  // derive
  const totalPages = meta?.last_page || 1;
  // const showingCount = rows.length;
  const totalCount = meta?.total || 0;

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#0f1220] rounded-2xl shadow-sm p-5 md:p-8 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-sm">
            Memuat...
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Daftar Pengguna</h1>
          <div className="relative w-full max-w-xl">
            <input
              defaultValue={query}
              onChange={onChangeSearch}
              placeholder="Cari nama, email, role, status..."
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-max border-collapse border-b border-gray-200/80">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200/80">
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Email
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Jenis Kelamin
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Role
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Bergabung Sejak
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.identity?.file_photo} />
                      <div className="font-semibold text-[#0e1528] dark:text-white">
                        {u.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#6b7280]">
                    {u.email || "-"}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white">
                    {u.gender === "male"
                      ? "Laki-laki"
                      : u.gender === "female"
                      ? "Perempuan"
                      : u.gender || "-"}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white">
                    {/* roles mungkin array dari with('roles'). Tampilkan label sederhana */}
                    {Array.isArray(u.roles) && u.roles.length
                      ? u.roles.map((r) => r.name).join(", ")
                      : u.role_label ||
                        (u.role_id === 3 ? "Notaris" : "Penghadap")}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    <StatusBadge
                      status={
                        u.status_verification === "approved"
                          ? "Disetujui"
                          : u.status_verification === "rejected"
                          ? "Ditolak"
                          : "Menunggu"
                      }
                    />
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white">
                    {fmtDate(u.created_at)}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="info"
                        onClick={() => setDetail({ open: true, userId: u.id })}
                      >
                        Detail
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => askDelete(u)}
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
                    colSpan={7}
                    className="py-8 px-4 text-center text-gray-500 whitespace-nowrap"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: pagination (server-side) */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <p>
            Menampilkan {meta.from || 0}–{meta.to || 0} dari {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              «
            </button>
            <div className="px-4 py-2 rounded-lg bg-gray-100 font-semibold">
              Hal {meta.current_page || page} / {totalPages}
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal
        open={detail.open}
        userId={detail.userId}
        onClose={() => setDetail({ open: false, userId: null })}
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
