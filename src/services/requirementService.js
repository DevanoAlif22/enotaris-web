// services/admin/requirementService.js
import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

// SESUAIKAN BASE dengan route di backend kamu:
// - Kalau kamu taruh di Route::prefix('requirement') => "/requirement"
// - Kalau di Route::prefix('notaris/requirement')   => "/notaris/requirement"
const BASE = "/admin/requirement";

export const requirementService = {
  // list requirement per activity
  async list({ activity_id, page = 1, per_page = 50, search = "" } = {}) {
    try {
      const { data } = await api.get(BASE, {
        params: { activity_id, page, per_page, search },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // create requirement untuk activity tertentu
  async create({ activity_id, name, is_file }) {
    try {
      const payload = { activity_id, name, is_file };
      const { data } = await api.post(BASE, payload);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // update nama/tipe requirement (tidak memindahkan activity_id)
  async update(id, { name, is_file }) {
    try {
      const payload = { name, is_file };
      // pakai POST /update/{id} biar konsisten dengan pattern lain di app-mu
      const { data } = await api.post(`${BASE}/update/${id}`, payload);
      // kalau backend kamu pakai PUT: await api.put(`${BASE}/${id}`, payload)
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
