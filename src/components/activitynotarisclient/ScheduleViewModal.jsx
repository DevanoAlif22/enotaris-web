import React from "react";
import Modal from "../Modal";
import { fmtDate } from "../../helpers/fmtDate";
import { fmtTime } from "../../helpers/fmtTime";

function ScheduleViewModal({ open, onClose, row }) {
  if (!row) return null;
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
      {row.schedule ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">Tanggal</div>
          <div className="text-lg font-semibold">{fmtDate(row.schedule)}</div>
          <div className="text-sm text-gray-500 mt-4">Waktu</div>
          <div className="text-lg font-semibold">{fmtTime(row.schedule)}</div>
          {row.place && (
            <>
              <div className="text-sm text-gray-500 mt-4">Lokasi</div>
              <div className="text-lg font-semibold">{row.place}</div>
            </>
          )}
          {row.note && (
            <>
              <div className="text-sm text-gray-500 mt-4">Catatan</div>
              <div className="text-[15px]">{row.note}</div>
            </>
          )}
        </div>
      ) : (
        <div className="text-gray-600">Belum dijadwalkan.</div>
      )}
    </Modal>
  );
}

export default ScheduleViewModal;
