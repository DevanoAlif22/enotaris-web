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
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async detail(id) {
    try {
      const { data } = await api.get(`${BASE_PATH}/${id}`);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async renderPdf(id, { html, pdf_options } = {}) {
    try {
      const payload = {};
      if (html != null) payload.html = html;
      if (pdf_options != null) payload.pdf_options = pdf_options;

      const { data } = await api.post(
        `/admin/draft/${id}/render-pdf`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return data;
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
      const errors = data?.data || data?.errors || null;
      throw { message: msg, errors, status: err?.response?.status };
    }
  },

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

  // =========== ⬇️ Tambahan API untuk upload gambar editor (Quill) ===========

  /**
   * Upload gambar dari editor ke BE → Cloudinary.
   * @param {File|Blob} file
   * @returns {Promise<{success:boolean, data:{url:string, public_id:string}}>}
   */
  async uploadEditorImage(file) {
    try {
      const fd = new FormData();
      fd.append("image", file);

      // endpoint sesuai controller yg kita buat: POST /notaris/editor/upload-image
      const { data } = await api.post(`/notaris/editor/upload-image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data; // {success, message, data:{url, public_id, ...}}
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  /**
   * (Opsional) Hapus gambar editor berdasarkan public_id Cloudinary.
   * @param {string} publicId
   */
  async deleteEditorImage(publicId) {
    try {
      const { data } = await api.delete(`/notaris/editor/image`, {
        data: { public_id: publicId },
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
