"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import QuillEditor from "../../components/common/QuillEditor";
import FileInput from "../../components/input/FileInput"; // gunakan komponenmu
import { blogService } from "../../services/blogService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const blogId = id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // image states
  const [imageLocal, setImageLocal] = useState(null); // File dari input
  const [imageUrl, setImageUrl] = useState(""); // URL dari server (Cloudinary)
  const [clearImage, setClearImage] = useState(false); // flag hapus gambar saat simpan

  const quillRef = useRef(null);

  // fetch awal (hindari overwrite setelah user ngetik)
  useEffect(() => {
    if (!blogId) return;
    if (dirty) return;
    (async () => {
      try {
        setLoading(true);
        const res = await blogService.get(blogId);
        const item = res?.data;
        setTitle(item?.title || "");
        setDescription(String(item?.description || ""));
        setImageUrl(item?.image || ""); // tampilkan sebagai defaultPreviewUrl
        setClearImage(false);
      } catch (e) {
        showError(e.message || "Gagal memuat blog.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const handleDescChange = (val, _delta, source) => {
    if (source === "user") setDirty(true);
    setDescription(val);
  };

  // Sinkron dengan FileInput → updateType: "image"
  const handleFileChange = ({ updateType, value }) => {
    if (updateType !== "image") return;
    const { file, previewUrl } = value;

    if (file) {
      setImageLocal(file);
      setClearImage(false);
    } else {
      setImageLocal(null);
    }
    setImageUrl(previewUrl); // bisa kosong "" kalau user remove file lokal
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        title,
        description,
        imageFile: imageLocal || null,
        clear_image: !!clearImage && !imageLocal, // kalau ada file baru, abaikan clear_image
      };

      if (blogId) {
        await blogService.update(blogId, payload);
        showSuccess("Blog berhasil diperbarui.");
      } else {
        await blogService.create(payload);
        showSuccess("Blog berhasil dibuat.");
      }
      navigate("/app/blog");
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menyimpan blog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Link
        to={`/app/blog`}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        <span aria-hidden>←</span> Kembali
      </Link>

      <h1 className="text-2xl font-semibold dark:text-white">
        {blogId ? "Edit Blog" : "Tambah Blog"}
      </h1>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <>
          {/* === Judul === */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Judul
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:text-[#f5fefd]"
              placeholder="Masukkan judul blog"
            />
          </div>

          {/* === Gambar (di bawah judul) === */}
          <div>
            <FileInput
              labelTitle={
                <span className="dark:text-[#f5fefd]">Gambar (opsional)</span>
              }
              accept=".jpg,.jpeg,.png,.webp"
              maxSizeMB={5}
              updateFormValue={handleFileChange}
              updateType="image"
              defaultFile={null}
              defaultPreviewUrl={imageUrl || ""}
            />
            <div className="mt-3 flex items-center gap-2">
              <input
                id="clearImage"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={clearImage}
                onChange={(e) => setClearImage(e.target.checked)}
                disabled={!!imageLocal} // jika upload baru, tidak perlu clear
              />
              <label
                htmlFor="clearImage"
                className="text-sm dark:text-[#f5fefd]"
              >
                Hapus gambar saat simpan
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              Centang jika ingin menghapus gambar yang sudah ada di server. Jika
              kamu memilih file baru, opsi ini akan diabaikan (server otomatis
              ganti).
            </p>
          </div>

          {/* === Deskripsi / Konten === */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
              Deskripsi / Konten
            </div>
            <div className="border rounded quill-wrap dark:text-[#f5fefd]">
              <QuillEditor
                ref={quillRef}
                value={description}
                onChange={handleDescChange}
                className="deed-quill dark:text-[#f5fefd]"
                placeholder="Tulis konten blog…"
                tabSize={4}
                tabIndent
                stickyToolbar
              />
            </div>
          </div>

          {/* === Tombol Aksi === */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>

            <Link
              to="/app/blog"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Batal
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
