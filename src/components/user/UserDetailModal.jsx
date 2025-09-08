import { useEffect, useState, useMemo } from "react";
import StatusBadge from "../../utils/StatusBadge";
import Modal from "../Modal";
import Avatar from "../Avatar";
import { adminUserService } from "../../services/adminUserService";
import { showError } from "../../utils/toastConfig";

/**
 * Bisa dipakai 2 cara:
 * 1) <UserDetailModal open user={row} onClose />  // langsung pakai data list (minimal)
 * 2) <UserDetailModal open userId={row.id} onClose /> // akan fetch detail lengkap saat dibuka
 */
function UserDetailModal({ open, onClose, user, userId }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  // sumber data prioritas: jika userId ada → fetch BE; else pakai user prop
  useEffect(() => {
    if (!open) return;

    // kalau ada userId, selalu ambil fresh dari BE
    if (userId) {
      (async () => {
        try {
          setLoading(true);
          const res = await adminUserService.getDetail(userId);
          setDetail(res?.data || null);
        } catch (e) {
          showError(e.message || "Gagal mengambil detail pengguna.");
          setDetail(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // fallback: pakai user dari list (mungkin fieldnya lebih sederhana)
      setDetail(user || null);
    }
  }, [open, userId, user]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const fmtDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const roleLabel = useMemo(() => {
    if (!detail) return "-";
    if (Array.isArray(detail.roles) && detail.roles.length) {
      return detail.roles.map((r) => r.name).join(", ");
    }
    if (detail.role_id) return detail.role_id === 3 ? "Notaris" : "Penghadap";
    return "-";
  }, [detail]);

  const statusLabel = useMemo(() => {
    const s = (
      detail?.status_verification ||
      detail?.status ||
      "pending"
    ).toLowerCase();
    if (s === "approved" || s === "disetujui") return "Disetujui";
    if (s === "rejected" || s === "ditolak") return "Ditolak";
    return "Menunggu";
  }, [detail]);

  if (!open) return null;

  // ambil link avatar & identity files
  const avatarUrl = detail?.identity?.file_photo || detail?.avatar_url || "";
  const idn = detail?.identity || {}; // dari BE detail
  const link = (url) =>
    url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-[#0256c4] underline"
      >
        Lihat
      </a>
    ) : (
      "-"
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="dark:text-[#f5fefd]">Detail Pengguna</span>}
      titleAlign="center"
      size="lg"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 h-11 rounded-lg font-semibold bg-[#0256c4] text-white hover:opacity-90 transition-colors"
        >
          Tutup
        </button>
      }
    >
      {loading && <div className="text-sm text-gray-600">Memuat...</div>}
      {!loading && !detail && (
        <div className="text-sm text-gray-600">Data tidak tersedia.</div>
      )}
      {!loading && detail && (
        <div className="space-y-4">
          {/* Header: Nama + avatar */}
          <div className="flex items-center gap-3">
            <Avatar name={detail.name} src={avatarUrl} />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Nama
              </div>
              <div className="text-2xl font-bold dark:text-[#f5fefd]">
                {detail.name}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Email
              </div>
              <div className="text-lg text-[#002d6a] dark:text-[#f5fefd]">
                {detail.email || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Jenis Kelamin
              </div>
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.gender === "male"
                  ? "Laki-laki"
                  : detail.gender === "female"
                  ? "Perempuan"
                  : detail.gender || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Role
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {roleLabel}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </div>
                  <StatusBadge status={statusLabel} />
                </div>
                {detail.notes_verification ? (
                  <div className="text-sm text-gray-500">
                    {detail.notes_verification}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Telepon
              </div>
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.telepon || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Alamat
              </div>
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.address || "-"}
              </div>
            </div>
          </div>
          {/* Tanggal dibuat */}
          <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Bergabung Sejak
            </div>
            <div className="text-lg font-semibold dark:text-[#f5fefd]">
              {fmtDate(detail.created_at || detail.joined_at)}
            </div>
          </div>
          {/* Section: Identitas (jika tersedia dari BE detail) */}
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
            <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
              Identitas
            </h3>
            <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                NIK
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {idn?.ktp || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                NPWP
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {idn?.npwp || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                KTP Notaris
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {idn?.ktp_notaris || "-"}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Updated
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {fmtDateTime(idn?.updated_at)}
              </div>
            </div>
          </div>
          {/* File-file pendukung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                File KTP
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_ktp)}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4  dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                File KK
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_kk)}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                File NPWP
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_npwp)}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                File KTP Notaris
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_ktp_notaris)}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Tanda Tangan
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_sign)}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Foto Formal
              </div>
              <div className="text-lg font-semibold dark:text-[#f5fefd]">
                {link(idn?.file_photo)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default UserDetailModal;
