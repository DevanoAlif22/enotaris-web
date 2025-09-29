import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

const BASE = "/admin/category-blogs";

export const categoryBlogService = {
  // GET /category-blogs?search=&per_page=
  async list({ page = 1, per_page = 50, search = "" } = {}) {
    try {
      const { data } = await api.get(BASE, {
        params: { page, per_page, search },
      });
      return data; // { success, data:[{id,name}], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /category-blogs/all?min=true
  async all({ min = true } = {}) {
    try {
      const { data } = await api.get(`${BASE}/all`, { params: { min } });
      return data; // { success, data:[{id,name}] }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /category-blogs/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /category-blogs
  async create({ name }) {
    try {
      const { data } = await api.post(BASE, { name });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /category-blogs/update/{id}
  async update(id, { name }) {
    try {
      const { data } = await api.post(`${BASE}/update/${id}`, { name });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // DELETE /category-blogs/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
