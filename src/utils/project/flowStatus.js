export const normalize = (v) => {
  const s = String(v || "").toLowerCase();
  if (s === "done") return "done";
  if (s === "todo" || s === "progress") return "todo";
  if (s === "reject" || s === "rejected") return "reject";
  return "pending";
};
export const mapTrackToStepStatus = (track) => ({
  invite: normalize(track?.status_invite),
  respond: normalize(track?.status_respond),
  docs: normalize(track?.status_docs),
  draft: normalize(track?.status_draft),
  schedule: normalize(track?.status_schedule),
  sign: normalize(track?.status_sign),
  print: normalize(track?.status_print),
});

export const statusLabel = (status) => {
  switch (status) {
    case "done":
      return "Selesai";
    case "todo":
      return "Sedang Dikerjakan";
    case "reject":
      return "Ditolak";
    default:
      return "Terkunci";
  }
};
