import React, { useEffect, useMemo, useState } from "react";
import FileInput from "../../components/input/FileInput";
import SelectInput from "../../components/input/SelectInput";
import InputField from "../../components/input/InputField";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { userService } from "../../services/userService";
import { showError, showSuccess } from "../../utils/toastConfig";

// ===== Helper =====
const hasProvided = (fo) => !!(fo?.file || fo?.previewUrl);
const isDigits = (s) => /^\d+$/.test(String(s || ""));

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // state form
  const [formData, setFormData] = useState({
    // user
    namaLengkap: "",
    email: "",
    telepon: "",
    alamat: "",
    jenisKelamin: "", // male|female|lainnya
    roleLabel: "", // Notaris/Penghadap (read-only)
    fileAvatar: { file: null, previewUrl: "" },

    // identity
    nik: "",
    npwp: "",
    ktpNotaris: "",
    fileKtp: { file: null, previewUrl: "" },
    fileKartuKeluarga: { file: null, previewUrl: "" },
    fileNpwp: { file: null, previewUrl: "" },
    fileKtpNotaris: { file: null, previewUrl: "" },
    fileSign: { file: null, previewUrl: "" },
    filePhoto: { file: null, previewUrl: "" },

    // status
    statusVerification: "", // pending/approved/rejected
    notesVerification: "",
  });

  // load profile on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile();
        const u = data?.user || {};
        const idn = data?.identity || {};
        const roleLabel = (u.role_id === 3 ? "Notaris" : "Penghadap") || "";

        setFormData((prev) => ({
          ...prev,
          namaLengkap: u.name || "",
          email: u.email || "",
          telepon: u.telepon || "",
          alamat: u.address || "",
          kota: u.city || "",
          provinsi: u.province || "",
          kode_pos: u.postal_code || "",
          jenisKelamin: u.gender || "", // male|female|lainnya (sesuai BE)
          roleLabel,
          fileAvatar: { file: null, previewUrl: u.file_avatar || "" },

          nik: idn.ktp || "",
          npwp: idn.npwp || "",
          ktpNotaris: idn.ktp_notaris || "",
          fileKtp: { file: null, previewUrl: idn.file_ktp || "" },
          fileKartuKeluarga: { file: null, previewUrl: idn.file_kk || "" },
          fileNpwp: { file: null, previewUrl: idn.file_npwp || "" },
          fileKtpNotaris: {
            file: null,
            previewUrl: idn.file_ktp_notaris || "",
          },
          fileSign: { file: null, previewUrl: idn.file_sign || "" },
          filePhoto: { file: null, previewUrl: idn.file_photo || "" },

          statusVerification: u.status_verification || "",
          notesVerification: u.notes_verification || "",
        }));
      } catch (err) {
        showError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = ({ updateType, value }) => {
    setFormData((prev) => ({ ...prev, [updateType]: value }));
  };

  const handleFileChange = ({ updateType, value }) => {
    setFormData((prev) => ({ ...prev, [updateType]: value })); // value: { file, previewUrl }
  };

  // options
  const jenisKelaminOptions = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" },
    // { value: "lainnya", label: "Lainnya" },p
  ];

  // badge status
  const verifBadge = useMemo(() => {
    const s = (formData.statusVerification || "").toLowerCase();
    if (s === "approved" || s === "verified" || s === "success") {
      return { text: "Terverifikasi", cls: "bg-green-100 text-green-800" };
    }
    if (s === "rejected") {
      return { text: "Ditolak", cls: "bg-red-100 text-red-800" };
    }
    if (s === "pending") {
      return { text: "Menunggu", cls: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Belum diverifikasi", cls: "bg-gray-100 text-gray-700" };
  }, [formData.statusVerification]);

  // validasi profil
  const validateProfile = () => {
    if (!formData.namaLengkap.trim()) return "Nama wajib diisi.";
    if (!formData.alamat.trim()) return "Alamat wajib diisi.";
    if (!formData.provinsi.trim()) return "Provinsi wajib diisi.";
    if (!formData.kota.trim()) return "Kota wajib diisi.";
    if (!formData.email.trim()) return "Email wajib diisi.";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return "Format email tidak valid.";
    if (
      formData.jenisKelamin &&
      !["male", "female", "lainnya"].includes(formData.jenisKelamin)
    ) {
      return "Jenis kelamin tidak valid.";
    }
    return null;
  };

  // validasi identitas (wajib dokumen)
  const validateIdentity = () => {
    if (!formData.nik.trim()) return "NIK wajib diisi.";
    if (!isDigits(formData.nik) || formData.nik.length !== 16)
      return "NIK harus 16 digit angka.";

    // Dokumen wajib (boleh file baru ATAU sudah ada previewUrl lama)
    if (!hasProvided(formData.fileKtp)) return "File KTP wajib diunggah.";
    if (!hasProvided(formData.fileKartuKeluarga))
      return "File Kartu Keluarga wajib diunggah.";
    if (!hasProvided(formData.fileSign))
      return "Tanda tangan (PNG) wajib diunggah.";

    // Khusus Notaris → wajib KTP Notaris
    if (
      formData.roleLabel === "Notaris" &&
      !hasProvided(formData.fileKtpNotaris)
    ) {
      return "Khusus Notaris, file KTP Notaris wajib diunggah.";
    }

    // Foto formal opsional (aktifkan kalau mau wajib)
    // if (!hasProvided(formData.filePhoto)) return "Foto formal wajib diunggah.";

    return null;
  };

  // actions
  const handleUpdateProfile = async () => {
    const msg = validateProfile();
    if (msg) return showError(msg);
    try {
      setSavingProfile(true);
      console.log(formData);
      await userService.updateProfile({
        name: formData.namaLengkap,
        gender: formData.jenisKelamin || undefined,
        telepon: formData.telepon || undefined,
        address: formData.alamat || undefined,
        province: formData.provinsi || undefined,
        city: formData.kota || undefined,
        postal_code: formData.kode_pos || undefined,
        file_avatar: formData.fileAvatar?.file || undefined,
      });
      showSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else showError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateIdentity = async () => {
    const msg = validateIdentity();
    if (msg) return showError(msg);
    try {
      setSavingIdentity(true);
      await userService.updateIdentityProfile({
        ktp: formData.nik,
        npwp: formData.npwp || null,
        ktp_notaris: formData.ktpNotaris || null,
        files: {
          file_ktp: formData.fileKtp?.file || undefined,
          file_kk: formData.fileKartuKeluarga?.file || undefined,
          file_npwp: formData.fileNpwp?.file || undefined,
          file_ktp_notaris: formData.fileKtpNotaris?.file || undefined,
          file_sign: formData.fileSign?.file || undefined,
          file_photo: formData.filePhoto?.file || undefined,
        },
      });
      showSuccess(
        "Identitas berhasil diperbarui. Status verifikasi menjadi Pending."
      );
      setFormData((p) => ({ ...p, statusVerification: "pending" }));
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else showError(err.message);
    } finally {
      setSavingIdentity(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 relative">
      <LoadingOverlay show={loading || savingProfile || savingIdentity} />

      <div className="bg-white dark:bg-[#002d6a] rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-3">
            Pengaturan Profil
          </h1>
          <div className="w-full h-px bg-gray-200" />
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 ${
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
            className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 ${
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
            {/* Avatar */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput
                labelTitle="Foto Profil (opsional)"
                accept=".jpg,.jpeg,.png,.webp"
                maxSizeMB={2}
                defaultFile={formData.fileAvatar.file}
                defaultPreviewUrl={formData.fileAvatar.previewUrl}
                updateFormValue={handleFileChange}
                updateType="fileAvatar"
              />
              <div />
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={
                  <span className="dark:text-[#f5fefd]">Nama Lengkap</span>
                }
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleInputChange}
                required={true}
              />

              <InputField
                label={<span className="dark:text-[#f5fefd]">Email</span>}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={<span className="dark:text-[#f5fefd]">Telepon</span>}
                type="tel"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                placeholder="Masukkan nomor telepon"
              />
              <SelectInput
                labelTitle={
                  <span className="dark:text-[#f5fefd]">Jenis Kelamin</span>
                }
                placeholder="Pilih jenis kelamin"
                options={jenisKelaminOptions}
                defaultValue={formData.jenisKelamin}
                updateFormValue={handleSelectChange}
                updateType="jenisKelamin"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={<span className="dark:text-[#f5fefd]">Alamat</span>}
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Masukkan alamat lengkap"
                required={true}
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Provinsi</span>}
                name="provinsi"
                value={formData.provinsi}
                onChange={handleInputChange}
                placeholder="Masukkan provinsi"
                required={true}
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Kota</span>}
                name="kota"
                value={formData.kota}
                onChange={handleInputChange}
                placeholder="Masukkan kota"
                required={true}
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Kode Pos</span>}
                name="kode_pos"
                value={formData.kode_pos}
                onChange={handleInputChange}
                placeholder="Masukkan kode pos"
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Role</span>}
                name="role"
                value={formData.roleLabel}
                onChange={() => {}}
                disabled={true}
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleUpdateProfile}
                disabled={savingProfile}
                className="bg-[#0256c4] text-white px-6 py-2 rounded-lg hover:bg-[#0145a3] transition-colors font-medium disabled:opacity-60"
              >
                {savingProfile ? "Menyimpan..." : "Update Profil"}
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
                <span className="text-gray-600 dark:text-[#f5fefd]">
                  Status Verifikasi :
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${verifBadge.cls}`}
                >
                  {verifBadge.text}
                </span>
                {formData.notesVerification ? (
                  <span className="text-sm text-gray-500">
                    ({formData.notesVerification})
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={<span className="dark:text-[#f5fefd]">NIK</span>}
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                placeholder="Masukkan NIK"
                required={true}
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">NPWP</span>}
                name="npwp"
                value={formData.npwp}
                onChange={handleInputChange}
                placeholder="Masukkan NPWP"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={
                  <span className="dark:text-[#f5fefd]">
                    NIK KTP Notaris (opsional/kusus notaris wajib)
                  </span>
                }
                name="ktpNotaris"
                value={formData.ktpNotaris}
                onChange={handleInputChange}
                placeholder="Masukkan KTP Notaris (jika ada)"
              />
              <div />
            </div>

            {/* Dokumen Pendukung */}
            <div className="mt-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
                <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
                  Dokumen Pendukung
                </h3>
                <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">File KTP</span>
                  }
                  required={true}
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={2}
                  defaultFile={formData.fileKtp.file}
                  defaultPreviewUrl={formData.fileKtp.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKtp"
                />
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      File Kartu Keluarga
                    </span>
                  }
                  required={true}
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={2}
                  defaultFile={formData.fileKartuKeluarga.file}
                  defaultPreviewUrl={formData.fileKartuKeluarga.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKartuKeluarga"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      Tanda Tangan (PNG)
                    </span>
                  }
                  accept=".png"
                  required={true}
                  maxSizeMB={1}
                  defaultFile={formData.fileSign.file}
                  defaultPreviewUrl={formData.fileSign.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileSign"
                />
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      Foto Formal (opsional)
                    </span>
                  }
                  accept=".jpg,.jpeg,.png"
                  maxSizeMB={2}
                  defaultFile={formData.filePhoto.file}
                  defaultPreviewUrl={formData.filePhoto.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="filePhoto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      File NPWP (opsional)
                    </span>
                  }
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={2}
                  defaultFile={formData.fileNpwp.file}
                  defaultPreviewUrl={formData.fileNpwp.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileNpwp"
                />
                <FileInput
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      File KTP Notaris (hanya untuk notaris)
                    </span>
                  }
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={2}
                  required={formData.roleLabel === "Notaris"}
                  defaultFile={formData.fileKtpNotaris.file}
                  defaultPreviewUrl={formData.fileKtpNotaris.previewUrl}
                  updateFormValue={handleFileChange}
                  updateType="fileKtpNotaris"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleUpdateIdentity}
                disabled={savingIdentity}
                className="bg-[#0256c4] text-white px-6 py-2 rounded-lg hover:bg-[#0145a3] transition-colors font-medium disabled:opacity-60"
              >
                {savingIdentity ? "Menyimpan..." : "Update Identitas"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
