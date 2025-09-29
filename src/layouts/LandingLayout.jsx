// src/layouts/MainLayout.jsx
import { Outlet } from "react-router";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-primary">
      <Navbar />
      <main className="">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
