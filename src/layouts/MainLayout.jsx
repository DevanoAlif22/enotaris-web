import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] ">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* area konten geser 18rem saat lg+ */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        <TopBar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="sticky top-0 z-20" // biar topbar juga nempel atas
        />
        <main className="flex flex-col min-h-screen">
          {/* konten utama isi penuh */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>

          {/* footer selalu di bawah */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
