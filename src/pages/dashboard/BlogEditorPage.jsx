"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import QuillEditor from "../../components/common/QuillEditor";
import FileInput from "../../components/input/FileInput";
import { blogService } from "../../services/blogService";
import { categoryBlogService } from "../../services/categoryBlogService";
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
  const [imageLocal, setImageLocal] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [clearImage, setClearImage] = useState(false);

  // categories
  const [allCats, setAllCats] = useState([]); // [{id,name}]
  const [selectedCatIds, setSelectedCatIds] = useState([]); // [id,...]

  const quillRef = useRef(null);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await categoryBlogService.all({ min: true });
        setAllCats(res?.data || []);
      } catch (e) {
        showError(e.message || "Gagal memuat kategori.");
      }
    })();
  }, []);

  // Load blog when editing
  useEffect(() => {
    if (!blogId) return;
    if (dirty) return;
    (async () => {
      try {
        setLoading(true);
        const res = await blogService.get(blogId, { withCategories: true });
        const item = res?.data;
        setTitle(item?.title || "");
        setDescription(String(item?.description || ""));
        setImageUrl(item?.image || "");
        setClearImage(false);
        // prefill categories
        const ids = Array.isArray(item?.categories)
          ? item.categories.map((c) => c.id)
          : [];
        setSelectedCatIds(ids);
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

  // File input
  const handleFileChange = ({ updateType, value }) => {
    if (updateType !== "image") return;
    const { file, previewUrl } = value;
    if (file) {
      setImageLocal(file);
      setClearImage(false);
    } else {
      setImageLocal(null);
    }
    setImageUrl(previewUrl);
  };

  // Category toggle (checkbox)
  const toggleCategory = (catId) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        title,
        description,
        imageFile: imageLocal || null,
        clear_image: !!clearImage && !imageLocal,
        category_blog_ids: selectedCatIds, // ⬅️ kirim ke server
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
    <div className="space-y-6 p-6 dark:bg-[#002d6a] rounded-lg">
      <Link
        to={`/app/blog`}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        <span aria-hidden>←</span> Kembali
      </Link>

      <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
        {blogId ? "Edit Blog" : "Tambah Blog"}
      </h1>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <>
          {/* Judul */}
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

          {/* Gambar */}
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
                disabled={!!imageLocal}
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

          {/* Kategori */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
              Kategori
            </div>
            {allCats.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Belum ada kategori.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allCats.map((cat) => {
                  const checked = selectedCatIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer text-sm select-none
                        ${
                          checked
                            ? "bg-[#0256c4] text-white border-[#0256c4]"
                            : "bg-white dark:bg-[#002d6a] text-gray-700 dark:text-[#f5fefd] border-gray-300"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
              Kamu bisa memilih lebih dari satu kategori.
            </p>
          </div>

          {/* Konten */}
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

          {/* Aksi */}
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
