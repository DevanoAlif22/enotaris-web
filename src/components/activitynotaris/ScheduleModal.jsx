"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import TextAreaField from "../../components/input/TextAreaField";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - activity: { code, deed_type, party1, party2 }   // untuk header
 * - initial?: { datetime?: string, place?: string, note?: string }
 * - onSave: ({ datetime, place, note }) => void
 */
export default function ScheduleModal({
  open,
  onClose,
  activity,
  initial,
  onSave,
}) {
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [dateErr, setDateErr] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial?.datetime) {
      const d = new Date(initial.datetime);
      setDate(d.toISOString().slice(0, 10));
      setTime(d.toTimeString().slice(0, 5));
    } else {
      setDate("");
      setTime("");
    }
    setPlace(initial?.place ?? "");
    setNote(initial?.note ?? "");
    setDateErr("");
  }, [open, initial]);

  const isWeekday = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return true;
    const d = new Date(yyyy_mm_dd + "T00:00:00");
    const day = d.getDay(); // 0 Minggu … 6 Sabtu
    return day >= 1 && day <= 5;
  };

  const handleDate = (v) => {
    setDate(v);
    if (!isWeekday(v)) setDateErr("Tanggal harus hari kerja (Senin–Jumat).");
    else setDateErr("");
  };

  const handleSave = () => {
    if (!date) return alert("Tanggal wajib diisi");
    if (!isWeekday(date))
      return alert("Tanggal harus hari kerja (Senin–Jumat).");
    if (!time) return alert("Waktu wajib diisi");
    if (!place.trim()) return alert("Lokasi pertemuan wajib diisi");

    const iso = new Date(`${date}T${time}:00`).toISOString();
    onSave({ datetime: iso, place: place.trim(), note: note.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Jadwalkan Pertemuan"
      size="lg"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#0256c4] text-white font-semibold"
          >
            Simpan
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Detail Aktivitas */}
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-lg font-semibold mb-2">Detail Aktivitas</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[15px]">
            <div>
              <span className="text-gray-500">Kode:&nbsp;</span>
              <span className="font-medium">{activity?.code || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">Jenis Akta:&nbsp;</span>
              <span className="font-medium">{activity?.deed_type || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">Penghadap 1:&nbsp;</span>
              <span className="font-medium">{activity?.party1 || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500">Penghadap 2:&nbsp;</span>
              <span className="font-medium">{activity?.party2 || "-"}</span>
            </div>
          </div>
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 h-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p
              className={`mt-2 text-sm ${
                dateErr ? "text-red-600" : "text-gray-500"
              }`}
            >
              {dateErr || "Hanya hari kerja (Senin–Jumat)"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              step="300"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 h-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              Contoh: 09:00, 13:30, 16:00
            </p>
          </div>
        </div>

        {/* Lokasi */}
        <InputField
          label={
            <span>
              Lokasi Pertemuan <span className="text-red-500">*</span>
            </span>
          }
          name="place"
          type="text"
          placeholder="Kantor notaris, rumah klien, dll."
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          required
        />

        {/* Catatan */}
        <TextAreaField
          label="Catatan Tambahan"
          name="note"
          rows={3}
          placeholder="Dokumen yang perlu disiapkan, catatan khusus, dll."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
