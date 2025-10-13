import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mammoth from "mammoth";
import { templateService } from "../services/templateService";
import { showError, showSuccess } from "../utils/toastConfig";
import { preserveSpaces, sanitizeHtml } from "../helpers/template/htmlPreserve";
import { defaultPdfOptions } from "../helpers/template/pdfDefaults";

export default function useTemplateEditor(templateId, navigate) {
  // ===== State utama =====
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [html, setHtml] = useState("");
  const [latestUrl, setLatestUrl] = useState("");

  // ===== Logo =====
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [clearLogo, setClearLogo] = useState(false);

  // ===== UI =====
  const [pdfOptions, setPdfOptions] = useState(defaultPdfOptions);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pagedOpen, setPagedOpen] = useState(false);

  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // ===== reload dari server =====
  const reloadTemplate = useCallback(async (tid) => {
    const res = await templateService.get(tid);
    const tpl = res?.data;
    setName(tpl?.name || "");
    setDescription(tpl?.description || "");
    setHtml(String(tpl?.custom_value || ""));
    setLatestUrl(tpl?.file || "");
    setLogoPreviewUrl(tpl?.logo || "");
    setLogoFile(null);
    setClearLogo(false);
    setDirty(false);
    return tpl;
  }, []);

  // ===== initial load =====
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

  // ===== Logo input handler =====
  const updateLogoFromInput = ({ value }) => {
    const f = value?.file || null;
    const url = value?.previewUrl || "";
    setLogoFile(f);
    setLogoPreviewUrl(url);
    if (!f && !url && !!logoPreviewUrl) setClearLogo(true);
    else setClearLogo(false);
  };

  // ===== Editor change =====
  const handleChange = useCallback((val, _delta, source) => {
    if (source === "user") setDirty(true);
    setHtml(val);
  }, []);

  // ===== Save =====
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      if (!name?.trim()) return showError("Nama template wajib diisi.");
      if (!description?.trim())
        return showError("Deskripsi template wajib diisi.");
      if (!html?.trim()) return showError("Isi template wajib diisi.");

      const payload = {
        name,
        description,
        custom_value: preserveSpaces(html),
        logoFile,
        clear_logo: clearLogo,
      };

      if (templateId) {
        await templateService.update(templateId, payload);
        await reloadTemplate(templateId);
        showSuccess("Template berhasil diperbarui.");
      } else {
        const res = await templateService.create(payload);
        const newId = res?.data?.id;
        showSuccess("Template berhasil dibuat.");
        navigate(newId ? `/app/template/${newId}/edit` : "/app/template");
      }
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? Object.values(e.errors)[0]?.[0] || Object.values(e.errors)[0]
          : null;
      showError(firstErr || e.message || "Gagal menyimpan template.");
    } finally {
      setSaving(false);
    }
  }, [
    html,
    name,
    description,
    logoFile,
    clearLogo,
    navigate,
    reloadTemplate,
    templateId,
  ]);

  // ===== Import DOCX =====
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
          styleMap: ["p[style-name='Normal'] => p", "b => strong", "i => em"],
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

  // ===== Export PDF =====
  const handleExportPdf = useCallback(async () => {
    if (!templateId)
      return showError("Simpan template dahulu sebelum export PDF.");
    try {
      setExporting(true);
      const resp = await templateService.renderPdf(templateId, {
        html: preserveSpaces(html),
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
      showError(e?.message || "Terjadi kesalahan saat membuat PDF.");
    } finally {
      setExporting(false);
    }
  }, [html, pdfOptions, reloadTemplate, templateId]);

  const htmlPreviewPaged = useMemo(() => html, [html]);

  return {
    name,
    setName,
    description,
    setDescription,
    html,
    setHtml,
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
  };
}
