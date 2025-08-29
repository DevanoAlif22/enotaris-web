"use client";
import { useState, useEffect, useMemo } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import SearchSelect from "../../components/input/SearchSelect";
import { genCode } from "../../helpers/genCode";

export default function ActivityFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  deedOptions, // optional: [{value,label}] kalau mau override
  userOptions, // optional: [{value,label}]
}) {
  const isEdit = Boolean(initial?.id);

  // mock options default (bisa dioper dari parent via props)
  const deedOpts = useMemo(
    () =>
      deedOptions?.length
        ? deedOptions
        : [
            { value: "Pendirian PT", label: "Pendirian PT" },
            { value: "Pendirian CV", label: "Pendirian CV" },
            {
              value: "Perubahan Anggaran Dasar",
              label: "Perubahan Anggaran Dasar",
            },
          ],
    [deedOptions]
  );

  const userOpts = useMemo(
    () =>
      userOptions?.length
        ? userOptions
        : [
            { value: "yasmin", label: "yasmin" },
            { value: "devano", label: "devano" },
            { value: "adam", label: "adam" },
          ],
    [userOptions]
  );

  const [form, setForm] = useState({
    code: "",
    name: "",
    deed_type: "",
    party1: "",
    party2: "",
  });

  // query pencarian untuk penghadap 1 & 2
  const [qP1, setQP1] = useState("");
  const [qP2, setQP2] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        code: initial?.code || genCode(),
        name: initial?.name || "",
        deed_type: initial?.deed_type || "",
        party1: initial?.party1 || "",
        party2: initial?.party2 || "",
      });
      setQP1("");
      setQP2("");
    }
  }, [open, initial]);

  const filteredUsers1 = useMemo(() => {
    const q = qP1.trim().toLowerCase();
    const base = userOpts;
    return q ? base.filter((u) => u.label.toLowerCase().includes(q)) : base;
  }, [qP1, userOpts]);

  const filteredUsers2 = useMemo(() => {
    const q = qP2.trim().toLowerCase();
    const base = userOpts.filter((u) => u.value !== form.party1);
    return q ? base.filter((u) => u.label.toLowerCase().includes(q)) : base;
  }, [qP2, userOpts, form.party1]);

  const handleSave = () => {
    if (!form.name.trim()) return alert("Nama aktivitas wajib diisi");
    if (!form.deed_type) return alert("Jenis akta wajib dipilih");
    if (!form.party1) return alert("Penghadap 1 wajib dipilih");
    onSubmit({
      ...(initial?.id ? { id: initial.id } : {}),
      ...form,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Aktivitas" : "Tambah Aktivitas"}
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
      <div className="grid grid-cols-1 gap-5">
        {/* Nama Aktivitas */}
        <InputField
          label={<span>Nama Aktivitas</span>}
          name="name"
          type="text"
          placeholder=""
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />

        {/* Jenis Akta */}
        <SearchSelect
          label={<span>Jenis Akta</span>}
          placeholder="Pilih jenis akta..."
          options={deedOpts}
          value={form.deed_type}
          onChange={(v) => setForm((f) => ({ ...f, deed_type: v }))}
          required
        />

        {/* Penghadap 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Penghadap 1 <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            placeholder="Pilih penghadap 1..."
            options={filteredUsers1}
            value={form.party1}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                party1: v,
                party2: v === f.party2 ? "" : f.party2, // cegah sama
              }))
            }
          />
        </div>

        {/* Penghadap 2 (opsional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Penghadap 2 (opsional)
          </label>
          <SearchSelect
            placeholder={
              form.party1 ? "Pilih penghadap 2..." : "Pilih Penghadap 1 dulu"
            }
            options={filteredUsers2}
            value={form.party2}
            onChange={(v) => setForm((f) => ({ ...f, party2: v }))}
            disabled={!form.party1}
          />
        </div>
      </div>
    </Modal>
  );
}
