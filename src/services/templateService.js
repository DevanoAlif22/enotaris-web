import api from "./api";

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
      const { data } = await api.get(BASE, {
        params: { page, per_page, search },
      });
      return data; // { success, data:[{id,name,custom_value,...}], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /admin/templates/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      return data; // { success, data:{id,name,custom_value,...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/templates
  async create({ name, custom_value }) {
    try {
      const payload = { name, custom_value };
      const { data } = await api.post(BASE, payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // PUT /admin/templates/{id}
  async update(id, { name, custom_value }) {
    try {
      const payload = { name, custom_value };
      const { data } = await api.post(`${BASE}/update/${id}`, payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // DELETE /admin/templates/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // services/templateService.js
  async importDocx(file) {
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post(`${BASE}/import-docx`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data; // { success, data:{ html } }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
