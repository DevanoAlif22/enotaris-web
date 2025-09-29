// components/CategoryFilterBar.jsx
import { useMemo } from "react";

export default function CategoryFilterBar({
  categories = [], // ["Informasi", "Tutorial", ...]
  selected = [], // ["Informasi"]
  onChange = () => {}, // (nextSelected: string[]) => void
  className = "",
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (cat) => {
    const next = new Set(selectedSet);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange([...categories]);

  return (
    <div className={`w-full ${className}`}>
      {/* Bar (scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {/* Actions kiri: Reset & Semua */}
        <button
          type="button"
          onClick={clearAll}
          className="shrink-0 px-3 py-2 text-sm rounded-xl border border-[#d9e6ff] text-[#0256c4] hover:bg-[#f3f7ff] transition"
          aria-label="Hapus semua filter"
          title="Hapus semua filter"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={selectAll}
          className="shrink-0 px-3 py-2 text-sm rounded-xl border border-[#d9e6ff] text-[#0256c4] hover:bg-[#f3f7ff] transition"
          aria-label="Pilih semua kategori"
          title="Pilih semua kategori"
        >
          Pilih Semua
        </button>

        {/* Chips */}
        {categories.map((cat) => {
          const active = selectedSet.has(cat);
          return (
            <label
              key={cat}
              className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full border transition cursor-pointer select-none
                ${
                  active
                    ? "border-transparent text-white bg-gradient-to-r from-[#0256c4] to-[#002d6a] shadow"
                    : "border-[#d9e6ff] text-[#0f1d3b] bg-white hover:bg-[#f7faff]"
                }
              `}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(cat)}
                className="peer sr-only"
                aria-label={`Filter kategori ${cat}`}
              />
              <span className="text-sm font-semibold">{cat}</span>
              {/* indikator kecil saat aktif */}
              {active && <span className="w-2 h-2 rounded-full bg-white/90" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}
