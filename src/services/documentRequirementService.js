// services/user/documentRequirementService.js
import api from "./api"; // axios instance

const normErr = (err) => {
  const data = err?.response?.data;
  return {
    message: data?.message || err?.message || "Terjadi kesalahan",
    errors: data?.data || data?.errors || null,
    status: err?.response?.status,
  };
};

export const documentRequirementService = {
  /**
   * Update requirement:
   * - kalau kirim file, pakai multipart (field "file")
   * - kalau kirim text, pakai JSON { value }
   */
  async update(id, payload) {
    try {
      if (payload?.file instanceof File) {
        const fd = new FormData();
        fd.append("file", payload.file);
        // opsi lain (jarang dipakai saat upload)
        if (payload.activity_notaris_id)
          fd.append("activity_notaris_id", payload.activity_notaris_id);
        if (payload.user_id) fd.append("user_id", payload.user_id);

        const { data } = await api.post(
          `/user/document-requirement/update/${id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data;
      } else {
        const body = {};
        if (typeof payload?.value === "string") body.value = payload.value;
        if (payload?.activity_notaris_id)
          body.activity_notaris_id = payload.activity_notaris_id;
        if (payload?.user_id) body.user_id = payload.user_id;

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
};
