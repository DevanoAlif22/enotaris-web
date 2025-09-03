"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  size = "md", // sm | md | lg | xl
  titleAlign = "left",
  maxHeight = "85vh", // <— atur tinggi maksimal modal di sini
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
  };

  const node = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fadeIn pointer-events-auto"
        onClick={onClose}
      />
      {/* dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-[1001] w-full ${sizes[size]} bg-white dark:bg-[#002d6a] rounded-2xl shadow-lg animate-zoomIn pointer-events-auto overflow-hidden flex flex-col`}
        style={{ maxHeight }} // <-- tinggi maksimal modal
      >
        {/* header (tetap terlihat) */}
        <div
          className={`px-5 py-4 border-b border-black/10 dark:border-white/10 ${
            titleAlign === "center" ? "text-center" : ""
          } shrink-0`}
        >
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>

        {/* body (yang scroll) */}
        <div className="px-5 py-4 overflow-y-auto grow">{children}</div>

        {/* footer (tetap terlihat) */}
        {actions && (
          <div className="px-5 py-3 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
