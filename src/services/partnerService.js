// services/partnerService.js
import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

// Ganti ke "/admin/partners" jika API kamu diprefix "admin"
const BASE = "/admin/partners";
const BASENOADMIN = "/partners";

export const partnerService = {
  // GET /partners (?search=, ?per_page=, ?page=)
  async list({ page = 1, per_page = 10, search = "" } = {}) {
    try {
      const params = { page, per_page, search };
      const { data } = await api.get(BASENOADMIN, { params });
      return data; // { success, data:[...], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /partners/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /partners (multipart; image optional)
  // body: name, link?, image?
  async create({ name, link = "", imageFile = null }) {
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (link !== undefined && link !== null) fd.append("link", link);
      if (imageFile) fd.append("image", imageFile);

      const { data } = await api.post(BASE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /partners/update/{id} (multipart)
  // body: name?, link?, image?, clear_image?
  async update(id, { name, link, imageFile, clear_image = false } = {}) {
    try {
      const fd = new FormData();
      if (name !== undefined) fd.append("name", name);
      if (link !== undefined) fd.append("link", link ?? "");
      if (clear_image) fd.append("clear_image", "1");
      if (imageFile) fd.append("image", imageFile);

      const { data } = await api.post(`${BASE}/update/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // DELETE /partners/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /partners/all/partner (?min=true)
  async all({ min = false } = {}) {
    try {
      const params = { min };
      const { data } = await api.get(`/partners/all/partner`, { params });
      return data; // { success, data:[...], meta:{count:n} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
