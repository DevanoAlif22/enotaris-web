import DOMPurify from "dompurify";

// ubah tab & spasi jadi NBSP biar layout gak “runtuh”
export function preserveSpaces(html) {
  if (html == null) return html;
  let out = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"); // tab -> 4 NBSP
  out = out.replace(/ {2,}/g, (m) => "&nbsp;".repeat(m.length)); // 2+ spasi -> NBSP
  return out;
}

// sanitize hasil konversi dari mammoth sebelum masuk editor
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
