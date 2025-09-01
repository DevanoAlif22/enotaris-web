"use client";

import { useState } from "react";
import ExtraFieldCard from "../../components/input/ExtraFieldCard";
import SearchSelect from "../../components/input/SearchSelect";
import FileInput from "../../components/input/FileInput";
import SelectInput from "../../components/input/SelectInput";
import InputField from "../../components/input/InputField";

export default function RequirementNotarisPage() {
  const [activeTab, setActiveTab] = useState("profil"); // 'profil' | 'isian'

  // ====== STATE: PROFIL PENGHADAP ======
  const [profile, setProfile] = useState({
    namaLengkap: "adam",
    email: "adam@gmail.com",
    telepon: "",
    alamat: "",
    jenisKelamin: "",
    role: "Penghadap",
    nik: "",
    npwp: "",
    fileKtp: { file: null, previewUrl: "" },
    fileKartuKeluarga: { file: null, previewUrl: "" },
    fileNpwp: { file: null, previewUrl: "" },
    fileKtpNotaris: { file: null, previewUrl: "" },
  });

  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const handleProfileSelect = ({ updateType, value }) => {
    setProfile((p) => ({ ...p, [updateType]: value }));
  };
  const handleProfileFile = ({ updateType, value }) => {
    setProfile((p) => ({ ...p, [updateType]: value }));
  };
  const jenisKelaminOptions = [
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];
  const onUpdateProfile = () => {
    console.log("Update Profile:", profile);
    alert("Profil diperbarui (mock)");
  };

  // ====== STATE: ISIAN DOKUMEN / REQUIREMENT ======
  const [form, setForm] = useState({
    nik_text: "",
    user: "",
    npwp_file: { file: null, previewUrl: "" },
    paspor_file: { file: null, previewUrl: "" },
  });

  const users = [
    { value: "Devano Alif", label: "Devano Alif" },
    { value: "Kia Yasmin", label: "Kia Yasmin" },
  ];

  const handleText = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = ({ updateType, value }) => {
    setForm((f) => ({ ...f, [updateType]: value }));
  };

  const onSave = () => {
    console.log("submit requirement", form);
    alert("Disimpan (mock)");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Pendirian PT Otak Kanan
          </h1>
          <div className="h-px bg-gray-200 mt-4" />
        </div>

        <div className="px-6">
          <SearchSelect
            placeholder="Pilih penghadap..."
            options={users}
            value={form.user}
            onChange={(v) => setForm((f) => ({ ...f, user: v }))}
            required
          />
        </div>

        {/* TAB BAR */}
        <div className="px-6">
          <div
            role="tablist"
            aria-label="Halaman Pendirian"
            className="grid grid-cols-2 gap-0 overflow-hidden border border-gray-200"
          >
            <button
              role="tab"
              aria-selected={activeTab === "profil"}
              onClick={() => setActiveTab("profil")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "profil"
                  ? "bg-[#0256c4] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Profil Penghadap
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "isian"}
              onClick={() => setActiveTab("isian")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "isian"
                  ? "bg-[#0256c4] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Isian Dokumen
            </button>
          </div>
        </div>

        {/* TAB PANELS */}
        <div className="p-6">
          {/* === TAB: PROFIL PENGHADAP === */}
          {activeTab === "profil" && (
            <div role="tabpanel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nama Lengkap"
                  name="namaLengkap"
                  value={profile.namaLengkap}
                  onChange={handleProfileInput}
                  required={true}
                />
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileInput}
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Telepon"
                  type="tel"
                  name="telepon"
                  value={profile.telepon}
                  onChange={handleProfileInput}
                  placeholder="Masukkan nomor telepon"
                />
                <SelectInput
                  labelTitle="Jenis Kelamin"
                  placeholder="Pilih jenis kelamin"
                  options={jenisKelaminOptions}
                  defaultValue={profile.jenisKelamin}
                  updateFormValue={handleProfileSelect}
                  updateType="jenisKelamin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Alamat"
                  name="alamat"
                  value={profile.alamat}
                  onChange={handleProfileInput}
                  placeholder="Masukkan alamat lengkap"
                />
                <InputField
                  label="Role"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileInput}
                  disabled={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="NIK"
                  name="nik"
                  value={profile.nik}
                  onChange={handleProfileInput}
                  placeholder="Masukkan NIK"
                  required={true}
                />
                <InputField
                  label="NPWP"
                  name="npwp"
                  value={profile.npwp}
                  onChange={handleProfileInput}
                  placeholder="Masukkan NPWP"
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex-grow h-px border-t border-dashed border-gray-300" />
                <h3 className="px-4 text-sm font-semibold text-gray-700">
                  Dokumen Pendukung
                </h3>
                <div className="flex-grow h-px border-t border-dashed border-gray-300" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput
                  labelTitle="File KTP"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={profile.fileKtp.file}
                  defaultPreviewUrl={profile.fileKtp.previewUrl}
                  updateFormValue={handleProfileFile}
                  updateType="fileKtp"
                />
                <FileInput
                  labelTitle="File Kartu Keluarga"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={profile.fileKartuKeluarga.file}
                  defaultPreviewUrl={profile.fileKartuKeluarga.previewUrl}
                  updateFormValue={handleProfileFile}
                  updateType="fileKartuKeluarga"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput
                  labelTitle="File NPWP"
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={profile.fileNpwp.file}
                  defaultPreviewUrl={profile.fileNpwp.previewUrl}
                  updateFormValue={handleProfileFile}
                  updateType="fileNpwp"
                />
                <FileInput
                  labelTitle="File KTP Notaris"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={profile.fileKtpNotaris.file}
                  defaultPreviewUrl={profile.fileKtpNotaris.previewUrl}
                  updateFormValue={handleProfileFile}
                  updateType="fileKtpNotaris"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onUpdateProfile}
                  className="bg-[#0256c4] text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium"
                >
                  Update Profil
                </button>
              </div>
            </div>
          )}

          {/* === TAB: ISIAN DOKUMEN === */}
          {activeTab === "isian" && (
            <div role="tabpanel">
              <div className="text-sm text-gray-700 mb-6">
                Upload dokumen-dokumen berikut untuk melengkapi verifikasi
                aktivitas Anda. File yang diperbolehkan: PDF, JPG, JPEG, PNG
                (maksimal 2MB per file). Dokumen akan tersimpan otomatis setelah
                diupload.
                <br />
                <span className="text-xs opacity-70 mt-2 block mb-4">
                  ※ Teks akan otomatis tersimpan 5 detik setelah Anda berhenti
                  mengetik
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExtraFieldCard
                  title="NPWP"
                  status="Menunggu"
                  type="file"
                  value={form.npwp_file}
                  onFileChange={handleFile}
                  updateKey="npwp_file"
                />

                <ExtraFieldCard
                  title="Paspor"
                  status="Menunggu"
                  type="file"
                  value={form.paspor_file}
                  onFileChange={handleFile}
                  updateKey="paspor_file"
                />

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

              <div className="flex justify-end mt-8">
                <button
                  onClick={onSave}
                  className="px-6 py-2 rounded-lg bg-[#0256c4] text-white font-semibold hover:opacity-90"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
