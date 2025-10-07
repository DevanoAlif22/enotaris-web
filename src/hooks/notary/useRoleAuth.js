import { useEffect, useState } from "react";
import { getAuthUser } from "../../utils/authUser";

export default function useRoleAuth() {
  const [me, setMe] = useState(null);
  useEffect(() => setMe(getAuthUser() || null), []);
  const roleId = Number(me?.role_id || 0);
  return {
    me,
    roleId,
    isAdmin: roleId === 1,
    isNotaris: roleId === 3,
  };
}
