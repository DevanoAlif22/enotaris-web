// src/pages/dashboard/BlogEditorPage.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import InputField from "../../components/input/InputField";
import FileInput from "../../components/input/FileInput";
import QuillEditor from "../../components/common/QuillEditor";
import { blogService } from "../../services/blogService";
import { showError, showSuccess } from "../../utils/toastConfig";

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // HTML via Quill
  const [imageFO, setImageFO] = useState({ file: null, previewUrl: "" }); // FileInput shape

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const quillRef = useRef(null);

  // Load detail saat edit
  useEffect(() => {
    if (!id) return;
    if (dirty) return;
    (async () => {
      try {
        setLoading(true);
        const res = await blogService.get(id);
        const b = res?.data;
        setTitle(b?.title || "");
        setDescription(String(b?.description || ""));
        setImageFO({ file: null, previewUrl: b?.image || "" });
      } catch (e) {
        showError(e.message || "Gagal memuat blog.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]); // eslint-disable-line

  const handleFileChange = ({ updateType, value }) => {
    console.log("handleFileChange", updateType, value);
    setImageFO(value);
  };

  const handleSave = async () => {
    if (!title.trim()) return showError("Judul wajib diisi.");
    if (!description || !String(description).trim())
      return showError("Deskripsi wajib diisi.");

    try {
      setSaving(true);
      if (id) {
        await blogService.update(id, {
          title,
          description,
          // kalau user tidak memilih file baru → biarkan undefined agar gambar lama tetap
          image: imageFO?.file || undefined,
        });
        showSuccess("Blog berhasil diperbarui.");
      } else {
        await blogService.create({
          title,
          description,
          image: imageFO?.file || undefined,
        });
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
        {id ? "Edit Blog" : "Tambah Blog"}
      </h1>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {/* Title */}
            <InputField
              label={<span className="dark:text-[#f5fefd]">Judul</span>}
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required={true}
            />

            {/* Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput
                labelTitle={
                  <span className="dark:text-[#f5fefd]">Gambar (opsional)</span>
                }
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={5}
                defaultFile={imageFO.file}
                defaultPreviewUrl={imageFO.previewUrl}
                updateFormValue={handleFileChange}
                updateType="imageFO"
              />
              {/* Tidak ada opsi hapus gambar saat simpan */}
            </div>

            {/* Description (Quill) */}
            <div>
              <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
                Deskripsi
              </div>
              <div className="border rounded quill-wrap dark:text-[#f5fefd]">
                <QuillEditor
                  ref={quillRef}
                  value={description}
                  onChange={(val, _d, source) => {
                    if (source === "user") setDirty(true);
                    setDescription(val);
                  }}
                  placeholder="Tulis konten blog…"
                  stickyToolbar
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-4">
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
          </div>
        </>
      )}
    </div>
  );
}
