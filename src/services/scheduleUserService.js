// services/scheduleUserService.js
import api from "./api"; // axios instance yg sudah include Authorization header

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const scheduleUserService = {
  async index(params = {}) {
    try {
      const { data } = await api.get("/schedule/user", { params });
      return data; // {success, data:[...], meta:{...}}
    } catch (e) {
      throw normErr(e);
    }
  },

  async show(id) {
    try {
      const { data } = await api.get(`/schedule/user/${id}`);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
