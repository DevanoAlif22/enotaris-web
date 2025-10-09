"use client";
import { Link, useParams, useNavigate } from "react-router-dom";
import QuillEditor from "../../components/common/QuillEditor";
import HtmlPreviewModal from "../../components/common/HtmlPreviewModal";
import PagedPreview from "../../components/deed/PagedPreview";
import PdfSettingPanel from "../../components/deed/PdfSettingPanel";
import FileInput from "../../components/input/FileInput";
import useTemplateEditor from "../../hooks/useTemplateEditor";
import { labelPdfSummary } from "../../helpers/template/pdfDefaults";

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    name,
    setName,
    description,
    setDescription,
    html,
    latestUrl,
    pdfOptions,
    setPdfOptions,
    htmlPreviewPaged,
    loading,
    saving,
    exporting,
    showPreview,
    setShowPreview,
    pagedOpen,
    setPagedOpen,
    quillRef,
    fileInputRef,
    handleChange,
    handleSave,
    clickImport,
    handleImportDocxClient,
    handleExportPdf,
    logoPreviewUrl,
    updateLogoFromInput,
  } = useTemplateEditor(id, navigate);

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
          {id ? "Edit Template" : "Tambah Template"}
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clickImport}
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
              {/* Nama */}
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

              {/* Deskripsi */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 dark:text-[#f5fefd] min-h-[80px]"
                  placeholder="Tuliskan deskripsi singkat mengenai template ini..."
                />
              </div>

              {/* Logo */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
                  Logo (opsional)
                </label>
                <FileInput
                  labelTitle=""
                  accept=".jpg,.jpeg,.png,.webp"
                  maxSizeMB={5}
                  required={false}
                  updateFormValue={updateLogoFromInput}
                  updateType="template_logo"
                  defaultFile={null}
                  defaultPreviewUrl={logoPreviewUrl}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rekomendasi: PNG transparan, maksimal 5MB.
                </p>
              </div>

              {/* Isi Template */}
              <div className="mb-2">
                <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
                  Isi Template
                </div>
                <div className="border rounded quill-wrap dark:text-[#f5fefd]">
                  <QuillEditor
                    ref={quillRef}
                    value={html}
                    onChange={handleChange}
                    className="deed-quill dark:text-[#f5fefd]"
                    placeholder="Tulis isi template…"
                    tabSize={4}
                    tabIndent
                    stickyToolbar
                  />
                </div>
              </div>

              {/* Actions */}
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

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exporting || !id}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {exporting ? "Mengekspor…" : "Export PDF"}
                </button>

                {latestUrl && (
                  <a
                    href={latestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                  >
                    Lihat File PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          <HtmlPreviewModal
            open={showPreview}
            onClose={() => setShowPreview(false)}
            html={html}
            title="Preview Template"
          />

          {/* Preview paged */}
          {pagedOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              role="dialog"
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
                      {labelPdfSummary(pdfOptions)}
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
