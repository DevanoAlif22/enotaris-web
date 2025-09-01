"use client";
import { useEffect, useMemo, useState } from "react";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import Modal from "../../components/Modal";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import Avatar from "../../components/Avatar";
import UserDetailModal from "../../components/user/UserDetailModal";

/* ========== Halaman ========== */
export default function UserPage() {
  // mock data (ganti ke fetch API-mu)
  const [rows, setRows] = useState([
    {
      id: 1,
      name: "fadil",
      email: "fadilarjun7@gmail.com",
      gender: "-",
      role: "penghadap",
      status: "Menunggu",
      joined_at: "2025-08-26T00:00:00.000Z",
      avatar_url: "",
    },
    {
      id: 2,
      name: "iwang",
      email: "iwang@gmail.com",
      gender: "-",
      role: "penghadap",
      status: "Menunggu",
      joined_at: "2025-08-25T00:00:00.000Z",
      avatar_url: "",
    },
    {
      id: 3,
      name: "dhika",
      email: "dhika@gmail.com",
      gender: "-",
      role: "penghadap",
      status: "Menunggu",
      joined_at: "2025-08-23T00:00:00.000Z",
      avatar_url: "",
    },
    {
      id: 4,
      name: "adam",
      email: "adam@gmail.com",
      gender: "-",
      role: "notaris",
      status: "Menunggu",
      joined_at: "2025-08-22T00:00:00.000Z",
      avatar_url: "",
    },
    {
      id: 5,
      name: "yasmin",
      email: "yasmin@gmail.com",
      gender: "-",
      role: "penghadap",
      status: "Disetujui",
      joined_at: "2025-08-22T00:00:00.000Z",
      avatar_url: "",
    },
    {
      id: 6,
      name: "devano",
      email: "devano@gmail.com",
      gender: "Laki-laki",
      role: "penghadap",
      status: "Disetujui",
      joined_at: "2025-08-22T00:00:00.000Z",
      avatar_url:
        "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=200&q=80",
    },
  ]);

  // search & pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
  useEffect(() => setPage(1), [query]);

  // modals
  const [detail, setDetail] = useState({ open: false, user: null });
  const [confirm, setConfirm] = useState({
    open: false,
    row: null,
    loading: false,
  });

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const askDelete = (row) => setConfirm({ open: true, row, loading: false });
  const doDelete = async () => {
    const row = confirm.row;
    try {
      setConfirm((c) => ({ ...c, loading: true }));
      // TODO: await api.delete(`/users/${row.id}`)
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      setConfirm({ open: false, row: null, loading: false });
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      alert("Gagal menghapus. Coba lagi." + e.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Daftar Pengguna
          </h1>
          <div className="relative w-full max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, email, role, status..."
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#f5fefd]" />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-max border-collapse border-b border-gray-200/80">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80 dark:text-[#f5fefd]">
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
              {paged.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-4 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatar_url} />
                      <div className="font-semibold text-[#0e1528] dark:text-white">
                        {u.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#6b7280] text-center dark:text-gray-400">
                    {u.email || "-"}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white text-center">
                    {u.gender || "-"}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white text-center">
                    {u.role || "-"}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-center">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-[#0e1528] dark:text-white text-center">
                    {fmtDate(u.joined_at)}
                  </td>
                  <td className="py-4 px-4 align-middle whitespace-nowrap text-center">
                    <div className="flex items-center gap-2">
                      <ActionButton
                        variant="info"
                        onClick={() => setDetail({ open: true, user: u })}
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
              {paged.length === 0 && (
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
      <UserDetailModal
        open={detail.open}
        onClose={() => setDetail({ open: false, user: null })}
        user={detail.user}
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
