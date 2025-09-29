import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

const BASE = "/admin/blogs";

export const blogService = {
  // GET /blogs  (?search=, ?per_page=, ?user_id=)
  async list({ page = 1, per_page = 10, search = "", user_id } = {}) {
    try {
      const { data } = await api.get(BASE, {
        params: { page, per_page, search, user_id },
      });
      return data; // { success, data:[...], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /blogs/{id}
  async get(id) {
    try {
      const { data } = await api.get(`${BASE}/${id}`);
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /blogs  (multipart/form-data; image optional)
  async create({ title, description, imageFile }) {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      if (imageFile) fd.append("image", imageFile);

      const { data } = await api.post(BASE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /blogs/update/{id}  (image optional, clear_image optional)
  async update(id, { title, description, imageFile, clear_image = false }) {
    try {
      const fd = new FormData();
      if (title !== undefined) fd.append("title", title);
      if (description !== undefined) fd.append("description", description);
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

  // DELETE /blogs/{id}
  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /blogs/all/blog  (?min=true)
  async all({ min = false } = {}) {
    try {
      const { data } = await api.get(`${BASE}/all/blog`, { params: { min } });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
