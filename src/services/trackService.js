// services/trackService.js
import api from "./api";

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const trackService = {
  async lookup(code) {
    try {
      const { data } = await api.get(
        `/track/lookup/${encodeURIComponent(code)}`
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
  // (opsional, kalau mau POST)
  async lookupPost(code) {
    try {
      const { data } = await api.post(`/track/lookup`, { tracking_code: code });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
