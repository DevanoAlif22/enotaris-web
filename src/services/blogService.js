import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

const BASE = "/admin/blogs"; // ganti ke "/admin/blogs" kalau API-mu diprefix admin

export const blogService = {
  // GET /blogs  (?search=, ?per_page=, ?user_id=, ?category_blog_id=, ?with=categories)
  async list({
    page = 1,
    per_page = 10,
    search = "",
    user_id,
    category_blog_id,
    withCategories = true,
  } = {}) {
    try {
      const params = { page, per_page, search };
      if (user_id) params.user_id = user_id;
      if (category_blog_id) params.category_blog_id = category_blog_id;
      if (withCategories) params.with = "categories";

      const { data } = await api.get(BASE, { params });
      return data; // { success, data:[...], meta:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // GET /blogs/{id} (?with=categories)
  async get(id, { withCategories = true } = {}) {
    try {
      const params = {};
      if (withCategories) params.with = "categories";
      const { data } = await api.get(`${BASE}/${id}`, { params });
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /blogs  (multipart; image optional; category_blog_ids[])
  async create({ title, description, imageFile, category_blog_ids = [] }) {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      if (imageFile) fd.append("image", imageFile);
      (category_blog_ids || []).forEach((id) =>
        fd.append("category_blog_ids[]", id)
      );

      const { data } = await api.post(BASE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // POST /blogs/update/{id}  (multipart)
  async update(
    id,
    { title, description, imageFile, clear_image = false, category_blog_ids }
  ) {
    try {
      const fd = new FormData();
      if (title !== undefined) fd.append("title", title);
      if (description !== undefined) fd.append("description", description);
      if (clear_image) fd.append("clear_image", "1");
      if (imageFile) fd.append("image", imageFile);

      // Hanya kirim kalau ingin mengubah set kategori:
      if (Array.isArray(category_blog_ids)) {
        // kirim array kosong → detach semua
        category_blog_ids.forEach((id) => fd.append("category_blog_ids[]", id));
      }

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
  async all({ min = false, withCategories = false } = {}) {
    try {
      const params = { min };
      if (withCategories) params.with = "categories";
      const { data } = await api.get(`${BASE}/all/blog`, { params });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
