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

// Helper buat kirim payload (otomatis jadi FormData kalau ada file)
function buildPayload(obj = {}) {
  const hasFile = obj.logoFile instanceof File;
  if (!hasFile) return obj;

  const form = new FormData();
  if (obj.name) form.append("name", obj.name);
  if (obj.description !== undefined)
    form.append("description", obj.description ?? "");
  if (obj.custom_value !== undefined)
    form.append("custom_value", obj.custom_value);
  if (obj.clear_logo) form.append("clear_logo", "1");
  if (obj.logoFile) form.append("logo", obj.logoFile);
  return form;
}

const BASE = "/admin/templates";

export const templateService = {
  // GET /admin/templates
  async list({ page = 1, per_page = 10, search = "" } = {}) {
    try {
      const { data } = await api.get(
        BASE,
        withAuth({ params: { page, per_page, search } })
      );
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /admin/templates/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`, withAuth());
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates
  async create({
    name,
    description = "",
    custom_value,
    logoFile = null,
    clear_logo = false,
  }) {
    try {
      const body = buildPayload({
        name,
        description,
        custom_value,
        logoFile,
        clear_logo,
      });
      const headers =
        body instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined;

      const { data } = await api.post(BASE, body, { ...withAuth(), headers });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates/update/{id}
  async update(
    id,
    {
      name,
      description = "",
      custom_value,
      logoFile = null,
      clear_logo = false,
    }
  ) {
    try {
      const body = buildPayload({
        name,
        description,
        custom_value,
        logoFile,
        clear_logo,
      });
      const headers =
        body instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined;

      const { data } = await api.post(`${BASE}/update/${id}`, body, {
        ...withAuth(),
        headers,
      });
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
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates/{id}/render-pdf (upload ke Cloudinary)
  async renderPdf(id, { html, pdf_options, filename }) {
    try {
      const payload = {
        html_rendered: html,
        pdf_options,
        upload: true,
        filename,
      };
      const { data } = await api.post(
        `${BASE}/${id}/render-pdf`,
        payload,
        withAuth()
      );
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates/{id}/render-pdf (download langsung)
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
        withAuth({
          responseType: "blob",
        })
      );
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
