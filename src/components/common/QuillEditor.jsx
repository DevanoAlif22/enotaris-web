"use client";
import React, { useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => quillRef.current?.getEditor?.(),
      focus: () => quillRef.current?.focus?.(),
    }),
    []
  );

  const modules = useMemo(() => {
    const NBSP_TAB = NBSP.repeat(tabSize || 4);
    const base = {
      toolbar: toolbar
        ? [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            ["clean"],
            ["link", "image"],
          ]
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
    };
    return modulesProp ? { ...base, ...modulesProp } : base;
  }, [modulesProp, tabIndent, tabSize, toolbar]);

  // Penting: cukup "list" (tanpa "bullet"/"ordered" terpisah) untuk menghindari error register
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

  return (
    <div
      className={`quill-base ${
        stickyToolbar ? "quill-sticky-toolbar" : ""
      } ${className}`}
    >
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
      `}</style>
    </div>
  );
});

export default QuillEditor;
