// app/notary/helpers/activity.js

export const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

export const inferStatusFromClients = (a) => {
  const pivots = Array.isArray(a.clientActivities || a.client_activities)
    ? a.clientActivities || a.client_activities
    : [];
  if (!pivots.length) return "pending";
  const allApproved = pivots.every((p) => p.status_approval === "approved");
  const anyRejected = pivots.some((p) => p.status_approval === "rejected");
  if (allApproved) return "approved";
  if (anyRejected) return "rejected";
  return "pending";
};

export const mapRow = (a) => {
  const clients = Array.isArray(a.clients) ? a.clients : [];
  const parties = clients.map((c) => c.name || c.email || `#${c.id}`);
  const statusRaw = a.status_approval || inferStatusFromClients(a);
  return {
    id: a.id,
    code: a.tracking_code,
    name: a.name,
    deed_type: a.deed?.name || "-",
    parties,
    status: mapStatusToBadge(statusRaw),
    updated_at: a.updated_at,
  };
};
