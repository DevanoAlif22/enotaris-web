// src/layouts/AuthLayout.jsx
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white  rounded-lg shadow-lg w-full max-w-[1000px]">
        <Outlet />
      </div>
    </div>
  );
}
