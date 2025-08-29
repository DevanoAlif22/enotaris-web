"use client";
import Modal from "../Modal";
import StatusBadge from "../../utils/StatusBadge";
import FileLink from "../../utils/FileLink";

/* === helpers kecil === */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const Avatar = ({ name = "", src = "" }) => {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  return src ? (
    <img
      src={src}
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
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className="text-lg font-semibold">{children ?? "-"}</div>
  </div>
);

function VerificationDetailModal({ open, onClose, item }) {
  if (!item) return null;

  // handle beberapa kemungkinan nama field
  const phone = item.phone ?? item.telepon ?? "-";
  const gender = item.gender ?? item.jenis_kelamin ?? "-";
  const role = item.role ?? "-";
  const joinedAt = item.joined_at ?? item.created_at;
  const address = item.address ?? item.alamat ?? "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Verifikasi"
      titleAlign="center"
      size="lg"
      actions={
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">
          Tutup
        </button>
      }
    >
      <div className="space-y-5">
        {/* Header: avatar + nama/email/ID */}
        <div className="flex items-center gap-4">
          <Avatar name={item.name} src={item.avatar_url} />
          <div>
            <div className="text-2xl font-bold">{item.name || "-"}</div>
            <div className="text-gray-600">{item.email || "-"}</div>
            <div className="text-sm text-gray-400">ID: {item.id ?? "-"}</div>
          </div>
        </div>

        {/* Status Verifikasi */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Status Verifikasi</div>
          <StatusBadge status={item.status} />
        </div>

        {/* Grid info umum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Telepon">{phone}</InfoCard>
          <InfoCard label="Jenis Kelamin">{gender}</InfoCard>
          <InfoCard label="Role">{role}</InfoCard>
          <InfoCard label="Bergabung Sejak">{fmtDate(joinedAt)}</InfoCard>
        </div>

        <InfoCard label="Alamat" className="col-span-1 md:col-span-2">
          {address}
        </InfoCard>

        {/* Section Identitas */}
        <h3 className="text-xl font-bold mt-2">Identitas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* kiri */}
          <InfoCard label="NIK">{item.nik || "-"}</InfoCard>
          <InfoCard label="NPWP">{item.npwp || "-"}</InfoCard>

          <InfoCard label="KTP Notaris">{item.ktp_notaris || "-"}</InfoCard>
          <InfoCard label="File KTP">
            <FileLink url={item.ktp_url} />
          </InfoCard>

          <InfoCard label="File KK">
            <FileLink url={item.kk_url} />
          </InfoCard>
          <InfoCard label="File NPWP">
            <FileLink url={item.npwp_file_url} />
          </InfoCard>

          <InfoCard label="File KTP Notaris">
            <FileLink url={item.ktp_notaris_url} />
          </InfoCard>
          <InfoCard label="File Tanda Tangan">
            <FileLink url={item.ttd_url} />
          </InfoCard>

          {/* full width bawah */}
          <InfoCard label="Foto Formal" className="md:col-span-2">
            <FileLink url={item.foto_url} />
          </InfoCard>
        </div>
      </div>
    </Modal>
  );
}

export default VerificationDetailModal;
