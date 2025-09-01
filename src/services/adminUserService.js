import api from "./api"; // axios instance (sudah kamu punya)

const normErr = (err) => {
  const data = err?.response?.data;
  const message = data?.message || err?.message || "Terjadi kesalahan.";
  const errors = data?.errors || data?.data || null;
  return { message, errors, status: err?.response?.status };
};

// NOTE: routes dilindungi ability:admin, pastikan tokenmu punya ability tersebut.
export const adminUserService = {
  async getAll({ page = 1, per_page = 10, q = "" } = {}) {
    try {
      const { data } = await api.get("/admin/user", {
        params: { page, per_page, q: q || undefined },
      });
      // BE response: { success, message, data: users[], meta: {...} }
      return data;
    } catch (err) {
      throw normErr(err);
    }
  },

  async getDetail(id) {
    try {
      const { data } = await api.get(`/admin/user/${id}`);
      // BE response: { success, message, data: {...} }
      return data;
    } catch (err) {
      throw normErr(err);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`/admin/user/${id}`);
      return data;
    } catch (err) {
      throw normErr(err);
    }
  },
};
