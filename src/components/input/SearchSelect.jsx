"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/**
 * SearchSelect
 * -----------
 * props:
 * - label?: ReactNode
 * - placeholder?: string                 // placeholder di tombol utama
 * - searchPlaceholder?: string           // placeholder di input cari
 * - options?: Array<{ value: any, label: string }> | string[]
 * - value?: any                          // harus sama dengan option.value
 * - onChange: (newValue) => void
 * - required?: boolean
 * - disabled?: boolean
 * - loading?: boolean
 * - emptyText?: string
 * - onSearch?: (query: string) => Promise<Array<{value,label}>> | void
 *      Jika diberikan, komponen akan memanggil onSearch (debounced) dan menampilkan hasilnya.
 */
export default function SearchSelect({
  label,
  placeholder = "Pilih…",
  searchPlaceholder = "Cari…",
  options = [],
  value,
  onChange,
  required = false,
  disabled = false,
  loading = false,
  emptyText = "Tidak ada data",
  onSearch, // optional async search
}) {
  // normalisasi opsi
  const baseOptions = useMemo(() => {
    return (options || []).map((o) =>
      typeof o === "string" ? { value: o, label: o } : o
    );
  }, [options]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [asyncItems, setAsyncItems] = useState(null); // null = pakai baseOptions
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // close on click outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // focus search input saat open
  useEffect(() => {
    if (open) {
      // reset navigasi & query
      setActiveIndex(-1);
      // kecil delay untuk memastikan DOM siap
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
      setAsyncItems(null);
    }
  }, [open]);

  // handle pencarian async (opsional) — debounced
  useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(async () => {
      try {
        const res = await onSearch(query);
        if (Array.isArray(res)) {
          setAsyncItems(
            res.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
          );
        }
      } catch (e) {
        // noop
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  const allOptions = asyncItems ?? baseOptions;

  // filter lokal jika tidak pakai onSearch
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (onSearch) return allOptions; // biarkan hasil async
    if (!q) return allOptions;
    return allOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [allOptions, query, onSearch]);

  const selected = useMemo(
    () => allOptions.find((o) => o.value === value),
    [allOptions, value]
  );

  const selectOption = (opt) => {
    onChange?.(opt?.value ?? null);
    setOpen(false);
  };

  // keyboard nav
  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      scrollActiveIntoView(1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      scrollActiveIntoView(-1);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) selectOption(filtered[activeIndex]);
    }
  };

  const scrollActiveIntoView = (dir) => {
    const list = listRef.current;
    if (!list) return;
    setTimeout(() => {
      const el = list.querySelector('[data-active="true"]');
      if (!el) return;
      const { offsetTop, offsetHeight } = el;
      const { scrollTop, clientHeight } = list;
      if (offsetTop < scrollTop) list.scrollTop = offsetTop;
      else if (offsetTop + offsetHeight > scrollTop + clientHeight)
        list.scrollTop = offsetTop - clientHeight + offsetHeight + 8 * dir;
    }, 0);
  };

  return (
    <div className="mb-4" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Trigger / Control */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`w-full border border-gray-300 rounded-lg px-4 h-12 text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:outline-none
          ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white"
          }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronUpDownIcon className="w-5 h-5 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="relative">
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-10 pl-10 pr-8 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                    aria-label="Clear"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto py-1"
              tabIndex={-1}
            >
              {loading && (
                <li className="py-3 px-4 text-sm text-gray-500">Memuat…</li>
              )}

              {!loading && filtered.length === 0 && (
                <li className="py-3 px-4 text-sm text-gray-500">{emptyText}</li>
              )}

              {!loading &&
                filtered.map((opt, i) => {
                  const isSelected = value === opt.value;
                  const isActive = i === activeIndex;
                  return (
                    <li
                      key={`${opt.value}-${i}`}
                      role="option"
                      aria-selected={isSelected}
                      data-active={isActive ? "true" : "false"}
                      className={`px-4 py-2 cursor-pointer text-sm
                        ${isActive ? "bg-blue-50" : ""}
                        ${isSelected ? "font-semibold" : ""}`}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectOption(opt)}
                    >
                      {opt.label}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
