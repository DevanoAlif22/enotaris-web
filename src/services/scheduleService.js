// services/notaris/notaris/scheduleService.js
import api from "./api"; // sesuaikan path dgn struktur project-mu

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const scheduleService = {
  async index(params = {}) {
    try {
      const { data } = await api.get("/notaris/schedule", { params });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async show(id) {
    try {
      const { data } = await api.get(`/notaris/schedule/${id}`);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  /**
   * Store jadwal
   * payload: { activity_id: number, date: 'YYYY-MM-DD', time: 'HH:mm', location?: string, notes?: string }
   */
  async store(payload) {
    try {
      const { data } = await api.post("/notaris/schedule", payload);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  /**
   * Update jadwal
   * payload: { activity_id: number, date: 'YYYY-MM-DD', time: 'HH:mm', location?: string, notes?: string }
   */
  async update(id, payload) {
    try {
      const { data } = await api.post(
        `/notaris/schedule/update/${id}`,
        payload
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`/notaris/schedule/${id}`);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
