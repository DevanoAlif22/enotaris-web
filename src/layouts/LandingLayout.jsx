// src/layouts/MainLayout.jsx
import { Outlet } from "react-router";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { SettingsProvider } from "../contexts/SettingContext";

export default function Landing() {
  return (
    <SettingsProvider>
      <div className="w-full min-h-screen bg-primary">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </SettingsProvider>
  );
}
