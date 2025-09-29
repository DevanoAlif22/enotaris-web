// components/deed/DeedFormModal.jsx
"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import TextAreaField from "../../components/input/TextAreaField";

function LoadingOverlay({ show, text = "Memproses..." }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="rounded-lg bg-white px-4 py-2 text-sm shadow">{text}</div>
    </div>
  );
}

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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
    });
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) return alert("Nama wajib diisi");

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...(initialData?.id ? { id: initialData.id } : {}),
        name,
        description: form.description?.trim() ?? "",
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      size="md"
      actions={
        <>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-[#0256c4] hover:bg-[#0649a0] transition-colors text-white font-semibold disabled:opacity-60"
          >
            {isEdit
              ? isSubmitting
                ? "Menyimpan…"
                : "Simpan"
              : isSubmitting
              ? "Menambah…"
              : "Tambah"}
          </button>
        </>
      }
    >
      <div className="relative">
        <LoadingOverlay show={isSubmitting} />

        <div className="space-y-4 dark:text-[#f5fefd]">
          <div>
            <InputField
              label={<span className="dark:text-[#f5fefd]">Nama Akta</span>}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Pendirian CV"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Deskripsi
            </label>
            <TextAreaField
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none"
              placeholder="Deskripsi singkat akta…"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
