import React, { useMemo } from "react";
import Modal from "../Modal";

/**
 * row: bisa dioper activity penuh (punya field schedules)
 * schedules[0]: { id, activity_id, date: ISO-Z (Y-m-dT00:00:00Z), time: "HH:mm", location, notes }
 */
function ScheduleViewModal({ open, onClose, row }) {
  // gabungkan date (UTC Z) + time menjadi Date lokal
  const view = useMemo(() => {
    const s = row?.schedules?.[0];
    if (!s) return null;

    // Ambil YYYY-MM-DD dari field date (format Z dari backend)
    const dOnly = typeof s.date === "string" ? s.date.slice(0, 10) : "";
    const tOnly = s.time || "";

    if (!dOnly || !tOnly)
      return { dt: null, location: s.location, notes: s.notes };

    // Buat Date lokal dari gabungan YYYY-MM-DD + HH:mm
    const local = new Date(`${dOnly}T${tOnly}:00`);
    // Jika ingin pastikan sebagai “waktu lokal”, kita offset manual (opsional)
    // const localFixed = new Date(local.getTime() - local.getTimezoneOffset() * 60000);

    return {
      dt: local,
      location: s.location,
      notes: s.notes,
    };
  }, [row]);

  const fmtDate = (d) =>
    d
      ? d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

  const fmtTime = (d) =>
    d
      ? d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Penjadwalan"
      size="sm"
      actions={
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">
          Tutup
        </button>
      }
    >
      {view?.dt ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Tanggal</div>
          <div className="text-lg font-semibold">{fmtDate(view.dt)}</div>

          <div className="text-sm text-gray-500 mt-4">Waktu</div>
          <div className="text-lg font-semibold">{fmtTime(view.dt)}</div>

          {view.location ? (
            <>
              <div className="text-sm text-gray-500 mt-4">Lokasi</div>
              <div className="text-lg font-semibold">{view.location}</div>
            </>
          ) : null}

          {view.notes ? (
            <>
              <div className="text-sm text-gray-500 mt-4">Catatan</div>
              <div className="text-[15px]">{view.notes}</div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="text-gray-600">Belum dijadwalkan.</div>
      )}
    </Modal>
  );
}

export default ScheduleViewModal;
