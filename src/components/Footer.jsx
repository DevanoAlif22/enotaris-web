// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#002d6a] text-black dark:text-[#f5fefd] py-4">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} E-notaris. All rights reserved.
      </div>
    </footer>
  );
}
