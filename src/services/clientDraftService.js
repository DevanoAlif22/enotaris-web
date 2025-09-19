// services/clientDraftService.js
import api from "./api"; // axios instance kamu

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const clientDraftService = {
  async list({ page = 1, per_page = 10, search = "", status = "" } = {}) {
    try {
      const { data } = await api.get("/user/drafts", {
        params: { page, per_page, search, status },
      });
      // { success, data: [], meta: {...} }
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async detail(id) {
    try {
      const { data } = await api.get(`/user/drafts/${id}`);
      // { success, data: { draft, my_pivot } }
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async approve(id) {
    try {
      const { data } = await api.post(`/user/drafts/approval/${id}`, {
        approval_status: "approved",
      });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async reject(id) {
    try {
      const { data } = await api.post(`/user/drafts/approval/${id}`, {
        approval_status: "rejected",
      });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
