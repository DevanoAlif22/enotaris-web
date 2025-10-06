import api from "./api"; // axios instance (sudah kamu punya)

const normErr = (err) => {
  const data = err?.response?.data;
  const message = data?.message || err?.message || "Terjadi kesalahan.";
  const errors = data?.errors || data?.data || null;
  return { message, errors, status: err?.response?.status };
};

/** FE -> BE role map */
const mapRoleToId = (role) => {
  if (!role) return null;
  const r = String(role).toLowerCase();
  if (r === "notaris") return 3;
  if (r === "klien" || r === "penghadap") return 2;
  return null;
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

  async create({ name, email, password, role }) {
    const role_id = mapRoleToId(role);
    const payload = { name, email, password, role_id };

    const { data } = await api.post("/admin/user", payload);
    return data;
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
