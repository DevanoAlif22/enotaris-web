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
 * - activity: { code?: string, deed_type?: string, parties?: string[], activityClients?: any[] }
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

  const isEdit = Boolean(initial?.id || initial?.datetime);
  const hasSaveHandler = typeof onSave === "function";
  const hasDeleteHandler = typeof onDelete === "function";

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

  // Today (local) as YYYY-MM-DD
  const todayStr = useMemo(() => {
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

  const toLocalParts = (isoString) => {
    if (!isoString) return { d: "", t: "" };
    const src = new Date(isoString);
    const local = new Date(src.getTime() - src.getTimezoneOffset() * 60000);
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return {
      d: local.toISOString().slice(0, 10),
      t: `${pad(local.getHours())}:${pad(local.getMinutes())}`,
    };
  };

  // Initialize from initial when modal opened
  useEffect(() => {
    if (!open) return;
    if (initial?.datetime) {
      const { d, t } = toLocalParts(initial.datetime);
      setDate(d);
      setTime(t);
    } else {
      setDate("");
      setTime("");
    }
    setPlace(initial?.place ?? "");
    setNote(initial?.note ?? "");
    setErrs({ date: "", time: "", place: "" });
  }, [open, initial]);

  // Initial values for dirty check
  const initialDate = useMemo(() => {
    if (!initial?.datetime) return "";
    return toLocalParts(initial.datetime).d;
  }, [initial]);

  const initialTime = useMemo(() => {
    if (!initial?.datetime) return "";
    return toLocalParts(initial.datetime).t;
  }, [initial]);

  const isDirty = useMemo(() => {
    if (!isEdit) return true; // create mode: cukup valid saja
    return (
      date !== initialDate ||
      time !== initialTime ||
      place.trim() !== (initial?.place ?? "") ||
      note.trim() !== (initial?.note ?? "")
    );
  }, [isEdit, date, time, place, note, initialDate, initialTime, initial]);

  const validate = () => {
    const next = { date: "", time: "", place: "" };

    if (!date) next.date = "Tanggal wajib diisi.";
    if (!time) next.time = "Waktu wajib diisi.";
    if (!place.trim()) next.place = "Lokasi pertemuan wajib diisi.";

    // Saat BUAT: wajib weekday & >= hari ini; Saat EDIT: longgar
    if (!isEdit && date) {
      if (!isWeekday(date))
        next.date = "Tanggal harus hari kerja (Senin–Jumat).";
      else if (date < todayStr) next.date = "Tanggal tidak boleh di masa lalu.";
    }

    setErrs(next);
    return !next.date && !next.time && !next.place;
  };

  const handleSave = () => {
    if (!hasSaveHandler) return;
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
    if (!date || !time || !place.trim()) return false;

    // create vs edit rules
    if (!isEdit) {
      if (!isWeekday(date)) return false;
      if (date < todayStr) return false;
    }

    // hanya aktif bila ada perubahan saat edit
    if (!isDirty) return false;

    return true;
  }, [hasSaveHandler, date, time, place, todayStr, isEdit, isDirty]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="dark:text-[#f5fefd]">
          {isEdit ? "Perbarui Jadwal" : "Buat Jadwal"}
        </span>
      }
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
        <div className="bg-gray-100 dark:bg-[#01043c] rounded-xl p-4">
          <div className="text-lg font-semibold dark:text-[#f5fefd] mb-2">
            Detail Aktivitas
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[15px] dark:text-[#f5fefd]">
            <div>
              <span className="text-gray-500 dark:text-gray-300">
                Kode:&nbsp;
              </span>
              <span className="font-medium">{activity?.code || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-300">
                Jenis Akta:&nbsp;
              </span>
              <span className="font-medium">{activity?.deed_type || "-"}</span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-gray-500 dark:text-gray-300 block mb-1">
              Penghadap:
            </span>
            {parties.length ? (
              <ul className="list-disc pl-6 dark:text-[#f5fefd] space-y-0.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#f5fefd] mb-2">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              // Saat create: batasi minimal hari ini; saat edit: bebas untuk koreksi jadwal lampau
              min={!isEdit ? todayStr : undefined}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() =>
                !errs.date &&
                !isEdit &&
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
              {errs.date ||
                (!isEdit
                  ? "Hanya hari kerja (Senin–Jumat)."
                  : "Anda dapat mengubah tanggal lampau saat mengedit.")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#f5fefd] mb-2">
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
          label={<span className="dark:text-[#f5fefd]">Lokasi Pertemuan</span>}
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
          label={<span className="dark:text-[#f5fefd]">Catatan Tambahan</span>}
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
