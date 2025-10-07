export const toYmd = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const toHm = (d) => {
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
};

// helper untuk initial ISO datetime dari {date, time} (YYYY-MM-DD, HH:mm) -> local ISO tanpa offset salah
export const localDateTimeToISO = (date, time) => {
  if (!date || !time) return "";
  const local = new Date(`${date}T${time}:00`);
  const fixed = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
  return fixed.toISOString();
};
