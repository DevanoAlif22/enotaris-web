// components/deed/DeedTemplateEditor.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { buildTokenMap, replaceTokens } from "../../utils/project/deedTemplate";
import PagedPreview from "./PagedPreview";
import { templateService } from "../../services/templateService";
import { preserveSpaces } from "../../utils/preserveSpaces";

export default function DeedTemplateEditor({
  activity,
  initialHtml,
  onSave,
  onExportPdf, // (htmlFinal) => Promise<string|null>
  saving = false,
  exporting = false,
  fileUrl, // URL PDF terakhir (dari BE)
}) {
  const [template, setTemplate] = useState(() =>
    typeof initialHtml === "string" && initialHtml.trim()
      ? initialHtml
      : DEFAULT_TEMPLATE
  );
  const [dirty, setDirty] = useState(false);

  // ⬇️ URL terbaru untuk tombol "Lihat PDF"
  const [latestUrl, setLatestUrl] = useState(fileUrl || "");
  useEffect(() => {
    // kalau BE update (refetch), sinkronkan
    setLatestUrl(fileUrl || "");
  }, [fileUrl]);

  // template picker
  const [tplItems, setTplItems] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [selectedTplId, setSelectedTplId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setTplLoading(true);
        const res = await templateService.list({ per_page: 100 });
        const items = Array.isArray(res?.data) ? res.data : [];
        setTplItems(
          items.map((it) => ({
            id: it.id,
            name: it.name,
            html: String(it.custom_value || ""),
          }))
        );
      } catch (e) {
        console.error("Gagal load templates:", e?.message || e);
      } finally {
        setTplLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (dirty) return;
    if (typeof initialHtml === "string") {
      setTemplate(initialHtml.trim() ? initialHtml : DEFAULT_TEMPLATE);
    } else if (initialHtml == null) {
      setTemplate(DEFAULT_TEMPLATE);
    }
  }, [initialHtml, dirty]);

  const tokenMap = useMemo(() => buildTokenMap(activity), [activity]);
  const html = useMemo(
    () => replaceTokens(template, tokenMap),
    [template, tokenMap]
  );

  const [htmlPreview, setHtmlPreview] = useState(html);
  useEffect(() => {
    const t = setTimeout(() => setHtmlPreview(html), 150);
    return () => clearTimeout(t);
  }, [html]);

  const quillRef = useRef(null);
  const NBSP4 = "\u00A0\u00A0\u00A0\u00A0";

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        ["clean"],
        ["link", "image"],
      ],
      clipboard: { matchVisual: false },
      keyboard: {
        bindings: {
          handleTab: {
            key: 9,
            handler(range) {
              const quill = quillRef.current?.getEditor();
              if (!quill) return true;
              quill.insertText(range.index, NBSP4, "user");
              quill.setSelection(range.index + NBSP4.length, 0, "user");
              return false;
            },
          },
          handleShiftTab: {
            key: 9,
            shiftKey: true,
            handler(range) {
              const quill = quillRef.current?.getEditor();
              if (!quill) return true;
              const prev = quill.getText(Math.max(0, range.index - 4), 4);
              if (prev === NBSP4) {
                quill.deleteText(range.index - 4, 4, "user");
                quill.setSelection(range.index - 4, 0, "user");
                return false;
              }
              return true;
            },
          },
        },
      },
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "indent",
      "link",
      "image",
      "video",
      "align",
      "color",
      "background",
    ],
    []
  );

  const handleQuillChange = (val, _delta, source) => {
    if (source === "user") setDirty(true);
    setTemplate(val);
  };

  const insertToken = (token) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    const pos = range ? range.index : quill.getLength();
    const txt = `{${token}}`;
    quill.insertText(pos, txt, "user");
    quill.setSelection(pos + txt.length);
    quill.focus();
    setDirty(true);
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    setDirty(true);
  };

  const useSelectedTemplate = async () => {
    if (!selectedTplId) return;
    try {
      const res = await templateService.get(selectedTplId);
      const html = String(res?.data?.custom_value || "");
      setTemplate(html || DEFAULT_TEMPLATE);
      setDirty(true);
      quillRef.current?.getEditor()?.setSelection(0, 0);
    } catch (e) {
      console.error("Gagal memuat template:", e?.message || e);
      alert("Gagal memuat template terpilih.");
    }
  };

  // ⬇️ klik "Generate File" -> tunggu URL dari parent, lalu update tombol
  const handleGenerate = async () => {
    if (!onExportPdf) return;
    const url = await onExportPdf(preserveSpaces(html)); // kirim HTML final + NBSP
    if (url) setLatestUrl(url); // ⬅️ update instan tombol "Lihat PDF"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <div className="text-sm font-medium mb-2">Template Akta</div>
            {/* Template picker */}
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={selectedTplId}
                onChange={(e) => setSelectedTplId(e.target.value)}
                disabled={tplLoading}
                title="Pilih template tersimpan"
              >
                <option value="">
                  {tplLoading ? "Memuat…" : "— Pilih template —"}
                </option>
                {tplItems.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={useSelectedTemplate}
                disabled={!selectedTplId || tplLoading}
                className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Gunakan
              </button>
              <button
                type="button"
                onClick={resetTemplate}
                className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Reset Bawaan
              </button>
            </div>
          </div>

          <div className="border rounded quill-wrap">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={template}
              onChange={handleQuillChange}
              modules={modules}
              formats={formats}
              className="deed-quill"
              placeholder="Tulis template akta di sini..."
            />
          </div>

          {/* Actions */}
          <div className="mt-16 flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => onSave?.(preserveSpaces(template))}
              disabled={saving}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan Draft"}
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={exporting}
              className="px-3 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
            >
              {exporting ? "Mengekspor…" : "Generate File"}
            </button>

            {/* Lihat PDF terakhir (pakai latestUrl) */}
            <a
              href={latestUrl || undefined}
              target="_blank"
              rel="noopener"
              className={`px-3 py-2 rounded transition-colors ${
                latestUrl
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-400 pointer-events-none"
              }`}
              title={latestUrl ? "Buka PDF terakhir" : "Belum ada file PDF"}
            >
              Lihat PDF
            </a>
          </div>
        </div>

        {/* Token list */}
        <div>
          <div className="text-sm font-medium mb-2">Token Tersedia</div>
          <div className="border rounded p-3 bg-gray-50 max-h-[500px] overflow-auto">
            <div className="text-xs text-gray-600 mb-2">
              Klik token untuk menyisipkan ke editor
            </div>
            <TokenList tokenMap={tokenMap} onInsertToken={insertToken} />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="text-sm font-medium mb-2">Preview</div>
        <PagedPreview html={htmlPreview} />
      </div>
    </div>
  );
}

function TokenList({ tokenMap, onInsertToken }) {
  const keys = Object.keys(tokenMap);
  if (!keys.length) return <div className="text-sm text-gray-500">-</div>;
  return (
    <div className="space-y-1">
      {keys.map((k) => (
        <div key={k} className="group">
          <button
            type="button"
            onClick={() => onInsertToken(k)}
            className="w-full text-left p-2 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start gap-2">
              <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1 rounded">{`{${k}}`}</code>
              <span className="text-xs text-gray-500 truncate flex-1 text-right">
                {String(tokenMap[k]).substring(0, 20)}
                {String(tokenMap[k]).length > 20 && "..."}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_TEMPLATE = `
<div style="text-align:center;margin-bottom:12px">
  <h2 style="margin:0">AKTA OTENTIK</h2>
  <div style="font-size:12px">Nomor: {activity_code}</div>
</div>

<p>Pada hari ini, tanggal {today}, bertempat di {schedule_place}, saya {notaris_name}, Notaris, telah membacakan akta dengan judul <b>{deed_name}</b> terkait aktivitas <b>{activity_name}</b>.</p>

<h3>Para Penghadap</h3>
{parties_table}

<h3>Keterangan Penghadap</h3>
<p>Nama Penghadap Pertama: <b>{penghadap1_name}</b><br/>
NIK: {penghadap1_nik} — Alamat: {penghadap1_address}, {penghadap1_city}, {penghadap1_province}</p>

<h3>Kelengkapan Dokumen</h3>
<ul>
  <li>NIK (P1): {penghadap1_req_nik}</li>
  <li>Surat Kuasa (P1): {penghadap1_req_surat_kuasa}</li>
</ul>

<p>Jadwal pembacaan: {schedule_datetime} — Catatan: {schedule_note}</p>

<p style="margin-top:36px">Demikian akta ini dibuat, dibacakan dan ditandatangani sebagaimana mestinya.</p>
`;
