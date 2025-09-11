// utils/text/preserveSpaces.js
export function preserveSpaces(html) {
  if (html == null) return html;
  // tab -> 4 NBSP
  let out = html.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  // 2+ spasi -> NBSP sebanyak itu
  out = out.replace(/ {2,}/g, (m) => "&nbsp;".repeat(m.length));
  return out;
}
