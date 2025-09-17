// components/deed/PdfSettingsPanel.jsx
"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  DocumentTextIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

/**
 * Props:
 * - pdfOptions: object dengan struktur { page_size, orientation, margins_mm, font_family, font_size_pt }
 * - onOptionsChange: (newOptions) => void
 * - className?: string
 */
export default function PdfSettingsPanel({
  pdfOptions,
  onOptionsChange,
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    const newOptions = { ...pdfOptions, [key]: value };
    onOptionsChange(newOptions);
  };

  const handleMarginChange = (side, value) => {
    const newMargins = {
      ...pdfOptions.margins_mm,
      [side]: parseInt(value) || 0,
    };
    handleChange("margins_mm", newMargins);
  };

  const resetToDefault = () => {
    // defaults (di resetToDefault juga tambahin)
    const defaultOptions = {
      page_size: "A4",
      orientation: "portrait",
      margins_mm: { top: 20, right: 20, bottom: 20, left: 20 },
      font_family: "times",
      font_size_pt: 12,
      show_page_numbers: false, // <—
      page_number_h_align: "right", // <— left|center|right
      page_number_v_align: "bottom", // <— top|bottom
    };

    onOptionsChange(defaultOptions);
  };

  const pageSizes = [
    { value: "A4", label: "A4 (210 × 297 mm)" },
    { value: "A3", label: "A3 (297 × 420 mm)" },
    { value: "Letter", label: "Letter (8.5 × 11 in)" },
    { value: "Legal", label: "Legal (8.5 × 14 in)" },
    { value: "Folio", label: "Folio (8.27 × 13 in)" },
  ];

  const fontFamilies = [
    { value: "times", label: "Times New Roman" },
    { value: "arial", label: "Arial" },
    { value: "helvetica", label: "Helvetica" },
    { value: "calibri", label: "Calibri" },
    { value: "georgia", label: "Georgia" },
    { value: "garamond", label: "Garamond" },
    { value: "cambria", label: "Cambria" },
  ];

  return (
    <div
      className={`border rounded-lg bg-white dark:bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#0256c4] shadow-sm ${className}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#002d6a] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <CogIcon className="w-4 h-4 text-gray-600 dark:text-[#f5fefd]" />
          <span className="font-medium text-gray-800 dark:text-[#f5fefd]">
            Pengaturan PDF
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {pdfOptions.page_size} • {pdfOptions.orientation} •{" "}
            {pdfOptions.font_size_pt}pt
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-500 dark:text-[#f5fefd]" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-[#f5fefd]" />
        )}
      </div>

      {/* Settings Panel */}
      {isExpanded && (
        <div className="border-t bg-gray-50 dark:bg-[#002d6a] dark:text-[#f5fefd]">
          <div className="p-4 space-y-6">
            {/* Paper Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <DocumentTextIcon className="w-4 h-4" />
                Pengaturan Kertas
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Page Size */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Ukuran Kertas
                  </label>
                  <select
                    value={pdfOptions.page_size}
                    onChange={(e) => handleChange("page_size", e.target.value)}
                    className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {pageSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Orientasi
                  </label>
                  <select
                    value={pdfOptions.orientation}
                    onChange={(e) =>
                      handleChange("orientation", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="portrait">Portrait (Tegak)</option>
                    <option value="landscape">Landscape (Mendatar)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <RectangleStackIcon className="w-4 h-4" />
                Margin (mm)
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(pdfOptions.margins_mm).map(([side, value]) => (
                  <div key={side} className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {side === "top"
                        ? "Atas"
                        : side === "right"
                        ? "Kanan"
                        : side === "bottom"
                        ? "Bawah"
                        : "Kiri"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={value}
                        onChange={(e) =>
                          handleMarginChange(side, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        mm
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick margin presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Preset:
                </span>
                {[
                  { label: "Sempit (10mm)", value: 10 },
                  { label: "Normal (20mm)", value: 20 },
                  { label: "Lebar (30mm)", value: 30 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() =>
                      handleChange("margins_mm", {
                        top: preset.value,
                        right: preset.value,
                        bottom: preset.value,
                        left: preset.value,
                      })
                    }
                    className="text-xs px-2 py-1 bg-white dark:bg-[#01043c] dark:hover:bg-[#002d6a] border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Pengaturan Teks
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Jenis Font
                  </label>
                  <select
                    value={pdfOptions.font_family}
                    onChange={(e) =>
                      handleChange("font_family", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Ukuran Font (pt)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={pdfOptions.font_size_pt}
                      onChange={(e) =>
                        handleChange(
                          "font_size_pt",
                          parseInt(e.target.value) || 12
                        )
                      }
                      className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      pt
                    </span>
                  </div>
                </div>
              </div>

              {/* Font size presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ukuran:
                </span>
                {[10, 11, 12, 13, 14, 16].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleChange("font_size_pt", size)}
                    className={`text-xs px-2 py-1 border rounded transition-colors ${
                      pdfOptions.font_size_pt === size
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "bg-white dark:bg-[#01043c] border-gray-200 hover:bg-gray-50 dark:hover:bg-[#002d6a]"
                    }`}
                  >
                    {size}pt
                  </button>
                ))}
              </div>

              {/* Nomor Halaman */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nomor Halaman
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!pdfOptions.show_page_numbers}
                    onChange={(e) =>
                      handleChange("show_page_numbers", e.target.checked)
                    }
                  />
                  Tampilkan nomor halaman (1, 2, 3, …)
                </label>

                {/* Posisi — muncul aktif saat checkbox dicentang */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Perataan Horizontal
                    </label>
                    <select
                      value={pdfOptions.page_number_h_align || "right"}
                      onChange={(e) =>
                        handleChange("page_number_h_align", e.target.value)
                      }
                      disabled={!pdfOptions.show_page_numbers}
                      className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="left">Kiri</option>
                      <option value="center">Tengah</option>
                      <option value="right">Kanan</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Posisi Vertikal
                    </label>
                    <select
                      value={pdfOptions.page_number_v_align || "bottom"}
                      onChange={(e) =>
                        handleChange("page_number_v_align", e.target.value)
                      }
                      disabled={!pdfOptions.show_page_numbers}
                      className="w-full px-3 py-2 text-sm border dark:bg-[#01043c] border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="top">Atas</option>
                      <option value="bottom">Bawah</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={resetToDefault}
                className="text-xs px-3 py-2 text-gray-600 dark:text-[#f5fefd] hover:text-gray-800 dark:hover:text-[#f5fefd] hover:bg-gray-100 dark:hover:bg-[#01043c] rounded transition-colors"
              >
                Reset ke Default
              </button>
              <div className="text-xs text-gray-500 dark:text-[#f5fefd]">
                Pengaturan akan diterapkan saat generate PDF
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
