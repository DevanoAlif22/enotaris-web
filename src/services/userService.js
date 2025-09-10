import api from "./api"; // axios instance dari sebelumnya

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg = data?.message || err?.message || "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

export const userService = {
  async getProfile() {
    try {
      const { data } = await api.get("/user/profile");
      return data?.data; // { user: {...}, identity: {...} }
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async getProfileById(userId) {
    const { data } = await api.get(`/user/profile/${userId}`);
    return data; // { user, identity }
  },
  async updateProfile({
    name,
    gender,
    telepon,
    address,
    province,
    city,
    postal_code,
    file_avatar,
  }) {
    try {
      const fd = new FormData();
      if (name != null) fd.append("name", name);
      if (gender != null) fd.append("gender", gender); // male|female|lainnya
      if (telepon != null) fd.append("telepon", telepon);
      if (address != null) fd.append("address", address);

      // ✅ field baru
      if (province != null) fd.append("province", province);
      if (city != null) fd.append("city", city);
      if (postal_code != null) fd.append("postal_code", postal_code);

      if (file_avatar instanceof File) fd.append("file_avatar", file_avatar);

      // Untuk melihat isi FormData, gunakan for...of
      for (let pair of fd.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }
      const { data } = await api.post("/user/update-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async updateIdentityProfile(payload) {
    // payload: { ktp, npwp, ktp_notaris, files: { file_ktp, file_kk, file_npwp, file_ktp_notaris, file_sign, file_photo } }
    try {
      const fd = new FormData();
      if (payload?.ktp != null) fd.append("ktp", payload.ktp);
      if (payload?.npwp != null) fd.append("npwp", payload.npwp);
      if (payload?.ktp_notaris != null)
        fd.append("ktp_notaris", payload.ktp_notaris);

      const files = payload?.files || {};
      Object.entries({
        file_ktp: files.file_ktp,
        file_kk: files.file_kk,
        file_npwp: files.file_npwp,
        file_ktp_notaris: files.file_ktp_notaris,
        file_sign: files.file_sign,
        file_photo: files.file_photo,
      }).forEach(([k, v]) => {
        if (v instanceof File) fd.append(k, v);
      });

      const { data } = await api.post("/user/update-identity-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },
};
