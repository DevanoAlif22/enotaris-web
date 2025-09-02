// services/admin/requirementService.js
import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

export const requirementService = {
  async list({ deed_id, page = 1, per_page = 50, search = "" } = {}) {
    try {
      const { data } = await api.get("/admin/requirement", {
        params: { deed_id, page, per_page, search },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async create({ deed_id, name, is_file }) {
    try {
      const payload = { deed_id, name, is_file };
      const { data } = await api.post("/admin/requirement", payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async update(id, { deed_id, name, is_file }) {
    try {
      const payload = { deed_id, name, is_file };
      const { data } = await api.post(
        `/admin/requirement/update/${id}`,
        payload
      );
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`/admin/requirement/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
