"use client";
import { useState } from "react";
import ExtraFieldCard from "../../components/input/ExtraFieldCard";

export default function RequirementPage() {
  // contoh state; sesuaikan dengan struktur punyamu
  const [form, setForm] = useState({
    nik_text: "",
    npwp_file: { file: null, previewUrl: "" },
    paspor_file: { file: null, previewUrl: "" },
  });

  const handleText = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = ({ updateType, value }) => {
    setForm((f) => ({ ...f, [updateType]: value }));
  };

  const onSave = () => {
    // TODO: panggil API submit
    console.log("submit", form);
    alert("Disimpan (mock)");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Data Tambahan - Pendirian PT Otak Kanan
        </h1>
        <div className="h-px bg-gray-200 mb-6" />
        <div className="text-sm dark:text-[#ecfffd] mb-6">
          Upload dokumen-dokumen berikut untuk melengkapi verifikasi aktivitas
          Anda. File yang diperbolehkan: PDF, JPG, JPEG, PNG (maksimal 2MB per
          file). Dokumen akan tersimpan otomatis setelah diupload.
          <br />
          <span className="text-xs opacity-70 mt-2 block">
            ※ Teks akan otomatis tersimpan 5 detik setelah Anda berhenti
            mengetik
          </span>
        </div>

        {/* grid kartu-kartu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NPWP - FILE */}
          <ExtraFieldCard
            title="NPWP"
            status="Menunggu"
            type="file"
            value={form.npwp_file}
            onFileChange={handleFile}
            updateKey="npwp_file"
          />

          {/* Paspor - FILE */}
          <ExtraFieldCard
            title="Paspor"
            status="Menunggu"
            type="file"
            value={form.paspor_file}
            onFileChange={handleFile}
            updateKey="paspor_file"
          />

          {/* NIK - TEKS */}
          <ExtraFieldCard
            title="NIK"
            status="Menunggu"
            type="text"
            value={form.nik_text}
            onTextChange={handleText}
            updateKey="nik_text"
            textName="nik_text"
            textPlaceholder="Isi teks dokumen…"
          />
        </div>

        {/* aksi */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onSave}
            className="px-6 py-2 rounded-lg bg-[#0256c4] text-white font-semibold hover:opacity-90"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
