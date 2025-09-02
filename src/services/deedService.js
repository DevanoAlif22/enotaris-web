// services/deedService.js
import api from "./api"; // axios instance

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

export const deedService = {
  async list({ page = 1, per_page = 10, search = "" } = {}) {
    try {
      const { data } = await api.get("/admin/deed", {
        params: { page, per_page, search },
      });
      // { success, message, data: [], meta: {...} }
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async detail(id) {
    try {
      const { data } = await api.get(`/admin/deed/${id}`);
      return data; // { success, data: { ...deed, requirements:[], ... } }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async create({ name, description, total_client }) {
    try {
      const payload = { name, description, total_client };
      const { data } = await api.post("/admin/deed", payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async update(id, { name, description, total_client }) {
    try {
      const payload = { name, description, total_client };
      const { data } = await api.post(`/admin/deed/update/${id}`, payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`/admin/deed/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
