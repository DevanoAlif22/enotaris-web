"use client";
import { Link, useParams, useNavigate } from "react-router-dom";
import QuillEditor from "../../components/common/QuillEditor";
import FileInput from "../../components/input/FileInput";
import useBlogEditor from "../../hooks/admin/useBlogEditor";

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isEdit,
    loading,
    saving,
    allCats,
    form,
    quillRef,
    setField,
    toggleCategory,
    handleFileChange,
    handleDescChange,
    handleSave,
  } = useBlogEditor(id, navigate);

  return (
    <div className="space-y-6 p-6 dark:bg-[#002d6a] rounded-lg">
      <Link
        to={`/app/blog`}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        <span aria-hidden>←</span> Kembali
      </Link>

      <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
        {isEdit ? "Edit Blog" : "Tambah Blog"}
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
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
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
              defaultPreviewUrl={form.imageUrl || ""}
            />
            <div className="mt-3 flex items-center gap-2">
              <input
                id="clearImage"
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={form.clearImage}
                onChange={(e) => setField("clearImage", e.target.checked)}
                disabled={!!form.imageFile}
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
              memilih file baru, opsi ini diabaikan.
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
                  const checked = form.categoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className={`px-3 py-1.5 rounded-lg border cursor-pointer text-sm select-none ${
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
                value={form.description}
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
