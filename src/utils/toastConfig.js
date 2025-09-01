// src/utils/toastConfig.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Notifikasi sukses
export const showSuccess = (message) => {
  toast.success(message || "Berhasil!", {
    position: "top-right",
    autoClose: 3000, // 3 detik
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

// Notifikasi gagal
export const showError = (message) => {
  toast.error(message || "Terjadi kesalahan!", {
    position: "top-right",
    autoClose: 4000, // 4 detik
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};
