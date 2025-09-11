import { useRef, useEffect, useState } from "react";

export default function PagedPreview({
  html,
  pageHeightPx = 1123,
  pageWidthPx = 794,
  className = "",
}) {
  const containerRef = useRef(null);
  const [pages, setPages] = useState([html]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a hidden div to measure/fake pages
    const hidden = document.createElement("div");
    hidden.style.position = "absolute";
    hidden.style.visibility = "hidden";
    hidden.style.pointerEvents = "none";
    hidden.style.zIndex = "-1";
    hidden.style.width = `${pageWidthPx - 80}px`; // subtract padding
    hidden.style.minHeight = "auto";
    hidden.style.padding = "0";

    // ⬅️ penting: samakan white-space & tab-size dgn tampilan
    hidden.style.whiteSpace = "break-spaces"; // atau "pre-wrap"
    hidden.style.tabSize = "4";

    // ⬅️ (opsional tapi direkomendasikan) samakan font metrics agar tinggi akurat
    const computed = getComputedStyle(containerRef.current);
    hidden.style.fontFamily = computed.fontFamily;
    hidden.style.fontSize = computed.fontSize;
    hidden.style.lineHeight = computed.lineHeight;

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

      if (currHeight + nodeHeight > pageHeightPx && currPage.length) {
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
  }, [html, pageHeightPx, pageWidthPx]);

  return (
    <div className={`paged-preview ${className}`} ref={containerRef}>
      {pages.map((pageHtml, i) => (
        <div
          key={i}
          // ⬅️ penting: jaga spasi/tab saat ditampilkan
          className="paged-preview-page preview-content whitespace-break-spaces [tab-size:4]"
          style={{ width: pageWidthPx, minHeight: pageHeightPx }}
          dangerouslySetInnerHTML={{ __html: pageHtml }}
        />
      ))}

      {pages.length > 1 &&
        pages.map((_, i) => (
          <div
            key={`num-${i}`}
            className="paged-preview-page-number"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {i + 1}
          </div>
        ))}
    </div>
  );
}
