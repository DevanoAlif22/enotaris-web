"use client";
import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";

// daftar modul (hindari double register saat HMR)
if (typeof window !== "undefined" && !Quill.imports["modules/imageResize"]) {
  Quill.register("modules/imageResize", ImageResize);
}

import { draftService } from "../../services/draftService";
import { showError, showSuccess } from "../../utils/toastConfig";

const NBSP = "\u00A0";

const QuillEditor = forwardRef(function QuillEditor(
  {
    value,
    onChange,
    placeholder = "",
    className = "",
    readOnly = false,
    toolbar = true,
    stickyToolbar = true,
    tabIndent = true,
    tabSize = 4,
    minHeight = 380,
    maxHeight = "60vh",
    modules: modulesProp,
    formats: formatsProp,
  },
  ref
) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // state untuk overlay tombol hapus
  const [deleteBtn, setDeleteBtn] = useState({
    show: false,
    left: 0,
    top: 0,
    publicId: null,
    imgEl: null,
  });

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => quillRef.current?.getEditor?.(),
      focus: () => quillRef.current?.focus?.(),
    }),
    []
  );

  // === Upload gambar ===
  const openImagePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const onPickImage = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    try {
      const res = await draftService.uploadEditorImage(file);
      const url = res?.data?.url;
      const publicId = res?.data?.public_id;
      if (!url) return showError("Upload gagal: URL kosong.");

      const quill = quillRef.current?.getEditor?.();
      if (!quill) return;

      const range = quill.getSelection(true) || {
        index: quill.getLength(),
        length: 0,
      };
      quill.insertEmbed(range.index, "image", url, "user");

      // pasang atribut untuk delete
      setTimeout(() => {
        try {
          const editor = quill.root;
          const imgs = editor.querySelectorAll(`img[src="${CSS.escape(url)}"]`);
          const img = imgs[imgs.length - 1];
          if (img) {
            if (publicId) img.setAttribute("data-public-id", publicId);
            img.setAttribute("loading", "lazy");
          }
        } catch {
          // ignore
        }
      }, 0);

      quill.setSelection(range.index + 1, 0, "user");
      showSuccess("Gambar berhasil diunggah.");
    } catch (err) {
      showError(
        err?.message ||
          err?.errors?.image?.[0] ||
          "Gagal mengunggah gambar. Coba lagi."
      );
    }
  };

  // === Image resize + toolbar, TAB indent, dll ===
  const modules = useMemo(() => {
    const NBSP_TAB = NBSP.repeat(tabSize || 4);

    const base = {
      toolbar: toolbar
        ? {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ align: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ size: ["small", false, "large", "huge"] }],
              [{ color: [] }, { background: [] }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: readOnly ? {} : { image: openImagePicker },
          }
        : false,
      clipboard: { matchVisual: false },
      keyboard: {
        bindings: tabIndent
          ? {
              handleTab: {
                key: 9,
                handler: function (range) {
                  const quill = quillRef.current?.getEditor?.();
                  if (!quill) return true;
                  quill.insertText(range.index, NBSP_TAB, "user");
                  quill.setSelection(range.index + NBSP_TAB.length, 0, "user");
                  return false;
                },
              },
              handleShiftTab: {
                key: 9,
                shiftKey: true,
                handler: function (range) {
                  const quill = quillRef.current?.getEditor?.();
                  if (!quill) return true;
                  const prev = quill.getText(
                    Math.max(0, range.index - NBSP_TAB.length),
                    NBSP_TAB.length
                  );
                  if (prev === NBSP_TAB) {
                    quill.deleteText(
                      range.index - NBSP_TAB.length,
                      NBSP_TAB.length,
                      "user"
                    );
                    quill.setSelection(
                      range.index - NBSP_TAB.length,
                      0,
                      "user"
                    );
                    return false;
                  }
                  return true;
                },
              },
            }
          : {},
      },
      // ✅ Aktifkan image resize (akan memunculkan handle saat gambar diklik)
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize", "Toolbar"], // Toolbar = pegang handle pojok + info size
      },
    };

    return modulesProp ? { ...base, ...modulesProp } : base;
  }, [modulesProp, toolbar, readOnly, tabIndent, tabSize]);

  const formats = useMemo(
    () =>
      formatsProp || [
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
    [formatsProp]
  );

  // === Tampilkan tombol "Hapus gambar" saat img diklik ===
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const root = quill.root;

    const onClickImg = (e) => {
      const target = e.target;
      if (target && target.tagName === "IMG") {
        const rect = target.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const publicId = target.getAttribute("data-public-id");

        setDeleteBtn({
          show: true,
          left: rect.right - rootRect.left - 36, // tombol di pojok kanan atas gambar
          top: rect.top - rootRect.top + 8,
          publicId: publicId || null,
          imgEl: target,
        });
      } else {
        // klik di luar gambar -> sembunyikan
        setDeleteBtn((p) => ({
          ...p,
          show: false,
          imgEl: null,
          publicId: null,
        }));
      }
    };

    root.addEventListener("click", onClickImg);
    return () => root.removeEventListener("click", onClickImg);
  }, []);

  const handleDeleteImage = async () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill || !deleteBtn.imgEl) return;

    // hapus di Cloudinary kalau punya public_id
    try {
      if (deleteBtn.publicId) {
        await draftService.deleteEditorImage(deleteBtn.publicId);
      }
    } catch (e) {
      // kalau gagal hapus cloudinary kita tetap lanjut buang dari editor
      console.warn("Cloudinary delete failed:", e?.message || e);
    }

    // Hapus blot image dari editor
    try {
      const blot = Quill.find(deleteBtn.imgEl);
      const index = quill.getIndex(blot);
      quill.deleteText(index, 1, "user");
      showSuccess("Gambar dihapus.");
    } catch (e) {
      console.warn(e);
    }

    setDeleteBtn({ show: false, left: 0, top: 0, publicId: null, imgEl: null });
  };

  return (
    <div
      className={`quill-base ${
        stickyToolbar ? "quill-sticky-toolbar" : ""
      } ${className}`}
      style={{ position: "relative" }}
    >
      {/* input file tersembunyi */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />

      {/* Tombol hapus gambar (muncul saat img diklik) */}
      {deleteBtn.show && !readOnly && (
        <button
          type="button"
          onClick={handleDeleteImage}
          style={{
            position: "absolute",
            left: deleteBtn.left,
            top: deleteBtn.top,
            zIndex: 20,
          }}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded shadow hover:bg-red-700"
        >
          Hapus
        </button>
      )}

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />

      <style>{`
        .quill-base .ql-container {
          min-height: ${
            typeof minHeight === "number" ? `${minHeight}px` : minHeight
          };
          ${
            maxHeight
              ? `max-height: ${
                  typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight
                };`
              : ""
          }
          overflow-y: auto;
        }
        .quill-base .ql-editor {
          position: relative; /* penting untuk posisi overlay/handles */
          white-space: break-spaces;
          tab-size: ${tabSize || 4};
          min-height: ${
            typeof minHeight === "number" ? `${minHeight - 20}px` : minHeight
          };
        }
        .quill-sticky-toolbar .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
        }
        .quill-base .ql-editor.ql-blank::before {
          color: #9ca3af;
          opacity: 1;
        }
        .quill-base .ql-editor img {
          max-width: 100%;
          height: auto;
          cursor: pointer; /* kasih hint bisa diklik untuk resize/hapus */
        }
      `}</style>
    </div>
  );
});

export default QuillEditor;
