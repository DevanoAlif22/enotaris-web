// components/deed/DeedTemplateEditor.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QuillEditor from "../common/QuillEditor";
import TemplatePicker from "./TemplatePicker";
import TokenList from "./TokenList";
import ActionsBar from "./ActionsBar";
import PagedPreview from "./PagedPreview";
import PdfSettingPanel from "./PdfSettingPanel";

import { buildTokenMap, replaceTokens } from "../../utils/project/deedTemplate";
import { preserveSpaces } from "../../utils/preserveSpaces";

/**
 * Props:
 * - activity: object
 * - initialHtml?: string
 * - initialPdfOptions?: object
 * - onSave: (htmlTemplatePreserved) => Promise<void>
 * - onExportPdf: (htmlFinalPreserved, pdfOptions) => Promise<string|null>
 * - onPdfOptionsChange?: (pdfOptions) => void
 * - saving?: boolean
 * - exporting?: boolean
 * - fileUrl?: string
 */
export default function DeedTemplateEditor({
  activity,
  initialHtml,
  initialPdfOptions,
  onSave,
  onExportPdf,
  onPdfOptionsChange,
  saving = false,
  exporting = false,
  fileUrl = "",
}) {
  // ===== state =====
  const [template, setTemplate] = useState(
    typeof initialHtml === "string" && initialHtml.trim()
      ? initialHtml
      : DEFAULT_TEMPLATE
  );
  const [, setDirty] = useState(false);

  const [pdfOptions, setPdfOptions] = useState(
    initialPdfOptions || {
      page_size: "A4",
      orientation: "portrait",
      margins_mm: { top: 20, right: 20, bottom: 20, left: 20 },
      font_family: "times",
      font_size_pt: 12,
      show_page_numbers: false,
      page_number_h_align: "right",
      page_number_v_align: "bottom",
    }
  );

  const [latestUrl, setLatestUrl] = useState(fileUrl);
  useEffect(() => setLatestUrl(fileUrl || ""), [fileUrl]);

  const [previewOpen, setPreviewOpen] = useState(false);

  // ===== tokens & preview =====
  const tokenMap = useMemo(() => buildTokenMap(activity), [activity]);

  // allowSingle:true = masih terima {token}; set false jika semua sudah migrasi {{token}}
  const htmlFinal = useMemo(
    () => replaceTokens(template, tokenMap, { allowSingle: true }),
    [template, tokenMap]
  );

  const [htmlPreview, setHtmlPreview] = useState(htmlFinal);
  useEffect(() => {
    const t = setTimeout(() => setHtmlPreview(htmlFinal), 150);
    return () => clearTimeout(t);
  }, [htmlFinal]);

  // ===== editor =====
  const quillRef = useRef(null);

  const handleQuillChange = (val, _delta, source) => {
    if (source === "user") setDirty(true);
    setTemplate(val);
  };

  const insertToken = (tokenKey) => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const range = quill.getSelection(true);
    const pos = range ? range.index : quill.getLength();
    const txt = `{{${tokenKey}}}`;
    quill.insertText(pos, txt, "user");
    quill.setSelection(pos + txt.length);
    quill.focus();
    setDirty(true);
  };

  // ===== PDF options =====
  const handlePdfOptionsChange = (newOptions) => {
    setPdfOptions(newOptions);
    onPdfOptionsChange?.(newOptions);
  };

  // ===== actions =====
  const handlePickTemplate = (htmlPicked) => {
    setTemplate(htmlPicked || DEFAULT_TEMPLATE);
    setDirty(true);
    quillRef.current?.getEditor()?.setSelection(0, 0);
  };

  const handleResetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    setDirty(true);
  };

  const handleSave = () => onSave?.(preserveSpaces(template));

  const handleGenerate = async () => {
    if (!onExportPdf) return;
    // kirim HTML FINAL (sudah replace variabel) + NBSP preserved + PDF options
    const url = await onExportPdf(preserveSpaces(htmlFinal), pdfOptions);
    if (url) setLatestUrl(url); // update tombol "Lihat PDF" seketika
  };

  return (
    <div className="space-y-6">
      {/* PDF Settings Panel */}
      <PdfSettingPanel
        pdfOptions={pdfOptions}
        onOptionsChange={handlePdfOptionsChange}
        className="mb-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
              Template Akta
            </div>
            <TemplatePicker
              onPick={handlePickTemplate}
              onReset={handleResetTemplate}
            />
          </div>

          <div className="border rounded quill-wrap">
            <QuillEditor
              ref={quillRef}
              value={template}
              onChange={handleQuillChange}
              placeholder="Tulis template akta di sini..."
              className="deed-quill"
              tabSize={4}
              tabIndent
              stickyToolbar
            />
          </div>

          <ActionsBar
            onSave={handleSave}
            onGenerate={handleGenerate}
            onPreview={() => setPreviewOpen(true)}
            saving={saving}
            exporting={exporting}
            fileUrl={latestUrl}
          />
        </div>

        {/* Token list */}
        <div>
          <div className="text-sm font-medium mb-2 dark:text-[#f5fefd]">
            Variabel Tersedia
          </div>
          <div className="border rounded p-3 bg-gray-50 max-h-[500px] overflow-auto">
            <div className="text-xs text-gray-600 mb-2">
              Klik variabel untuk menyisipkan ke editor
            </div>
            <TokenList tokenMap={tokenMap} onInsertToken={insertToken} />
          </div>
        </div>
      </div>

      {/* Modal Preview dengan PDF Options */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-xl shadow-xl max-h-[90vh] w-[min(1200px,92vw)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Preview</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {pdfOptions.page_size} • {pdfOptions.orientation} •{" "}
                  {pdfOptions.font_family} • {pdfOptions.font_size_pt}pt
                </span>
                <button
                  className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={() => setPreviewOpen(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
            <div className="overflow-auto">
              {/* Kirim pdfOptions ke PagedPreview */}
              <PagedPreview html={htmlPreview} pdfOptions={pdfOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default template (sudah pakai {{...}})
const DEFAULT_TEMPLATE = `
<div style="text-align:center;margin-bottom:12px">
  <h2 style="margin:0">AKTA OTENTIK</h2>
  <div style="font-size:12px">Nomor: {{reference_number}}</div>
</div>

<p>Pada hari ini, tanggal {{today}}, bertempat di {{schedule_place}}, saya {{notaris_name}}, Notaris, telah membacakan akta dengan judul <b>{{deed_name}}</b> terkait aktivitas <b>{{activity_name}}</b>.</p>

<h3>Para Penghadap</h3>
{{parties_table}}

<h3>Keterangan Penghadap</h3>
<p>Nama Penghadap Pertama: <b>{{penghadap1_name}}</b><br/>
NIK: {{penghadap1_nik}} — Alamat: {{penghadap1_address}}, {{penghadap1_city}}, {{penghadap1_province}}</p>

<h3>Kelengkapan Dokumen</h3>
<ul>
  <li>NIK (P1): {{penghadap1_req_nik}}</li>
  <li>Surat Kuasa (P1): {{penghadap1_req_surat_kuasa}}</li>
</ul>

<p>Jadwal pembacaan: {{schedule_datetime}} — Catatan: {{schedule_note}}</p>

<p style="margin-top:36px">Demikian akta ini dibuat, dibacakan dan ditandatangani sebagaimana mestinya.</p>
`;
