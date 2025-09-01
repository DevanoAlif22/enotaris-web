import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";

// usage:
// <ProtectedRoute />  -> hanya butuh login
// <ProtectedRoute allow={[2,3]} /> -> butuh login + role_id salah satu

export default function ProtectedRoute({ allow }) {
  const token = localStorage.getItem("auth_token");
  const userRaw = authService.getLocalUser();

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allow) && allow.length > 0) {
    if (!allow.includes(userRaw?.role_id)) {
      // misal user role 2 tapi akses halaman khusus notaris (3)
      return <Navigate to="/app" replace />;
    }
  }

  return <Outlet />;
}
