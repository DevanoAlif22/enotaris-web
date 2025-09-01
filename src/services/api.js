import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false, // Sanctum personal access token: pakai Bearer, bukan cookie
});

// ---- Token storage helper ----
export const tokenStore = {
  get: () => localStorage.getItem("auth_token"),
  set: (t) => localStorage.setItem("auth_token", t),
  clear: () => localStorage.removeItem("auth_token"),
};

// ---- Request: inject Authorization ----
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response: normalize error + auto logout on 401/419 ----
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    // Laravel: 401 (unauth), 403 (forbidden), 419 (token mismatch/expired)
    if (status === 401 || status === 419) {
      tokenStore.clear();
      // optional: arahkan ke login
      // window.location.pathname !== "/login" && (window.location.href = "/login");
    }
    return Promise.reject(err);
  }
);

export default api;
