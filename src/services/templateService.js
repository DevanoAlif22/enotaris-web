// services/templateService.js
import api from "./api";

// ==== optional: ambil token dari localStorage (fallback) ====
function getToken() {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
}

const withAuth = (extra = {}) => {
  const token = getToken();
  return token
    ? {
        ...extra,
        headers: { ...(extra.headers || {}), Authorization: `Bearer ${token}` },
      }
    : extra;
};

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

const BASE = "/admin/templates";

export const templateService = {
  // GET /admin/templates
  async list({ page = 1, per_page = 10, search = "" } = {}) {
    try {
      const { data } = await api.get(
        BASE,
        withAuth({ params: { page, per_page, search } })
      );
      return data; // { success, data:[...], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /admin/templates/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`, withAuth());
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates
  async create({ name, custom_value }) {
    try {
      const payload = { name, custom_value };
      const { data } = await api.post(BASE, payload, withAuth());
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates/update/{id}
  async update(id, { name, custom_value }) {
    try {
      const payload = { name, custom_value };
      const { data } = await api.post(
        `${BASE}/update/${id}`,
        payload,
        withAuth()
      );
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // DELETE /admin/templates/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`, withAuth());
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates/import-docx
  async importDocx(file) {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post(
        `${BASE}/import-docx`,
        form,
        withAuth({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
      return data; // { success, data:{ html } }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // ===== RENDER PDF (UPLOAD ke Cloudinary) =====
  // POST /admin/templates/{id}/render-pdf  body: { html_rendered, pdf_options, upload:true, filename? }
  async renderPdf(id, { html, pdf_options, filename }) {
    try {
      const payload = {
        html_rendered: html, // kirim HTML final (sudah preserve NBSP)
        pdf_options,
        upload: true,
        filename, // tanpa .pdf (opsional)
      };
      const { data } = await api.post(
        `${BASE}/${id}/render-pdf`,
        payload,
        withAuth()
      );
      return data; // { success, data:{ file, file_path, filename, template_id } }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // ===== RENDER PDF (DOWNLOAD langsung) =====
  // POST /admin/templates/{id}/render-pdf  body: { html_rendered, pdf_options, upload:false, filename? }
  async renderPdfDownload(id, { html, pdf_options, filename }) {
    try {
      const payload = {
        html_rendered: html,
        pdf_options,
        upload: false,
        filename,
      };
      const res = await api.post(
        `${BASE}/${id}/render-pdf`,
        payload,
        withAuth({ responseType: "blob" }) // <- penting: terima file
      );
      // kembalikan Blob & suggested filename (jika ada di header)
      const blob = res?.data;
      const dispo = res?.headers?.["content-disposition"] || "";
      const match = dispo.match(/filename="?([^"]+)"?/i);
      const suggestedName = match?.[1] || `${filename || "template"}.pdf`;
      return { blob, filename: suggestedName };
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
