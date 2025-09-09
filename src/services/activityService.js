// services/notaris/activityService.js
import api from "./api";

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const activityService = {
  async list({ page = 1, per_page = 10, search = "", status = "" }) {
    try {
      const { data } = await api.get("/notaris/activity", {
        params: { page, per_page, search, status },
      });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async detail(id) {
    try {
      const { data } = await api.get(`/notaris/activity/${id}`);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async create({ name, deed_id, client_ids }) {
    try {
      const { data } = await api.post("/notaris/activity", {
        name,
        deed_id,
        client_ids,
      });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.post(
        `/notaris/activity/update/${id}`,
        payload
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`/notaris/activity/${id}`);
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async listClients(search = "") {
    try {
      const { data } = await api.get("/notaris/activity/user/client", {
        params: { search },
      });
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  // Tandai step docs selesai
  async markDocsDone(id) {
    try {
      const { data } = await api.get(`/notaris/activity/mark-done/docs/${id}`);
      return data; // { success: true, ... }
    } catch (e) {
      throw normErr(e);
    }
  },

  // === Tambah/hapus penghadap pada activity ===
  // GET /notaris/activity/user/add/{userid}/{activityid}
  async addUser(userId, activityId) {
    try {
      const { data } = await api.get(
        `/notaris/activity/user/add/${userId}/${activityId}`
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  // GET /notaris/activity/user/remove/{userid}/{activityid}
  async removeUser(userId, activityId) {
    try {
      const { data } = await api.get(
        `/notaris/activity/user/remove/${userId}/${activityId}`
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
