import React, { useState } from "react";
import FileInput from "../../components/input/FileInput"; // Sesuaikan path
import SelectInput from "../../components/input/SelectInput"; // Sesuaikan path
import InputField from "../../components/input/InputField"; // Sesuaikan path

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profil");
  const [formData, setFormData] = useState({
    namaLengkap: "adam",
    email: "adam@gmail.com",
    telepon: "",
    alamat: "",
    jenisKelamin: "",
    role: "Notaris",
    nik: "",
    npwp: "",
    fileKtp: { file: null, previewUrl: "" },
    fileKartuKeluarga: { file: null, previewUrl: "" },
    fileNpwp: { file: null, previewUrl: "" },
    fileKtpNotaris: { file: null, previewUrl: "" },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = ({ updateType, value }) => {
    setFormData((prev) => ({
      ...prev,
      [updateType]: value,
    }));
  };

  const handleFileChange = ({ updateType, value }) => {
    setFormData((prev) => ({
      ...prev,
      [updateType]: value,
    }));
  };

  const jenisKelaminOptions = [
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  const handleUpdateProfile = () => {
    // Logic untuk update profil
    console.log("Update Profile:", formData);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Tab Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-3 text-gray-800 mb-1">
            Pengaturan Profil
          </h1>
          <div className="w-full h-px bg-gray-200"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 ">
          <button
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2 text-sm font-medium transition-colors w-[50%] ${
              activeTab === "profil"
                ? "bg-[#0256c4] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={{ marginRight: "1px" }}
          >
            Profil Pengguna
          </button>
          <button
            onClick={() => setActiveTab("verifikasi")}
            className={`px-4 py-2 text-sm font-medium transition-colors w-[50%] ${
              activeTab === "verifikasi"
                ? "bg-[#0256c4] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Verifikasi Identitas
          </button>
        </div>
        {/* Profil Pengguna Tab */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Nama Lengkap"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleInputChange}
                required={true}
              />
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Telepon"
                type="tel"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                placeholder="Masukkan nomor telepon"
              />
              <SelectInput
                labelTitle="Jenis Kelamin"
                placeholder="Pilih jenis kelamin"
                options={jenisKelaminOptions}
                defaultValue={formData.jenisKelamin}
                updateFormValue={handleSelectChange}
                updateType="jenisKelamin"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap"
              />
              <InputField
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>

            {/* Update Button */}
            <div className="flex justify-end pt-6">
              <button
                onClick={handleUpdateProfile}
                className="bg-[#0256c4] text-white px-6 py-2 rounded-lg hover:bg-[#0145a3] transition-colors font-medium"
              >
                Update Profil
              </button>
            </div>
          </div>
        )}

        {/* Verifikasi Identitas Tab */}
        {activeTab === "verifikasi" && (
          <div className="space-y-6">
            {/* Status Verifikasi */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Status Verifikasi</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
                  Menunggu
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="NIK"
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                placeholder="Masukkan NIK"
                required={true}
              />
              <InputField
                label="NPWP"
                name="npwp"
                value={formData.npwp}
                onChange={handleInputChange}
                placeholder="Masukkan NPWP"
              />
            </div>

            {/* Dokumen Pendukung Section */}
            <div className="mt-8">
              <div className="mt-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
                  <h3 className="px-4 text-lg font-medium text-gray-800">
                    Dokumen Pendukung
                  </h3>
                  <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Your existing FileInput components */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput
                  labelTitle="File KTP"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={formData.fileKtp.file}
                  defaultPreviewUrl={formData.fileKtp.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKtp"
                />
                <FileInput
                  labelTitle="File Kartu Keluarga"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={formData.fileKartuKeluarga.file}
                  defaultPreviewUrl={formData.fileKartuKeluarga.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKartuKeluarga"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FileInput
                  labelTitle="File NPWP"
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={formData.fileNpwp.file}
                  defaultPreviewUrl={formData.fileNpwp.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileNpwp"
                />
                <FileInput
                  labelTitle="File KTP Notaris"
                  required={true}
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={formData.fileKtpNotaris.file}
                  defaultPreviewUrl={formData.fileKtpNotaris.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKtpNotaris"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
