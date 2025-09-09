// components/notary/TabBtn.jsx
export default function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 ${
        active
          ? "bg-[#0256c4] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      style={{ marginRight: "1px" }}
    >
      {children}
    </button>
  );
}
