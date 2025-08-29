import StatusBadge from "../../utils/StatusBadge";
import Modal from "../Modal";
import Avatar from "../Avatar";

function UserDetailModal({ open, onClose, user }) {
  if (!user) return null;

  const fmtDateTime = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Pengguna"
      titleAlign="center"
      size="lg"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10"
        >
          Tutup
        </button>
      }
    >
      <div className="space-y-4">
        {/* Nama + avatar */}
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar_url} />
          <div>
            <div className="text-sm text-gray-500">Nama</div>
            <div className="text-2xl font-bold">{user.name}</div>
          </div>
        </div>

        {/* grid info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Email</div>
            <div className="text-lg font-semibold">{user.email || "-"}</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Jenis Kelamin</div>
            <div className="text-lg font-semibold">{user.gender || "-"}</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Role</div>
            <div className="text-lg font-semibold">{user.role || "-"}</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Bergabung Sejak</div>
          <div className="text-lg font-semibold">
            {fmtDateTime(user.joined_at)}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserDetailModal;
