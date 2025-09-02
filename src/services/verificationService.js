import api from "./api";

const normErr = (err) => {
  const data = err?.response?.data;
  const message = data?.message || err?.message || "Terjadi kesalahan.";
  const errors = data?.errors || data?.data || null;
  return { message, errors, status: err?.response?.status };
};

/**
 * Helper untuk pilih endpoint list sesuai tab.
 * type: 'pending' | 'approved' | 'rejected' | 'rejected-pending' | 'all'
 */
const pathByType = (type) => {
  switch (type) {
    case "pending":
      return "/admin/verification/users-pending";
    case "approved":
      return "/admin/verification/users-approved";
    case "rejected":
      return "/admin/verification/users-rejected";
    case "rejected-pending":
      return "/admin/verification/users-rejected-pending";
    case "all":
    default:
      return "/admin/verification/users";
  }
};

export const verificationService = {
  /**
   * List identitas by status (server-side pagination + search).
   * opts: { page=1, per_page=10, search="" }
   */
  async list(type = "pending", opts = {}) {
    try {
      const { page = 1, per_page = 10, search = "" } = opts;
      const { data } = await api.get(pathByType(type), {
        params: { page, per_page, search: search || undefined },
      });
      // BE: { success, message, data:[], meta:{} }
      return data;
    } catch (err) {
      throw normErr(err);
    }
  },

  /**
   * Detail user identity untuk modal detail (sesuai route GET /verification/users/{id})
   */
  async getUserDetail(userId) {
    try {
      const { data } = await api.get(`/admin/verification/users/${userId}`);
      return data; // { success, data:{ user:{...}, identity:{...} } }
    } catch (err) {
      throw normErr(err);
    }
  },

  /**
   * Verifikasi/ubah status
   * payload: { id, status_verification: 'pending|approved|rejected', notes_verification? }
   */
  async verifyIdentity(payload) {
    try {
      const { data } = await api.post("/admin/verification/identity", payload);
      return data; // { success, data:{ id, name, email, status_verification, notes_verification } }
    } catch (err) {
      throw normErr(err);
    }
  },
};
