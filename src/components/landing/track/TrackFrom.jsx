// components/track/TrackForm.jsx
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function TrackForm({ code, setCode, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        placeholder="Mis. ACT-XXXXXX"
        className="flex-1 rounded-xl border border-[#d9e6ff] px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0256c4]"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        disabled={loading || !code.trim()}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#0256c4] to-[#002d6a] hover:opacity-95 disabled:opacity-60 transition"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
        {loading ? "Mencari…" : "Cari"}
      </button>
    </form>
  );
}
