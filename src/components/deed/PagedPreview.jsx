import { useRef, useEffect, useState } from "react";

// Utility function to convert page size to pixels (96 DPI)
const getPageDimensions = (pageSize, orientation) => {
  const sizes = {
    A4: { width: 794, height: 1123 }, // 210mm × 297mm at 96 DPI
    A3: { width: 1123, height: 1587 }, // 297mm × 420mm at 96 DPI
    Letter: { width: 816, height: 1056 }, // 8.5" × 11" at 96 DPI
    Legal: { width: 816, height: 1344 }, // 8.5" × 14" at 96 DPI
    Folio: { width: 794, height: 1248 }, // 8.27" × 13" at 96 DPI
  };

  const size = sizes[pageSize] || sizes.A4;

  if (orientation === "landscape") {
    return { width: size.height, height: size.width };
  }
  return size;
};

// Convert mm to pixels (96 DPI: 1mm ≈ 3.78px)
const mmToPx = (mm) => Math.round(mm * 3.78);

// Get font family CSS value
const getFontFamily = (fontFamily) => {
  const fonts = {
    times: '"Times New Roman", Times, serif',
    arial: "Arial, sans-serif",
    helvetica: "Helvetica, Arial, sans-serif",
    calibri: "Calibri, Arial, sans-serif",
    georgia: "Georgia, serif",
    garamond: "Garamond, serif",
    cambria: "Cambria, serif",
  };
  return fonts[fontFamily] || fonts.times;
};

export default function PagedPreview({
  html,
  pdfOptions = {},
  className = "",
}) {
  const containerRef = useRef(null);
  const [pages, setPages] = useState([html]);

  // Extract options with defaults
  const {
    page_size = "A4",
    orientation = "portrait",
    margins_mm = { top: 20, right: 20, bottom: 20, left: 20 },
    font_family = "times",
    font_size_pt = 12,
    show_page_numbers = false,
    page_number_h_align = "right",
    page_number_v_align = "bottom",
  } = pdfOptions;

  // Calculate dimensions
  const { width: pageWidthPx, height: pageHeightPx } = getPageDimensions(
    page_size,
    orientation
  );
  const paddingTop = mmToPx(margins_mm.top);
  const paddingRight = mmToPx(margins_mm.right);
  const paddingBottom = mmToPx(margins_mm.bottom);
  const paddingLeft = mmToPx(margins_mm.left);

  // Content area dimensions (excluding padding)
  const contentWidth = pageWidthPx - paddingLeft - paddingRight;
  const contentHeight = pageHeightPx - paddingTop - paddingBottom;

  useEffect(() => {
    if (!containerRef.current || !html) return;

    // Create a hidden div to measure content
    const hidden = document.createElement("div");
    hidden.style.position = "absolute";
    hidden.style.visibility = "hidden";
    hidden.style.pointerEvents = "none";
    hidden.style.zIndex = "-1";
    hidden.style.width = `${contentWidth}px`;
    hidden.style.minHeight = "auto";
    hidden.style.padding = "0";
    hidden.style.whiteSpace = "break-spaces";
    hidden.style.tabSize = "4";

    // Apply PDF font settings
    hidden.style.fontFamily = getFontFamily(font_family);
    hidden.style.fontSize = `${font_size_pt}px`; // Approximate pt to px conversion
    hidden.style.lineHeight = "1.4";

    hidden.innerHTML = html || "";
    document.body.appendChild(hidden);

    let currPage = [];
    let currHeight = 0;
    const pagesArr = [];

    const children = Array.from(hidden.childNodes);
    children.forEach((node) => {
      const clone = node.cloneNode(true);
      hidden.innerHTML = "";
      hidden.appendChild(clone);
      const nodeHeight = hidden.offsetHeight;

      // Check if adding this node would exceed page height
      if (currHeight + nodeHeight > contentHeight && currPage.length) {
        pagesArr.push(currPage.join(""));
        currPage = [];
        currHeight = 0;
      }

      currPage.push(node.outerHTML || node.textContent);
      currHeight += nodeHeight;
    });

    if (currPage.length) pagesArr.push(currPage.join(""));

    setPages(pagesArr);
    hidden.remove();
  }, [
    html,
    pageWidthPx,
    pageHeightPx,
    contentWidth,
    contentHeight,
    font_family,
    font_size_pt,
  ]);

  // Style for page numbers
  const getPageNumberStyle = (pageIndex) => {
    const isTop = page_number_v_align === "top";
    const baseStyle = {
      position: "absolute",
      fontSize: "12px",
      color: "#888",
      fontFamily: getFontFamily(font_family),
      opacity: 0.7,
      userSelect: "none",
      zIndex: 10,
    };
    console.log(pageIndex);

    // Vertical positioning
    if (isTop) {
      baseStyle.top = `${paddingTop / 2 - 6}px`; // Center in top margin
    } else {
      baseStyle.bottom = `${paddingBottom / 2 - 6}px`; // Center in bottom margin
    }

    // Horizontal positioning
    switch (page_number_h_align) {
      case "left":
        baseStyle.left = `${paddingLeft}px`;
        break;
      case "center":
        baseStyle.left = "50%";
        baseStyle.transform = "translateX(-50%)";
        break;
      case "right":
      default:
        baseStyle.right = `${paddingRight}px`;
        break;
    }

    return baseStyle;
  };

  return (
    <div
      style={{ backgroundColor: "#01043c" }}
      className={`paged-preview ${className}`}
      ref={containerRef}
    >
      {pages.map((pageHtml, i) => (
        <div
          key={i}
          className="paged-preview-page preview-content whitespace-break-spaces [tab-size:4]"
          style={{
            width: pageWidthPx,
            minHeight: pageHeightPx,
            padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
            fontFamily: getFontFamily(font_family),
            fontSize: `${font_size_pt}px`,
            lineHeight: 1.4,
          }}
          dangerouslySetInnerHTML={{ __html: pageHtml }}
        />
      ))}

      {/* Page numbers */}
      {show_page_numbers &&
        pages.length > 1 &&
        pages.map((_, i) => (
          <div key={`num-${i}`} style={getPageNumberStyle(i)}>
            {i + 1}
          </div>
        ))}
    </div>
  );
}
