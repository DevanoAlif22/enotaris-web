// services/notaris/documentRequirementService.js
import api from "./api"; // axios instance yang sudah pakai baseURL & auth

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const documentRequirementNotarisService = {
  /**
   * Ambil semua requirement untuk activity (mode notaris).
   * GET /user/notaris/document-requirement/by-activity-notaris/{activityId}
   */
  async getForNotary(activityId, params = {}) {
    try {
      const { data } = await api.get(
        `/notaris/document-requirement/by-activity-notaris/${activityId}`,
        { params }
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  /**
   * Ambil requirement untuk activity + user tertentu (mode notaris).
   * POST /user/notaris/document-requirement/by-activity-notaris/{activityId}/{userId}
   * (gunakan jika ingin langsung filter per user)
   */
  async getForNotaryUser(activityId, userId) {
    try {
      const { data } = await api.post(
        `/notaris/document-requirement/by-activity-notaris/${activityId}/${userId}`
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  /**
   * Update requirement: file atau text.
   * POST /user/notaris/document-requirement/update/{id}
   * - notaris boleh sertakan user_id (klien target) & activity_notaris_id
   */
  async update(id, payload) {
    try {
      if (payload?.file instanceof File) {
        const fd = new FormData();
        fd.append("file", payload.file);
        if (payload.user_id) fd.append("user_id", payload.user_id);
        if (payload.activity_notaris_id)
          fd.append("activity_notaris_id", payload.activity_notaris_id);

        const { data } = await api.post(
          `/user/document-requirement/update/${id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data;
      } else {
        const body = {};
        if (typeof payload?.value === "string") body.value = payload.value;
        if (payload?.user_id) body.user_id = payload.user_id;
        if (payload?.activity_notaris_id)
          body.activity_notaris_id = payload.activity_notaris_id;

        const { data } = await api.post(
          `/user/document-requirement/update/${id}`,
          body
        );
        return data;
      }
    } catch (e) {
      throw normErr(e);
    }
  },

  /**
   * Approve/Reject requirement (notaris).
   * POST /user/notaris/document-requirement/approval/{id}  body: { status_approval: 'approved'|'rejected' }
   */
  async approve(id, status_approval) {
    try {
      const { data } = await api.post(
        `/notaris/document-requirement/approval/${id}`,
        {
          status_approval,
        }
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
};
