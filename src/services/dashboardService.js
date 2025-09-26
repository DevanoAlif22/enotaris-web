// services/dashboardService.js
import api from "./api";

const normErr = (err) => {
  const d = err?.response?.data;
  return {
    message: d?.message || err?.message || "Terjadi kesalahan",
    errors: d?.data || d?.errors || null,
    status: err?.response?.status,
  };
};

export const dashboardService = {
  async getData() {
    try {
      const { data } = await api.get("/dashboard");
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
