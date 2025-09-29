// hooks/useAOSInit.js
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function useAOSInit(options = {}) {
  useEffect(() => {
    AOS.init({
      duration: 700, // durasi default
      easing: "ease-out", // easing default
      offset: 80, // jarak trigger
      once: true, // <-- penting: hanya muncul sekali
      ...options,
    });
  }, []);

  // panggil refresh kalau perlu saat konten dinamis berubah
  useEffect(() => {
    const onResize = () => AOS.refresh();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
}
