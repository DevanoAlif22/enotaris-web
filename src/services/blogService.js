// src/services/blogService.js
import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

// Samakan dengan BE kamu. Jika pakai prefix '/blogs' saja, ubah BASE sesuai itu.
const BASE = "/admin/blogs";

const toFormData = (obj = {}) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
    else fd.append(k, v);
  });
  return fd;
};

export const blogService = {
  // GET /admin/blogs?search=&page=&per_page=&user_id=
  async list({ page = 1, per_page = 10, search = "", user_id } = {}) {
    try {
      const params = { page, per_page };
      if (search) params.search = search;
      if (user_id) params.user_id = user_id;
      const { data } = await api.get(BASE, { params });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /admin/blogs/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/blogs
  async create({ title, description, image }) {
    try {
      const form = toFormData({ title, description, image });
      const { data } = await api.post(BASE, form);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /admin/blogs/update/{id}
  async update(id, { title, description, image } = {}) {
    const form = new FormData();
    if (title != null) form.append("title", title);
    if (description != null) form.append("description", description);
    if (image) form.append("image", image);
    const { data } = await api.post(`/admin/blogs/update/${id}`, form);
    return data;
  },

  // DELETE /admin/blogs/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
