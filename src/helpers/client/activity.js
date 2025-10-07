// map status server -> label badge FE
export const mapStatusToBadge = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "disetujui") return "Disetujui";
  if (v === "rejected" || v === "ditolak") return "Ditolak";
  return "Menunggu";
};

// ambil email user dari localStorage
export const getCurrentUserEmail = () => {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.email ? String(u.email).toLowerCase() : null;
  } catch {
    return null;
  }
};

// status spesifik user dari activity
export const getUserSpecificStatus = (activity, userEmail) => {
  if (!userEmail || !Array.isArray(activity?.clients)) return null;

  const current = activity.clients.find(
    (c) => (c.email || "").toLowerCase() === userEmail
  );
  if (current?.pivot) return current.pivot.status_approval;

  // fallback via client_activities (jika ada)
  if (Array.isArray(activity?.client_activities)) {
    const userClient = activity.clients.find(
      (c) => (c.email || "").toLowerCase() === userEmail
    );
    const p = activity.client_activities.find(
      (ca) => ca.user_id === userClient?.id
    );
    return p?.status_approval ?? null;
  }
  return null;
};

export const inferStatusFromPivots = (a) => {
  const pivots = Array.isArray(a.clientActivities) ? a.clientActivities : [];
  if (!pivots.length) return "pending";
  const allApproved = pivots.every((p) => p.status_approval === "approved");
  const anyRejected = pivots.some((p) => p.status_approval === "rejected");
  if (allApproved) return "approved";
  if (anyRejected) return "rejected";
  return "pending";
};

export const mapRow = (a, email) => {
  let statusRaw =
    getUserSpecificStatus(a, email) ||
    a.status_approval ||
    inferStatusFromPivots(a);
  let userOrder = null;
  if (email && Array.isArray(a?.clients)) {
    const userClient = a.clients.find(
      (c) => (c.email || "").toLowerCase() === email
    );
    userOrder = userClient?.pivot?.order ?? null;
  }
  return {
    id: a.id,
    code: a.tracking_code,
    name: a.name,
    deed_type: a.deed?.name || "-",
    status: mapStatusToBadge(statusRaw),
    statusRaw,
    userOrder,
    schedule: null,
  };
};
