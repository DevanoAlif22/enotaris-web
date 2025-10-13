import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  return { message: msg, status: err?.response?.status };
};

export const landingService = {
  async statistics() {
    try {
      const { data } = await api.get("/landing/statistics");
      // { success, data: { projects, notaries, clients, deeds } }
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
  async templates({ q = "", limit = 12 } = {}) {
    try {
      const params = { q, limit };
      const { data } = await api.get("/landing/templates", { params });
      return data; // { success, data:[{id,title,desc,icon_url}], meta:{count} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
  async blogs({ q = "", categories = [], page = 1, per_page = 9 } = {}) {
    try {
      const params = { q, page, per_page };
      if (Array.isArray(categories) && categories.length) {
        params.categories = categories.join(","); // kirim sebagai "A,B"
      }
      const { data } = await api.get("/landing/blogs", { params });
      return data; // { success, data:[], meta:{} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async blogCategories() {
    try {
      const { data } = await api.get("/landing/blog-categories");
      return data; // { success, data:[{id,name}], meta:{} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
  async latestBlogs({ limit = 6 } = {}) {
    try {
      const { data } = await api.get("/landing/blogs/latest", {
        params: { limit },
      });
      return data; // { success, data:[...], meta:{count} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
  async settings() {
    try {
      const { data } = await api.get("/landing/settings");
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
