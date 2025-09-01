import { useMemo, useState, useCallback } from "react";
import { authService } from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState(() => authService.getLocalUser());
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useMemo(() => !!user, [user]);
  const roleId = user?.role_id ?? null;

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const u = await authService.checkUser();
      const merged = { ...(user || {}), ...u };
      localStorage.setItem("auth_user", JSON.stringify(merged));
      setUser(merged);
      return merged;
    } catch {
      // token invalid
      await authService.logout();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await authService.login(payload);
      setUser(res?.data || null);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, roleId, isLoggedIn, loading, login, logout, refreshUser };
}
