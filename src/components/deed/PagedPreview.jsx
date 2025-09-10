/**
 * PagedPreview splits HTML content into word-like pages by height.
 * @param {string} html - The HTML string to render.
 * @param {number} pageHeightPx - Height of each page in px (default A4: 1123px).
 * @param {number} pageWidthPx - Width of each page in px (default A4: 794px).
 */
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
    // Dynamically paginate content by height
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
    hidden.innerHTML = html;
    document.body.appendChild(hidden);

    // Split children nodes into pages
    let currPage = [];
    let currHeight = 0;
    let pagesArr = [];
    const children = Array.from(hidden.childNodes);

    children.forEach((node, idx) => {
      // Clone node to measure
      const clone = node.cloneNode(true);
      hidden.innerHTML = "";
      hidden.appendChild(clone);
      console.log(idx);
      const nodeHeight = hidden.offsetHeight;

      if (currHeight + nodeHeight > pageHeightPx && currPage.length) {
        // Start new page
        pagesArr.push(currPage.join(""));
        currPage = [];
        currHeight = 0;
      }
      currPage.push(node.outerHTML || node.textContent);
      currHeight += nodeHeight;
    });

    if (currPage.length) {
      pagesArr.push(currPage.join(""));
    }

    setPages(pagesArr);
    hidden.remove();
  }, [html, pageHeightPx, pageWidthPx]);

  return (
    <div className={`paged-preview ${className}`} ref={containerRef}>
      {pages.map((pageHtml, i) => (
        <div
          key={i}
          className="paged-preview-page preview-content"
          style={{ width: pageWidthPx, minHeight: pageHeightPx }}
          dangerouslySetInnerHTML={{ __html: pageHtml }}
        ></div>
      ))}
      {/* Page numbers */}
      {pages.length > 1 &&
        pages.map((_, i) => (
          <div
            key={i}
            className="paged-preview-page-number"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {i + 1}
          </div>
        ))}
    </div>
  );
}
