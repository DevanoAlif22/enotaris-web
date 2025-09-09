// utils/verifBadge.js
export function getVerifBadge(statusVerification) {
  const s = (statusVerification || "").toLowerCase();
  if (["approved", "verified", "success"].includes(s))
    return { text: "Terverifikasi", cls: "bg-green-100 text-green-800" };
  if (s === "rejected")
    return { text: "Ditolak", cls: "bg-red-100 text-red-800" };
  if (s === "pending")
    return { text: "Menunggu", cls: "bg-yellow-100 text-yellow-800" };
  return { text: "Belum diverifikasi", cls: "bg-gray-100 text-gray-700" };
}
