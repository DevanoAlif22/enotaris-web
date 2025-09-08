// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

export default function MainLayout({ onToggleTheme, theme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary dark:bg-[#01043c] transition-colors duration-300">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        theme={theme} 
      />

      {/* Main content area with sidebar offset */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* TopBar with theme props */}
        <TopBar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        
        <main className="flex flex-col min-h-screen">
          {/* Main content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <Footer theme={theme} />
        </main>
      </div>
    </div>
  );
}