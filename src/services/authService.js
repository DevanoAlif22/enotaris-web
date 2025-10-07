// src/services/authService.js
import api, { tokenStore } from "./api";

/** FE -> BE role map */
const mapRoleToId = (role) => {
  if (!role) return null;
  const r = String(role).toLowerCase();
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

  async loginWithGoogle({ accessToken, roleId, role, idToken }) {
    try {
      // tentukan role_id (prioritas: roleId angka; fallback: role string)
      const derivedRoleId =
        typeof roleId === "number" && [2, 3].includes(roleId)
          ? roleId
          : mapRoleToId(role);

      const payload = {
        access_token: accessToken || idToken, // BE expect: access_token
        ...(derivedRoleId ? { role_id: derivedRoleId } : {}), // ⬅️ penting
      };

      if (!payload.access_token) {
        throw { message: "Access token Google tidak ditemukan di FE." };
      }

      const { data } = await api.post("/auth/google/token-login", payload);

      // simpan token & user
      const token = data?.data?.token;
      tokenStore.set(token);
      localStorage.setItem("auth_user", JSON.stringify(data?.data?.user || {}));

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
      // BE balikin: { data: { id, name, email, role_id, token } }
      tokenStore.set(data?.data?.token);
      // Simpan full object agar konsisten
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
      // abaikan error logout
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
  async forgot({ email }) {
    try {
      const { data } = await api.post("/auth/forgot", { email });
      return data; // { success, message }
    } catch (err) {
      const e = normalizeErr(err);
      throw e;
    }
  },

  async resetPassword({ email, token, password, confirmPassword }) {
    try {
      const { data } = await api.post("/auth/reset", {
        email,
        token,
        password,
        password_confirmation: confirmPassword, // Laravel confirmed rule
      });
      return data;
    } catch (err) {
      const e = normalizeErr(err);
      throw e;
    }
  },

  /** Auto-heal local user: apapun bentuknya → { role_id: number, ... }  */
  getLocalUser() {
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) return null;

      let parsed = JSON.parse(raw);

      // Jika angka/string → ubah ke objek { role_id }
      if (typeof parsed === "number") {
        parsed = { role_id: parsed };
      } else if (typeof parsed === "string" && /^\d+$/.test(parsed)) {
        parsed = { role_id: Number(parsed) };
      } else if (!parsed || typeof parsed !== "object") {
        return null;
      }

      // Pastikan role_id number
      if (parsed.role_id != null) parsed.role_id = Number(parsed.role_id);

      // Tulis balik agar konsisten ke depan
      localStorage.setItem("auth_user", JSON.stringify(parsed));

      return parsed; // { id?, name?, email?, role_id }
    } catch {
      return null;
    }
  },
};
