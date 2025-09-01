import api, { tokenStore } from "./api";

const mapRoleToId = (role) => {
  // FE kamu pakai "notaris"/"klien", BE minta 3 (notaris) / 2 (penghadap)
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "notaris") return 3;
  if (r === "klien" || r === "penghadap") return 2;
  return null;
};

const normalizeErr = (err) => {
  const data = err?.response?.data;
  const msg =
    data?.message ||
    data?.error ||
    err?.message ||
    "Terjadi kesalahan. Coba lagi.";
  const errors = data?.data || data?.errors || null;
  return { message: msg, errors, status: err?.response?.status };
};

export const authService = {
  async register({ name, email, password, confirmPassword, role }) {
    try {
      const role_id = mapRoleToId(role);
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
        role_id,
      });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async verify({ email, kode }) {
    try {
      const { data } = await api.post("/auth/verify", { email, kode });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async resendCode({ email }) {
    try {
      const { data } = await api.post("/auth/resend", { email });
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async login({ email, password }) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      // BE balikin: role_id, name, email, token
      tokenStore.set(data?.data?.token);
      localStorage.setItem("auth_user", JSON.stringify(data?.data || {}));
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore network/401 saat logout; tetap bersihkan token
      console.log(err);
    } finally {
      tokenStore.clear();
      localStorage.removeItem("auth_user");
    }
  },

  async checkUser() {
    try {
      const { data } = await api.get("/auth/check-user");
      return data?.data; // {id,name,email,role_id}
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  async checkToken() {
    try {
      const { data } = await api.get("/auth/check-token");
      return data;
    } catch (err) {
      throw normalizeErr(err);
    }
  },

  getLocalUser() {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  },
};
