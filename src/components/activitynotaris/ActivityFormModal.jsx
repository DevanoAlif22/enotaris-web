// components/activitynotaris/ActivityFormModal.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import SearchSelect from "../../components/input/SearchSelect";
import { deedService } from "../../services/deedService";
import { activityService } from "../../services/activityService";
import { showError } from "../../utils/toastConfig";

/* Overlay sederhana; ganti dengan komponenmu kalau sudah ada */
function LoadingOverlay({ show, text = "Memproses..." }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="rounded-lg bg-white px-4 py-2 text-sm shadow">{text}</div>
    </div>
  );
}

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: (payload: { id?, name, deed_id, parties: [{value,label}] }) => Promise<void> | void
 * - initial?: { id?, name, deed_id, parties: [{value,label}] } // value boleh string/number
 */
export default function ActivityFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}) {
  const isEdit = Boolean(initial?.id);

  // form state
  const [name, setName] = useState("");
  const [deedId, setDeedId] = useState(null); // id akta
  // simpan user id sebagai STRING supaya konsisten & gampang dibandingkan
  const [partyValues, setPartyValues] = useState([]); // string|null
  const [isSubmitting, setIsSubmitting] = useState(false);

  // data source
  const [deeds, setDeeds] = useState([]); // [{id,name,total_client}]
  const [clients, setClients] = useState([]); // [{value(string),label,name,email,avatar}]
  const [loadingDeed, setLoadingDeed] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Track if initial data has been applied
  const [initialDataApplied, setInitialDataApplied] = useState(false);

  // ===== fetch base data when opened =====
  useEffect(() => {
    if (!open) {
      // Reset state when modal is closed
      setInitialDataApplied(false);
      return;
    }

    // Reset form data immediately
    setName(initial?.name ?? "");
    setDeedId(initial?.deed_id ?? null);

    // fetch daftar akta
    (async () => {
      try {
        setLoadingDeed(true);
        const res = await deedService.list({ per_page: 100 });
        const items = Array.isArray(res?.data) ? res.data : [];
        setDeeds(items);
      } catch (e) {
        showError(e.message || "Gagal memuat daftar akta.");
        setDeeds([]);
      } finally {
        setLoadingDeed(false);
      }
    })();

    // fetch daftar klien terverifikasi
    (async () => {
      try {
        setLoadingClients(true);
        const res = await activityService.listClients("");
        const items = Array.isArray(res?.data) ? res.data : [];
        // pastikan value jadi STRING
        const normalized = items.map((c) => ({
          ...c,
          value: c?.value === 0 || c?.value ? String(c.value) : "",
        }));
        setClients(normalized);
      } catch (e) {
        showError(e.message || "Gagal memuat daftar klien.");
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    })();
  }, [open]); // eslint-disable-line

  // Apply initial party values AFTER clients data is loaded
  useEffect(() => {
    if (!open || initialDataApplied || loadingClients || !clients.length) {
      return;
    }

    // Only apply initial parties if we have initial data and clients are loaded
    if (initial?.parties && Array.isArray(initial.parties)) {
      const initPartyIds = initial.parties
        .map((p) => (p?.value === 0 || p?.value ? String(p.value) : null))
        .filter((v) => v !== null);
      setPartyValues(initPartyIds);
      setInitialDataApplied(true);
    } else if (!isEdit) {
      // For new activities, ensure empty array
      setPartyValues([]);
      setInitialDataApplied(true);
    }
  }, [
    open,
    loadingClients,
    clients.length,
    initial,
    isEdit,
    initialDataApplied,
  ]);

  // opsi deeds untuk SearchSelect
  const deedOptions = useMemo(
    () =>
      deeds.map((d) => ({
        value: d.id,
        label: d.name,
        total_client: d.total_client,
      })),
    [deeds]
  );

  // jumlah penghadap dari akta terpilih
  const requiredParties = useMemo(() => {
    const found = deedOptions.find((o) => o.value === deedId);
    return Number(found?.total_client || 0);
  }, [deedId, deedOptions]);

  // jika ganti deed → sesuaikan panjang partyValues TANPA merombak urutan yang sudah ada
  useEffect(() => {
    if (!open || !initialDataApplied) return;
    if (!requiredParties) {
      setPartyValues([]); // kosong bila belum pilih akta
      return;
    }
    setPartyValues((old) => {
      const arr = Array.isArray(old) ? [...old] : [];
      if (arr.length === requiredParties) return arr;
      if (arr.length > requiredParties) return arr.slice(0, requiredParties);
      while (arr.length < requiredParties) arr.push(null);
      return arr;
    });
  }, [requiredParties, open, initialDataApplied]);

  // build options per field (exclude yang sudah dipilih di field lain)
  const optionsForIndex = (idx) => {
    const chosen = new Set(
      partyValues.map((v, i) => (i === idx ? null : v)).filter(Boolean)
    );
    return clients
      .filter((c) => !chosen.has(c.value))
      .map((c) => ({ value: c.value, label: c.label }));
  };

  const handlePartyChange = (idx, val) => {
    // val bisa string/number dari SearchSelect; simpan sebagai STRING
    const v = val === 0 || val ? String(val) : null;
    setPartyValues((old) => {
      const arr = [...old];
      arr[idx] = v;
      return arr;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return showError("Nama aktivitas wajib diisi.");
    if (!deedId) return showError("Jenis akta wajib dipilih.");
    if (requiredParties > 0) {
      const filled = partyValues.filter(Boolean);
      if (filled.length !== requiredParties) {
        return showError(`Akta ini memerlukan ${requiredParties} penghadap.`);
      }
    }

    const partiesPayload = partyValues.map((uidStr) => {
      const found = clients.find((c) => c.value === uidStr);
      // kirim angka ke BE kalau memang numeric
      const maybeNum = Number(uidStr);
      const value = Number.isFinite(maybeNum) ? maybeNum : uidStr;
      return found
        ? { value, label: found.label }
        : { value, label: String(uidStr) };
    });

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...(isEdit ? { id: initial.id } : {}),
        name: name.trim(),
        deed_id: deedId,
        parties: partiesPayload, // urutan penting → jadi pivot.order
      });
      onClose();
    } catch (err) {
      // kalau error, biar modal tetap terbuka
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while initial data is being processed
  const isInitializing =
    open && (!initialDataApplied || loadingClients || loadingDeed);

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={isEdit ? "Edit Aktivitas" : "Tambah Aktivitas"}
      size="lg"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-100 disabled:opacity-60"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || isInitializing}
            className="px-4 py-2 rounded-lg bg-[#0256c4] text-white font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      {/* overlay loading submit */}
      <div className="relative">
        <LoadingOverlay show={isSubmitting} />

        {/* Loading overlay for initialization */}
        {isInitializing && <LoadingOverlay show={true} text="Memuat data..." />}

        <div className="grid grid-cols-1 gap-5">
          {/* Nama Aktivitas */}
          <InputField
            label="Nama Aktivitas"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting || isInitializing}
          />

          {/* Jenis Akta */}
          <SearchSelect
            label="Jenis Akta"
            placeholder={loadingDeed ? "Memuat..." : "Pilih jenis akta..."}
            options={deedOptions.map((o) => ({
              value: o.value,
              label: `${o.label} (butuh ${o.total_client} penghadap)`,
            }))}
            value={deedId}
            onChange={setDeedId}
            disabled={loadingDeed || isSubmitting || isInitializing}
            required
          />

          {/* Info jumlah penghadap */}
          {deedId ? (
            <div className="text-sm text-gray-600">
              Akta terpilih membutuhkan <b>{requiredParties}</b> penghadap.
            </div>
          ) : null}

          {/* Dynamic Party Fields */}
          {Array.from({ length: requiredParties || 0 }).map((_, idx) => (
            <SearchSelect
              key={idx}
              label={`Penghadap ${idx + 1}`}
              placeholder={
                loadingClients ? "Memuat klien..." : "Pilih klien..."
              }
              options={optionsForIndex(idx)}
              value={partyValues[idx] ?? null} // string|null
              onChange={(v) => handlePartyChange(idx, v)}
              disabled={loadingClients || isSubmitting || isInitializing}
              required
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
