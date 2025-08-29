"use client";
import { useState, useEffect } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import TextAreaField from "../../components/input/TextAreaField";

export default function DeedFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState({
    name: "",
    description: "",
    penghadap_count: 1,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
        penghadap_count: initialData?.penghadap_count ?? 1,
      });
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "penghadap_count" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return alert("Nama wajib diisi");
    onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      ...form,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Akta" : "Tambah Akta"}
      size="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-[#0256c4] text-white font-semibold"
          >
            {isEdit ? "Simpan" : "Tambah"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <InputField
            label="Nama Lengkap"
            name="namaLengkap"
            value={form.name}
            onChange={handleChange}
            required={true}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <TextAreaField
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none"
            placeholder="Deskripsi singkat akta…"
          />
        </div>
        <div>
          <InputField
            type={"number"}
            label="Jumlah Penghadap"
            name="totalclient"
            value={form.totalclient}
            onChange={handleChange}
            required={true}
          />
        </div>
      </div>
    </Modal>
  );
}
