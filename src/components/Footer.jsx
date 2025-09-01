// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white text-black py-4">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} E-notaris. All rights reserved.
      </div>
    </footer>
  );
}
