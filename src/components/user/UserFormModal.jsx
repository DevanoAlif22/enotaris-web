// components/user/UserFormModal.jsx
"use client";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import InputField from "../input/InputField";
import CheckCardGroup from "../input/CheckCardGroup";
import { ScaleIcon, UserIcon } from "@heroicons/react/24/outline";

function LoadingOverlay({ show, text = "Memproses..." }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="rounded-lg bg-white px-4 py-2 text-sm shadow">{text}</div>
    </div>
  );
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData?.id); // saat ini kita pakai untuk Tambah (isEdit=false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "", // "notaris" | "klien"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      password: "", // demi keamanan, kosongkan pada edit
      role:
        initialData?.role_label?.toLowerCase() ||
        (initialData?.role_id === 3
          ? "notaris"
          : initialData?.role_id === 2
          ? "klien"
          : ""),
    });
  }, [open, initialData]);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.name.trim()) return "Nama wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Format email tidak valid.";
    if (!isEdit && (!form.password || form.password.length < 6))
      return "Password minimal 6 karakter.";
    if (!form.role) return "Role wajib dipilih (Notaris/Klien).";
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return alert(msg);

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password, // BE akan validasi min:6
        role: form.role, // "notaris" | "klien"
      });
      onClose();
    } catch (e) {
      // error dihandle parent (showError)
      console.error(e);
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
          <span className="text-xl dark:text-[#f5fefd]">Edit Pengguna</span>
        ) : (
          <span className="text-xl dark:text-[#f5fefd]">Tambah Pengguna</span>
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
          <InputField
            label={<span className="dark:text-[#f5fefd]">Nama</span>}
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            placeholder="Nama lengkap"
            disabled={isSubmitting}
          />

          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            placeholder="nama@email.com"
            disabled={isSubmitting}
          />

          {!isEdit && (
            <InputField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              placeholder="Minimal 6 karakter"
              disabled={isSubmitting}
            />
          )}

          <CheckCardGroup
            labelDescription="Pilih peran pengguna"
            containerStyle="mt-2 text-black"
            options={[
              {
                name: "Notaris",
                value: "notaris",
                icon: <ScaleIcon className="w-6 h-6" />,
              },
              {
                name: "Klien",
                value: "klien",
                icon: <UserIcon className="w-6 h-6" />,
              },
            ]}
            defaultValue={form.role}
            updateType="role"
            updateFormValue={(type, value) => update(type, value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Modal>
  );
}
