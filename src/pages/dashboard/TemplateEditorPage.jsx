// pages/template/TemplateEditorPage.jsx
"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import mammoth from "mammoth";

import QuillEditor from "../../components/common/QuillEditor";
import HtmlPreviewModal from "../../components/common/HtmlPreviewModal";
import PagedPreview from "../../components/deed/PagedPreview";
import PdfSettingPanel from "../../components/deed/PdfSettingPanel";

import { templateService } from "../../services/templateService";
import { showError, showSuccess } from "../../utils/toastConfig";

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
  const [exporting, setExporting] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [pagedOpen, setPagedOpen] = useState(false);
  const [latestUrl, setLatestUrl] = useState("");

  // ==== PDF options ====
  const [pdfOptions, setPdfOptions] = useState({
    page_size: "A4",
    orientation: "portrait",
    margins_mm: { top: 20, right: 20, bottom: 20, left: 20 },
    font_family: "times",
    font_size_pt: 12,
    show_page_numbers: false,
    page_number_h_align: "right",
    page_number_v_align: "bottom",
  });

  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // helper: reload dari server (update state + latestUrl)
  const reloadTemplate = async (tid) => {
    const res = await templateService.get(tid);
    const tpl = res?.data;
    setName(tpl?.name || "");
    setCustomValue(String(tpl?.custom_value || ""));
    setLatestUrl(tpl?.file || "");
    setDirty(false);
    return tpl;
  };

  // fetch awal (tanpa overwrite setelah user ngetik)
  useEffect(() => {
    if (!templateId) return;
    if (dirty) return;
    (async () => {
      try {
        setLoading(true);
        await reloadTemplate(templateId);
      } catch (e) {
        showError(e.message || "Gagal memuat template.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]); // jangan depend ke `dirty`

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
        // === EDIT: tetap di halaman, reload data setelah update
        await templateService.update(templateId, payload);
        await reloadTemplate(templateId);
        showSuccess("Template berhasil diperbarui.");
      } else {
        // === CREATE: setelah buat, pindah ke halaman edit dari ID baru
        const resCreate = await templateService.create(payload);
        const newId = resCreate?.data?.id;
        showSuccess("Template berhasil dibuat.");
        if (newId) {
          navigate(`/app/template/${newId}/edit`);
        } else {
          // fallback kalau response tidak mengembalikan id
          navigate("/app/template");
        }
      }
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
            const buffer = await elem.read("base64");
            const contentType = elem.contentType || "image/png";
            return { src: `data:${contentType};base64,${buffer}` };
          }),
        }
      );

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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ==== Preview Paged (pakai css/opsi yang sama dengan Dompdf) ====
  const htmlPreviewPaged = useMemo(() => customValue, [customValue]);

  const handleExportPdf = async () => {
    if (!templateId) {
      showError("Simpan template terlebih dahulu sebelum export PDF.");
      return;
    }
    try {
      setExporting(true);

      // Kirim HTML yang sudah preserve NBSP (server akan validasi token).
      const htmlFinalPreserved = preserveSpaces(customValue);

      const resp = await templateService.renderPdf(templateId, {
        html: htmlFinalPreserved,
        pdf_options: pdfOptions,
        upload: true, // minta upload ke Cloudinary
        filename: `template_${templateId}_${Date.now()}`,
      });

      if (resp?.success) {
        const url = resp?.data?.file;
        setLatestUrl(url || "");
        // opsional: reload untuk memastikan state lokal selaras DB (file_path, updated_at)
        await reloadTemplate(templateId);
        showSuccess("PDF berhasil dibuat & diunggah.");
      } else {
        showError(resp?.message || "Gagal membuat PDF.");
      }
    } catch (e) {
      const msg = e?.errors?.unknown_tokens?.length
        ? `Ada variabel belum terganti: ${e.errors.unknown_tokens.join(", ")}`
        : e?.message || "Terjadi kesalahan saat membuat PDF.";
      showError(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 dark:bg-[#002d6a] rounded-lg">
      <Link
        to={`/app/template`}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
      >
        <span aria-hidden>←</span> Kembali
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold dark:text-white">
          {templateId ? "Edit Template" : "Tambah Template"}
        </h1>

        {/* Tombol Import Word */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClickImport}
            className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#f5fefd] transition-transform hover:scale-[1.03] shadow hover:shadow-lg"
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

      {/* ===== PDF Settings Panel (sama seperti Draft) ===== */}
      <PdfSettingPanel
        pdfOptions={pdfOptions}
        onOptionsChange={setPdfOptions}
        className="mb-2"
      />

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

              <div className="mt-8 flex flex-wrap gap-3 items-center">
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

                {/* Optional: Preview Paged */}
                {/* <button
                  type="button"
                  onClick={() => setPagedOpen(true)}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Preview Paged (PDF Options)
                </button> */}

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exporting || !templateId}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {exporting ? "Mengekspor…" : "Export PDF"}
                </button>

                {/* Tombol lihat PDF baca dari templates.file (latestUrl) */}
                {latestUrl && (
                  <a
                    href={latestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                    title="Lihat PDF terakhir"
                  >
                    Lihat File PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Modal Preview HTML cepat */}
          <HtmlPreviewModal
            open={showPreview}
            onClose={() => setShowPreview(false)}
            html={customValue}
            title="Preview Template"
          />

          {/* Modal Preview Paged dengan opsi PDF (sejalan Dompdf) */}
          {pagedOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setPagedOpen(false)}
              />
              <div className="relative z-10 bg-white rounded-xl shadow-xl max-h-[90vh] w-[min(1200px,92vw)] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="font-semibold">Preview (Paged)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {pdfOptions.page_size} • {pdfOptions.orientation} •{" "}
                      {pdfOptions.font_family} • {pdfOptions.font_size_pt}pt
                    </span>
                    <button
                      className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => setPagedOpen(false)}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
                <div className="overflow-auto">
                  <PagedPreview
                    html={htmlPreviewPaged}
                    pdfOptions={pdfOptions}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
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
