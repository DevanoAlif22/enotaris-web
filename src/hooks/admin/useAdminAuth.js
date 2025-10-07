// app/notary/hooks/useAdminAuth.js
import { useEffect, useState } from "react";
import { getAuthUser } from "../../utils/authUser";

export default function useAdminAuth() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    setMe(getAuthUser() || null);
  }, []);
  const isAdmin = Number(me?.role_id) === 1;
  return { me, isAdmin };
}
