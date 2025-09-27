// components/activitynotaris/ScheduleModal.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import TextAreaField from "../../components/input/TextAreaField";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - activity: { code?: string, deed_type?: string, parties?: string[] }
 * - initial?: { id?: number|string, datetime?: string, place?: string, note?: string }
 * - onSave?: ({ datetime, place, note }) => Promise|void
 * - onDelete?: () => Promise|void
 */
export default function ScheduleModal({
  open,
  onClose,
  activity,
  initial,
  onSave,
  onDelete,
}) {
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [errs, setErrs] = useState({ date: "", time: "", place: "" });

  const parties = useMemo(() => {
    if (Array.isArray(activity?.parties) && activity.parties.length)
      return activity.parties;
    if (
      Array.isArray(activity?.activityClients) &&
      activity.activityClients.length
    ) {
      return activity.activityClients.map(
        (c, i) => c?.name || c?.email || `Penghadap ${i + 1}`
      );
    }
    return [];
  }, [activity]);

  const isEdit = Boolean(initial?.id || initial?.datetime);
  const hasSaveHandler = typeof onSave === "function";
  const hasDeleteHandler = typeof onDelete === "function";

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  const isWeekday = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return true;
    const d = new Date(`${yyyy_mm_dd}T00:00:00`);
    const day = d.getDay(); // 0 Sun … 6 Sat
    return day >= 1 && day <= 5;
  };

  useEffect(() => {
    if (!open) return;
    if (initial?.datetime) {
      const d = new Date(initial.datetime);
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      setDate(local.toISOString().slice(0, 10));
      setTime(`${pad(local.getHours())}:${pad(local.getMinutes())}`);
    } else {
      setDate("");
      setTime("");
    }
    setPlace(initial?.place ?? "");
    setNote(initial?.note ?? "");
    setErrs({ date: "", time: "", place: "" });
  }, [open, initial]);

  const validate = () => {
    const next = { date: "", time: "", place: "" };
    if (!date) next.date = "Tanggal wajib diisi.";
    else if (!isWeekday(date))
      next.date = "Tanggal harus hari kerja (Senin–Jumat).";
    else if (date < minDate) next.date = "Tanggal tidak boleh di masa lalu.";
    if (!time) next.time = "Waktu wajib diisi.";
    if (!place.trim()) next.place = "Lokasi pertemuan wajib diisi.";
    setErrs(next);
    return !next.date && !next.time && !next.place;
  };

  const handleSave = () => {
    if (!hasSaveHandler) return; // guard
    if (!validate()) return;
    const dt = new Date(`${date}T${time}:00`);
    const iso = new Date(
      dt.getTime() - dt.getTimezoneOffset() * 60000
    ).toISOString();
    onSave({ datetime: iso, place: place.trim(), note: note.trim() });
    onClose();
  };

  const canSave = useMemo(() => {
    if (!hasSaveHandler) return false;
    return Boolean(
      date && time && place.trim() && isWeekday(date) && date >= minDate
    );
  }, [date, time, place, minDate, hasSaveHandler]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Perbarui Jadwal" : "Buat Jadwal"}
      size="lg"
      actions={
        <>
          {!!initial?.id && hasDeleteHandler && (
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-600 mr-auto"
            >
              Hapus
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${
              canSave
                ? "bg-[#0256c4] hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            title={
              !hasSaveHandler ? "Anda tidak memiliki izin untuk menyimpan" : ""
            }
          >
            {isEdit ? "Simpan Perubahan" : "Simpan"}
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
          </div>

          <div className="mt-3">
            <span className="text-gray-500 block mb-1">Penghadap:</span>
            {parties.length ? (
              <ul className="list-disc pl-6 space-y-0.5">
                {parties.map((p, idx) => (
                  <li key={idx} className="font-medium">
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="font-medium">-</div>
            )}
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
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() =>
                !errs.date &&
                !isWeekday(date) &&
                setErrs((x) => ({
                  ...x,
                  date: "Tanggal harus hari kerja (Senin–Jumat).",
                }))
              }
              className={`w-full border rounded-lg px-4 h-12 focus:ring-2 focus:outline-none ${
                errs.date
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            <p
              className={`mt-2 text-sm ${
                errs.date ? "text-red-600" : "text-gray-500"
              }`}
            >
              {errs.date || "Hanya hari kerja (Senin–Jumat)."}
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
              className={`w-full border rounded-lg px-4 h-12 focus:ring-2 focus:outline-none ${
                errs.time
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            <p
              className={`mt-2 text-sm ${
                errs.time ? "text-red-600" : "text-gray-500"
              }`}
            >
              {errs.time || "Contoh: 09:00, 13:30, 16:00"}
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
          error={errs.place}
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
