"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import QuillEditor from "../../components/common/QuillEditor";
import HtmlPreviewModal from "../../components/common/HtmlPreviewModal"; // ⬅️ baru
import { templateService } from "../../services/templateService";
import { showError, showSuccess } from "../../utils/toastConfig";

// helper: preserve spasi & tab saat disimpan
function preserveSpaces(html) {
  if (html == null) return html;
  let out = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"); // tab -> 4 NBSP
  out = out.replace(/ {2,}/g, (m) => "&nbsp;".repeat(m.length)); // 2+ spasi -> NBSP
  return out;
}

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const templateId = id;

  const [name, setName] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [showPreview, setShowPreview] = useState(false); // ⬅️ modal state
  const quillRef = useRef(null);

  // fetch awal (tanpa overwrite setelah user ngetik)
  useEffect(() => {
    if (!templateId) return;
    if (dirty) return;
    (async () => {
      try {
        setLoading(true);
        const res = await templateService.get(templateId);
        const tpl = res?.data;
        setName(tpl?.name || "");
        setCustomValue(String(tpl?.custom_value || ""));
      } catch (e) {
        showError(e.message || "Gagal memuat template.");
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId]); // penting: jangan depend ke `dirty` supaya tidak re-fetch saat user ngetik

  const handleChange = (val, _delta, source) => {
    if (source === "user") setDirty(true);
    setCustomValue(val);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { name, custom_value: preserveSpaces(customValue) };
      if (templateId) {
        await templateService.update(templateId, payload);
        showSuccess("Template berhasil diperbarui.");
      } else {
        await templateService.create(payload);
        showSuccess("Template berhasil dibuat.");
      }
      navigate("/app/template");
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menyimpan akta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Link
        to={`/app/template`}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        <span aria-hidden>←</span> Kembali
      </Link>
      <h1 className="text-2xl font-semibold dark:text-white">
        {templateId ? "Edit Template" : "Tambah Template"}
      </h1>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:text-[#f5fefd]"
                  placeholder="Contoh: Akta Pendirian CV"
                />
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
                  Isi Template
                </div>
                <div className="border rounded quill-wrap dark:text-[#f5fefd]">
                  <QuillEditor
                    ref={quillRef}
                    value={customValue}
                    onChange={handleChange}
                    className="deed-quill dark:text-[#f5fefd]"
                    placeholder="Tulis isi template…"
                    tabSize={4}
                    tabIndent
                    stickyToolbar
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreview(true)} // ⬅️ buka modal
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Lihat Preview
                </button>

                <Link
                  to="/app/template"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Batal
                </Link>
              </div>
            </div>
          </div>

          {/* Modal Preview */}
          <HtmlPreviewModal
            open={showPreview}
            onClose={() => setShowPreview(false)}
            html={customValue}
            title="Preview Template"
          />
        </>
      )}
    </div>
  );
}
