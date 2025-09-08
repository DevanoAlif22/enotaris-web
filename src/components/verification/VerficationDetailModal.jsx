"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import StatusBadge from "../../utils/StatusBadge";
import FileLink from "../../utils/FileLink";
import { verificationService } from "../../services/verificationService";

/* === helpers === */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

const Avatar = ({ name = "", src = "" }) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  const validSrc = typeof src === "string" && src.trim() ? src : null;
  return validSrc ? (
    <img
      src={validSrc}
      alt={name}
      className="w-14 h-14 rounded-full object-cover bg-gray-200"
    />
  ) : (
    <div className="w-14 h-14 rounded-2xl bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold">
      {initials}
    </div>
  );
};

const InfoCard = ({ label, children, className = "" }) => (
  <div className={`bg-gray-100 rounded-xl p-4 ${className}`}>
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-lg font-semibold">{children ?? "-"}</div>
  </div>
);

/**
 * Fetch detail dari GET /verification/users/{id}
 * Pakai:
 * <VerificationDetailModal open userId={id} onClose={...} />
 */
export default function VerificationDetailModal({ open, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  // normalize response -> shape untuk UI
  const normalize = (resData) => {
    const u = resData || {};
    const idn = resData?.identity || {};
    return {
      // header
      id: u.id,
      name: u.name,
      email: u.email,
      avatar_url: idn.file_photo || u.file_avatar || "",
      status_raw: u.status_verification,
      status: mapStatusToBadge(u.status_verification),
      notes: u.notes_verification,
      // umum
      phone: u.telepon,
      gender: u.gender,
      role: u.role_id,
      joined_at: u.created_at,
      address: u.address,
      // identitas
      nik: idn.ktp,
      npwp: idn.npwp,
      ktp_notaris: idn.ktp_notaris,
      ktp_url: idn.file_ktp,
      kk_url: idn.file_kk,
      npwp_file_url: idn.file_npwp,
      ktp_notaris_url: idn.file_ktp_notaris,
      ttd_url: idn.file_sign,
      foto_url: idn.file_photo,
      updated_at: idn.updated_at,
    };
  };

  useEffect(() => {
    if (!open || !userId) return;

    let alive = true;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");
        setDetail(null);
        const res = await verificationService.getUserDetail(userId, {
          signal: ac.signal, // optional jika api() mendukung
        });
        if (!alive) return;
        setDetail(normalize(res?.data));
      } catch (e) {
        if (!alive) return;
        setErrMsg(e?.message || "Gagal mengambil detail identitas.");
        setDetail(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [open, userId]);

  if (!open) return null;

  const phone = detail?.phone || "-";
  const gender = detail?.gender || "-";
  const joinedAt = detail?.joined_at;
  const address = detail?.address || "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="dark:text-[#f5fefd]">Detail Verifikasi</span>}
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
      {!loading && errMsg && (
        <div className="text-sm text-red-600">{errMsg}</div>
      )}
      {!loading && !errMsg && !detail && (
        <div className="text-sm text-gray-600">Data tidak tersedia.</div>
      )}

      {!loading && !errMsg && detail && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4 ">
            <Avatar name={detail.name} src={detail.avatar_url} />
            <div>
              <div className="text-2xl font-bold text-gray-500 dark:text-[#f5fefd]">
                {detail.name || "-"}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {detail.email || "-"}
              </div>
              {/* <div className="text-sm text-gray-400">
                ID: {detail.id ?? "-"}
              </div> */}
            </div>
          </div>
          {/* Status Verifikasi */}
          <div className="bg-gray-100 rounded-xl p-4 dark:bg-[#01043c]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Status Verifikasi
                </div>
                <StatusBadge status={detail.status} />
              </div>
              {detail.notes ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Catatan: {detail.notes}
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="Telepon"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="font-light text-lg text-[#002d6a] dark:text-[#f5fefd]">
                {phone}
              </div>
            </InfoCard>
            <InfoCard
              label="Jenis Kelamin"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="font-light dark:text-[#f5fefd]">
                {detail.gender === "male"
                  ? "Laki-laki"
                  : detail.gender === "female"
                  ? "Perempuan"
                  : detail.gender || "-"}
              </div>
            </InfoCard>
            <InfoCard
              label="Role"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd] font-semibold">
                {detail.role === 2
                  ? "Penghadap"
                  : detail.role === 3
                  ? "Notaris"
                  : detail.role || "-"}
              </div>
            </InfoCard>
            <InfoCard
              label="Bergabung Sejak"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {fmtDate(joinedAt)}
              </div>
            </InfoCard>
          </div>
          <InfoCard
            label="Alamat"
            className="col-span-1 md:col-span-2 dark:bg-[#01043c] dark:text-gray-400"
          >
            <div className="font-light dark:text-[#f5fefd]">{address}</div>
          </InfoCard>
          {/* Identitas */}
          <h3 className="text-xl font-bold mt-2 dark:text-[#f5fefd]">
            Identitas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              label="NIK"
              className="dark:bg-[#01043c] dark:text-gray-300"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.nik || "-"}
              </div>
            </InfoCard>
            <InfoCard
              label="NPWP"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.npwp || "-"}
              </div>
            </InfoCard>

            <InfoCard
              label="KTP Notaris"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.ktp_notaris || "-"}
              </div>
            </InfoCard>
            <InfoCard
              label="File KTP"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.ktp_url ? <FileLink url={detail.ktp_url} /> : "-"}
              </div>
            </InfoCard>

            <InfoCard
              label="File KK"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.kk_url ? <FileLink url={detail.kk_url} /> : "-"}
              </div>
            </InfoCard>
            <InfoCard
              label="File NPWP"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.npwp_file_url ? (
                  <FileLink url={detail.npwp_file_url} />
                ) : (
                  "-"
                )}
              </div>
            </InfoCard>

            <InfoCard
              label="File KTP Notaris"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.ktp_notaris_url ? (
                  <FileLink url={detail.ktp_notaris_url} />
                ) : (
                  "-"
                )}
              </div>
            </InfoCard>
            <InfoCard
              label="File Tanda Tangan"
              className="dark:bg-[#01043c] dark:text-gray-400"
            >
              <FileLink url={detail.ttd_url} />
            </InfoCard>

            <InfoCard
              label="Foto Formal"
              className="md:col-span-2 dark:bg-[#01043c]"
            >
              <div className="text-lg dark:text-[#f5fefd]">
                {detail.foto_url ? <FileLink url={detail.foto_url} /> : "-"}
              </div>
            </InfoCard>
          </div>
        </div>
      )}
    </Modal>
  );
}
