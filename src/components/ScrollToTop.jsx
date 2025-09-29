// components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ behavior = "smooth" }) {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Jika pakai anchor/hash, biarkan browser ke elemen hash
    if (hash) return;

    // Scroll ke atas tiap kali pathname atau query berubah
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, search, hash, behavior]);

  return null;
}
