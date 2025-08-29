function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    menunggu: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    disetujui: "bg-green-50 text-green-700 border border-green-200",
    ditolak: "bg-red-50 text-red-700 border border-red-200",
  };
  const cls = map[s] || "bg-gray-50 text-gray-700 border border-gray-200";
  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${cls}`}>
      {status || "-"}
    </span>
  );
}
export default StatusBadge;