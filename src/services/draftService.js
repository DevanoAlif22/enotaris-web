// services/draftService.js
import api from "./api"; // axios instance

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

const BASE_PATH = "/admin/draft";

export const draftService = {
  async list({ page = 1, per_page = 10, search = "" } = {}) {
    try {
      const { data } = await api.get(`${BASE_PATH}`, {
        params: { page, per_page, search },
      });
      // { success, message, data: [], meta: {...} }
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async detail(id) {
    try {
      const { data } = await api.get(`${BASE_PATH}/${id}`);
      // { success, data: { ...draft, activity: {...} } }
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  // services/draftService.js (tambahkan)
  async renderPdf(id, { html } = {}) {
    try {
      const payload = {};
      if (html != null) payload.html_rendered = html; // ⬅️ pakai html_rendered

      const { data } = await api.post(
        `/admin/draft/${id}/render-pdf`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      return data; // { success, data: { file, file_path, ... } }
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
      const errors = data?.data || data?.errors || null;
      throw { message: msg, errors, status: err?.response?.status };
    }
  },
  /**
   * create draft
   * payload:
   * - activity_id (required, number)
   * - custom_value_template (string, html) [opsional]
   * - reading_schedule (string "YYYY-MM-DD HH:mm:ss") [opsional]
   * - status_approval ("pending"|"approved"|"rejected") [opsional]
   * - file (File/Blob) [opsional]
   */
  async create({
    activity_id,
    custom_value_template,
    reading_schedule,
    status_approval,
    file,
  }) {
    try {
      const fd = new FormData();
      if (activity_id != null) fd.append("activity_id", activity_id);
      if (custom_value_template != null)
        fd.append("custom_value_template", custom_value_template);
      if (reading_schedule != null)
        fd.append("reading_schedule", reading_schedule);
      if (status_approval != null)
        fd.append("status_approval", status_approval);
      if (file instanceof File || file instanceof Blob) fd.append("file", file);

      const { data } = await api.post(`${BASE_PATH}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  /**
   * update draft
   * payload:
   * - custom_value_template, reading_schedule, status_approval (opsional)
   * - file (File/Blob) untuk replace (opsional)
   * - clear_file (boolean) untuk hapus file yang lama tanpa upload baru
   *
   * NOTE: backend kamu pakai POST /draft/update/{id}. Kalau nanti ganti ke PUT /draft/{id},
   * ubah URL-nya.
   */
  async update(
    id,
    {
      custom_value_template,
      reading_schedule,
      status_approval,
      file,
      clear_file,
    } = {}
  ) {
    try {
      const fd = new FormData();
      if (custom_value_template !== undefined)
        fd.append("custom_value_template", custom_value_template ?? "");
      if (reading_schedule !== undefined)
        fd.append("reading_schedule", reading_schedule ?? "");
      if (status_approval !== undefined)
        fd.append("status_approval", status_approval ?? "");
      if (clear_file === true) fd.append("clear_file", "1");
      if (file instanceof File || file instanceof Blob) fd.append("file", file);

      const { data } = await api.post(`${BASE_PATH}/update/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async destroy(id) {
    try {
      const { data } = await api.delete(`${BASE_PATH}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
