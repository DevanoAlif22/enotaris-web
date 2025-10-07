import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mammoth from "mammoth";
import { templateService } from "../services/templateService";
import { showError, showSuccess } from "../utils/toastConfig";
import { preserveSpaces, sanitizeHtml } from "../helpers/template/htmlPreserve";
import { defaultPdfOptions } from "../helpers/template/pdfDefaults";

export default function useTemplateEditor(templateId, navigate) {
  // state utama
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [latestUrl, setLatestUrl] = useState("");

  // UI state
  const [pdfOptions, setPdfOptions] = useState(defaultPdfOptions);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pagedOpen, setPagedOpen] = useState(false);

  // refs
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // ===== helpers =====
  const reloadTemplate = useCallback(async (tid) => {
    const res = await templateService.get(tid);
    const tpl = res?.data;
    setName(tpl?.name || "");
    setHtml(String(tpl?.custom_value || ""));
    setLatestUrl(tpl?.file || "");
    setDirty(false);
    return tpl;
  }, []);

  // initial load
  useEffect(() => {
    if (!templateId || dirty) return;
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
  }, [templateId, dirty, reloadTemplate]);

  // editor onChange
  const handleChange = useCallback((val, _delta, source) => {
    if (source === "user") setDirty(true);
    setHtml(val);
  }, []);

  // simpan
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      if (!name?.trim()) return showError("Nama template wajib diisi.");
      if (!html || !String(html).trim())
        return showError("Isi template wajib diisi.");

      const payload = { name, custom_value: preserveSpaces(html) };

      if (templateId) {
        await templateService.update(templateId, payload);
        await reloadTemplate(templateId);
        showSuccess("Template berhasil diperbarui.");
      } else {
        const resCreate = await templateService.create(payload);
        const newId = resCreate?.data?.id;
        showSuccess("Template berhasil dibuat.");
        navigate(newId ? `/app/template/${newId}/edit` : "/app/template");
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
  }, [html, name, navigate, reloadTemplate, templateId]);

  // import word
  const clickImport = () => fileInputRef.current?.click();
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
      const safeHtml = sanitizeHtml(rawHtml);
      setHtml(safeHtml);
      setDirty(true);
      showSuccess("Berhasil import dari Word (.docx).");
    } catch (err) {
      console.error(err);
      showError("Gagal import file .docx. Pastikan formatnya benar.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // export PDF
  const handleExportPdf = useCallback(async () => {
    if (!templateId)
      return showError("Simpan template terlebih dahulu sebelum export PDF.");
    try {
      setExporting(true);
      const htmlFinalPreserved = preserveSpaces(html);
      const resp = await templateService.renderPdf(templateId, {
        html: htmlFinalPreserved,
        pdf_options: pdfOptions,
        upload: true,
        filename: `template_${templateId}_${Date.now()}`,
      });

      if (resp?.success) {
        const url = resp?.data?.file || "";
        setLatestUrl(url);
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
  }, [html, pdfOptions, reloadTemplate, templateId]);

  // memo preview paged
  const htmlPreviewPaged = useMemo(() => html, [html]);

  return {
    // data
    name,
    setName,
    html,
    setHtml,
    latestUrl,
    pdfOptions,
    setPdfOptions,
    htmlPreviewPaged,

    // flags
    loading,
    saving,
    exporting,
    showPreview,
    setShowPreview,
    pagedOpen,
    setPagedOpen,

    // refs
    quillRef,
    fileInputRef,

    // handlers
    handleChange,
    handleSave,
    clickImport,
    handleImportDocxClient,
    handleExportPdf,
  };
}
