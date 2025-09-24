// services/notaris/notaris/signService.js
import api from "./api"; // sesuaikan path sesuai struktur project-mu

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const signService = {
  /**
   * Terapkan tanda tangan ke PDF draft
   *
   * @param {number} activityId
   * @param {object} payload { source_pdf?: string, placements: [] }
   * contoh placements:
   * [
   *   { page:1, kind:"image", source_user_id:5, x_ratio:0.1, y_ratio:0.8, w_ratio:0.3, h_ratio:0.1 },
   *   { page:1, kind:"draw", image_data_url:"data:image/png;base64,...", x_ratio:0.5, y_ratio:0.8, w_ratio:0.2, h_ratio:0.1 }
   * ]
   */
  async apply(activityId, payload) {
    try {
      const { data } = await api.post(
        `/notaris/activities/${activityId}/sign/apply`,
        payload
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },
  async resetTtd(activityId) {
    const { data } = await api.post(
      `/notaris/activities/${activityId}/sign/reset-ttd`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  /**
   * (opsional) simpan placements tanpa langsung stamp, kalau kamu sediakan endpoint storePlacements
   */
  async savePlacements(activityId, payload) {
    try {
      const { data } = await api.post(
        `/notaris/activities/${activityId}/sign/placements`,
        payload
      );
      return data;
    } catch (e) {
      throw normErr(e);
    }
  },

  async markDone(activityId) {
    try {
      const { data } = await api.post(
        `/notaris/activities/${activityId}/sign/done`
      );
      return data;
    } catch (err) {
      throw normErr(err);
    }
  },
};
