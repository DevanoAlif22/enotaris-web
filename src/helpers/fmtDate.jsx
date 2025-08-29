/* ========= helpers ========= */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });

export { fmtDate };
