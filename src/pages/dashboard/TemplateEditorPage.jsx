"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { templateService } from "../../services/templateService";
import { showError, showSuccess } from "../../utils/toastConfig";
import PagedPreview from "../../components/deed/PagedPreview";

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
  const [dirty, setDirty] = useState(false); // cegah overwrite saat user ngetik

  const quillRef = useRef(null);

  // ambil detail kalau edit (JANGAN jalan kalau sudah dirty)
  useEffect(() => {
    if (!templateId) return;
    if (dirty) return; // penting: hindari refetch/overwrite setelah user ngetik
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
  }, [templateId]); // ⬅️ tidak depend ke `dirty`

  // ========= QUILL CONFIG =========
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

  // Hindari error register — cukup "list" (tanpa "bullet") di formats
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

  const handleChange = (val, _delta, source) => {
    if (source === "user") setDirty(true); // tandai user edit
    setCustomValue(val);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name,
        custom_value: preserveSpaces(customValue), // simpan versi NBSP
      };
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
      <h1 className="text-2xl font-semibold dark:text-white">
        {templateId ? "Edit Template" : "Tambah Template"}
      </h1>

      {loading ? (
        <div>Memuat…</div>
      ) : (
        <>
          {/* Form Input */}
          <div className="grid grid-cols-1 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Contoh: Akta Pendirian CV"
                />
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium mb-2">Isi Template</div>
                <div className="border rounded quill-wrap">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={customValue}
                    onChange={handleChange}
                    modules={modules}
                    formats={formats}
                    className="deed-quill"
                    placeholder="Tulis isi template…"
                  />
                </div>
              </div>

              {/* Actions */}
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
                  to="/app/template"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Batal
                </Link>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="text-sm font-medium mb-2">Preview</div>
            {/* PagedPreview sudah set whitespace-nya sendiri */}
            <PagedPreview html={customValue} />
          </div>
        </>
      )}
    </div>
  );
}
