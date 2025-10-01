"use client";
import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import FileInput from "../../components/input/FileInput"; // ⬅️ sesuaikan path-nya

function LoadingOverlay({ show, text = "Memproses..." }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="rounded-lg bg-white px-4 py-2 text-sm shadow">{text}</div>
    </div>
  );
}

export default function PartnerFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    name: "",
    link: "",
  });

  // file state terpusat (sinkron dengan FileInput)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [clearImage, setClearImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasServerImage = useMemo(
    () => Boolean(initialData?.image),
    [initialData]
  );

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name ?? "",
      link: initialData?.link ?? "",
    });
    setImageFile(null); // reset ke no local file
    setPreviewUrl(initialData?.image ?? ""); // tampilkan dari server kalau ada
    setClearImage(false);
  }, [open, initialData]);

  // dipanggil FileInput saat user pilih/hapus file
  const updateFileFromInput = ({ updateType, value }) => {
    console.log("updateFileFromInput", { updateType, value });
    const f = value?.file || null;
    const url = value?.previewUrl || "";

    setImageFile(f);
    setPreviewUrl(url);

    // Jika user menghapus preview & sebelumnya ada gambar server → tandai untuk dihapus
    if (!f && !url && hasServerImage) {
      setClearImage(true);
    } else {
      setClearImage(false);
    }
  };

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
        link: form.link?.trim() ?? "",
        imageFile: imageFile || undefined, // kirim kalau ada file lokal
        clear_image: clearImage, // true → hapus gambar lama di server
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
          <span className="text-xl dark:text-[#f5fefd]">Edit Partner</span>
        ) : (
          <span className="text-xl dark:text-[#f5fefd]">Tambah Partner</span>
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
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Nama Partner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none"
              placeholder="Contoh: Seeds Finance"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Link (opsional)
            </label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none"
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Logo pakai FileInput (max 5MB, hanya image) */}
          <FileInput
            labelTitle="Logo (opsional)"
            accept=".jpg,.jpeg,.png,.webp"
            maxSizeMB={5}
            required={false}
            updateFormValue={updateFileFromInput}
            updateType="partner_logo"
            defaultFile={null}
            defaultPreviewUrl={previewUrl} // tampilkan logo dari server kalau ada
            containerStyle=""
            labelStyle=""
          />
        </div>
      </div>
    </Modal>
  );
}
