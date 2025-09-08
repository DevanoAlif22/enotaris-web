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
  const [deedId, setDeedId] = useState(null);
  // simpan user id sebagai STRING supaya konsisten & mudah dibandingkan
  const [partyValues, setPartyValues] = useState([]); // array of string|null
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

  // Terapkan initial parties SETELAH clients loaded
  useEffect(() => {
    if (!open || initialDataApplied || loadingClients) return;

    if (
      initial?.parties &&
      Array.isArray(initial.parties) &&
      initial.parties.length
    ) {
      const initPartyIds = initial.parties
        .map((p) => (p?.value === 0 || p?.value ? String(p.value) : null))
        .filter((v) => v !== null);
      setPartyValues(initPartyIds.length ? initPartyIds : [null]);
    } else {
      // default 1 baris kosong untuk form baru
      setPartyValues([null]);
    }
    setInitialDataApplied(true);
  }, [open, loadingClients, initial, initialDataApplied]);

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
    const v = val === 0 || val ? String(val) : null;
    setPartyValues((old) => {
      const arr = [...old];
      arr[idx] = v;
      return arr;
    });
  };

  const addPartyField = () => {
    setPartyValues((old) => [...(Array.isArray(old) ? old : []), null]);
  };

  const removePartyField = (idx) => {
    setPartyValues((old) => old.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim()) return showError("Nama aktivitas wajib diisi.");
    if (!deedId) return showError("Jenis akta wajib dipilih.");

    const filled = partyValues.filter(Boolean);

    // Pastikan minimal 1 penghadap (boleh diubah sesuai kebutuhan)
    if (filled.length === 0) {
      return showError("Minimal pilih 1 penghadap.");
    }

    // Cek duplikat (harusnya opsi sudah mencegah, tapi kita double-check)
    const setVals = new Set(filled);
    if (setVals.size !== filled.length) {
      return showError("Tidak boleh ada penghadap yang sama.");
    }

    const partiesPayload = filled.map((uidStr) => {
      const found = clients.find((c) => c.value === uidStr);
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
        parties: partiesPayload,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // disable "Tambah Penghadap" kalau:
  // - masih loading / init
  // - masih ada baris yang kosong
  // - tidak ada kandidat client tersisa
  const canAddMore = useMemo(() => {
    if (loadingClients) return false;
    if (!Array.isArray(partyValues) || partyValues.some((v) => !v))
      return false;
    const chosen = new Set(partyValues.filter(Boolean));
    const remaining = clients.filter((c) => !chosen.has(c.value));
    return remaining.length > 0;
  }, [partyValues, clients, loadingClients]);

  const isInitializing =
    open && (!initialDataApplied || loadingClients || loadingDeed);

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={
        isEdit ? (
          <span className="text-xl dark:text-[#f5fefd]">Edit Akta</span>
        ) : (
          <span className="text-xl dark:text-[#f5fefd]">Tambah Akta</span>
        )
      }
      size="lg"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg dark:text-gray-600 bg-gray-100 dark:bg-[#f5fefd]"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || isInitializing}
            className="px-4 py-2 rounded-lg bg-[#0256c4] hover:bg-[#0649a0] transition-colors text-white font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan…" : "Simpan"}
          </button>
        </>
      }
    >
      <div className="relative">
        <LoadingOverlay show={isSubmitting} />
        {isInitializing && <LoadingOverlay show={true} text="Memuat data..." />}

        <div className="grid grid-cols-1 gap-5">
          {/* Nama Aktivitas */}
          <InputField
            label={<span className="dark:text-[#f5fefd]">Nama Aktivitas</span>}
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting || isInitializing}
          />

          {/* Jenis Akta */}
          <SearchSelect
            label={<span className="dark:text-[#f5fefd]">Jenis Akta</span>}
            placeholder={loadingDeed ? "Memuat..." : "Pilih jenis akta..."}
            options={deedOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={deedId}
            onChange={setDeedId}
            disabled={loadingDeed || isSubmitting || isInitializing}
            required
          />

          {/* Dynamic Party Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-70 font-medium">Penghadap</div>
              <button
                type="button"
                onClick={addPartyField}
                disabled={!canAddMore || isSubmitting || isInitializing}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium disabled:opacity-60"
              >
                + Tambah Penghadap
              </button>
            </div>

            {Array.isArray(partyValues) && partyValues.length === 0 && (
              <div className="text-sm text-gray-500">
                Belum ada penghadap. Tambahkan minimal 1.
              </div>
            )}

            {partyValues.map((val, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchSelect
                    label={`Penghadap ${idx + 1}`}
                    placeholder={
                      loadingClients ? "Memuat klien..." : "Pilih klien..."
                    }
                    options={optionsForIndex(idx)}
                    value={val ?? null}
                    onChange={(v) => handlePartyChange(idx, v)}
                    disabled={loadingClients || isSubmitting || isInitializing}
                    required
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removePartyField(idx)}
                    disabled={
                      isSubmitting || isInitializing || partyValues.length <= 1
                    }
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium disabled:opacity-60"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-500">
              Catatan: User yang sudah dipilih tidak akan muncul di dropdown
              lain.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
