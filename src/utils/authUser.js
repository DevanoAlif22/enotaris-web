// utils/authUser.js
export function getAuthUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.log(e);
    return null;
  }
}
