"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import mammoth from "mammoth";

import QuillEditor from "../../components/common/QuillEditor";
import HtmlPreviewModal from "../../components/common/HtmlPreviewModal";
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

  const [showPreview, setShowPreview] = useState(false);
  const quillRef = useRef(null);

  // input file untuk import .docx (client-side)
  const fileInputRef = useRef(null);

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
  }, [templateId]); // jangan depend ke `dirty` supaya tidak re-fetch saat user ngetik

  const handleChange = (val, _delta, source) => {
    if (source === "user") setDirty(true);
    setCustomValue(val);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { name, custom_value: preserveSpaces(customValue) };
      if (!name?.trim()) {
        showError("Nama template wajib diisi.");
        return;
      }
      if (!customValue || !String(customValue).trim()) {
        showError("Isi template wajib diisi.");
        return;
      }
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
      showError(firstErr || e.message || "Gagal menyimpan template.");
    } finally {
      setSaving(false);
    }
  };

  // === Import Word (.docx) — client-side pakai mammoth ===
  const handleClickImport = () => fileInputRef.current?.click();

  const handleImportDocxClient = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validasi sederhana ekstensi
    if (!/\.docx$/i.test(file.name)) {
      showError("Format harus .docx");
      e.target.value = "";
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();

      const { value: rawHtml } = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          // mapping style agar rapi
          styleMap: [
            "p[style-name='Normal'] => p",
            "u => u",
            "b => strong",
            "i => em",
            "h1 => h1",
            "h2 => h2",
            "h3 => h3",
            "table => table.table",
          ].join("\n"),
          convertImage: mammoth.images.inline(async (elem) => {
            // default: inline base64 supaya langsung tampil
            const buffer = await elem.read("base64");
            const contentType = elem.contentType || "image/png";
            return { src: `data:${contentType};base64,${buffer}` };

            // ⬇️ Kalau mau upload ke Cloudinary, ganti dengan logic upload:
            // const blob = await elem.read("blob");
            // const upFile = new File([blob], `docx_${Date.now()}.png`, { type: elem.contentType });
            // const res = await draftService.uploadEditorImage(upFile);
            // return { src: res?.data?.url };
          }),
        }
      );

      // Sanitasi HTML sebelum masuk editor
      const safeHtml = DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ALLOWED_URI_REGEXP:
          /^(?:(?:https?|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      });

      setCustomValue(safeHtml);
      setDirty(true);
      showSuccess("Berhasil import dari Word (.docx).");
    } catch (err) {
      console.error(err);
      showError("Gagal import file .docx. Pastikan formatnya benar.");
    } finally {
      // reset supaya bisa pilih file yang sama lagi jika perlu
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold dark:text-white">
          {templateId ? "Edit Template" : "Tambah Template"}
        </h1>

        {/* Tombol Import Word */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClickImport}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Import dari Microsoft Word (.docx)"
          >
            Import Word (.docx)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleImportDocxClient}
          />
        </div>
      </div>

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
                  onClick={() => setShowPreview(true)}
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

      <style>{`
        /* opsional: sedikit penyesuaian tampilan */
        .quill-wrap .ql-container {
          min-height: 360px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .quill-wrap .ql-editor {
          white-space: break-spaces;
          tab-size: 4;
        }
      `}</style>
    </div>
  );
}
