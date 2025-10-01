// services/settingsService.js
import api from "./api";

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

// Jika API kamu diprefix admin, pakai ini:
const BASE_ADMIN = "/admin/settings";
// Endpoint publik tanpa auth:
const BASE_PUBLIC = "/public/settings";

export const settingsService = {
  /**
   * GET /settings (admin) → ambil single row settings
   * Response: { success, data: {...} }
   */
  async get() {
    try {
      const { data } = await api.get(BASE_ADMIN);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  /**
   * GET /public/settings (public) → ambil settings untuk landing/public
   * Response: { success, data: {...} }
   */
  async publicGet() {
    try {
      const { data } = await api.get(BASE_PUBLIC);
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  /**
   * POST /settings (admin) → upsert single row settings
   * Kirim multipart form:
   * {
   *   telepon?, facebook?, instagram?, twitter?, linkedin?,
   *   title_hero?, desc_hero?, desc_footer?,
   *   logoFile?, faviconFile?, clear_logo?, clear_favicon?
   * }
   */
  async upsert({
    telepon,
    facebook,
    instagram,
    twitter,
    linkedin,
    title_hero,
    desc_hero,
    desc_footer,
    logoFile, // File | undefined
    faviconFile, // File | undefined
    clear_logo = false,
    clear_favicon = false,
  } = {}) {
    try {
      const fd = new FormData();

      // teks (kirim hanya jika tidak undefined agar partial update bisa)
      if (telepon !== undefined) fd.append("telepon", telepon ?? "");
      if (facebook !== undefined) fd.append("facebook", facebook ?? "");
      if (instagram !== undefined) fd.append("instagram", instagram ?? "");
      if (twitter !== undefined) fd.append("twitter", twitter ?? "");
      if (linkedin !== undefined) fd.append("linkedin", linkedin ?? "");
      if (title_hero !== undefined) fd.append("title_hero", title_hero ?? "");
      if (desc_hero !== undefined) fd.append("desc_hero", desc_hero ?? "");
      if (desc_footer !== undefined)
        fd.append("desc_footer", desc_footer ?? "");

      // flags hapus media lama
      if (clear_logo) fd.append("clear_logo", "1");
      if (clear_favicon) fd.append("clear_favicon", "1");

      // file baru
      if (logoFile) fd.append("logo", logoFile);
      if (faviconFile) fd.append("favicon", faviconFile);

      const { data } = await api.post(BASE_ADMIN, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data; // { success, data:{...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
