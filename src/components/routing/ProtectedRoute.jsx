// src/components/routing/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";

export default function ProtectedRoute({ allow = [] }) {
  const token = localStorage.getItem("auth_token");
  const user = authService.getLocalUser();

  if (!token || !user) return <Navigate to="/login" replace />;

  // Ekstraksi role yang robust: dukung angka/string/objek
  const role =
    typeof user === "number"
      ? user
      : typeof user === "string"
      ? Number(user)
      : Number(user?.role_id);

  if (Number.isNaN(role)) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada allow, validasi role
  if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
