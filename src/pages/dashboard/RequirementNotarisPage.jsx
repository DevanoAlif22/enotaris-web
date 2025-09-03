// app/notary/RequirementNotarisPage.jsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import SearchSelect from "../../components/input/SearchSelect";
import StatusBadge from "../../utils/StatusBadge";
import ExtraFieldCard from "../../components/input/ExtraFieldCard";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import InputField from "../../components/input/InputField";
import SelectInput from "../../components/input/SelectInput";
import ReadOnlyFileBox from "../../components/input/ReadOnlyFileBox";

import { documentRequirementNotarisService } from "../../services/documentRequirementNotarisService";
import { activityService } from "../../services/activityService";
import { userService } from "../../services/userService";
import { showError } from "../../utils/toastConfig";

const jenisKelaminOptions = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function RequirementNotarisPage() {
  const params = useParams();
  const activityId = params?.activityId;

  const [activeTab, setActiveTab] = useState("profil");

  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [activity, setActivity] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [docs, setDocs] = useState([]);

  // ---- Profil (read-only)
  const [profileForm, setProfileForm] = useState({
    namaLengkap: "",
    email: "",
    telepon: "",
    alamat: "",
    jenisKelamin: "",
    roleLabel: "",
    statusVerification: "",
    notesVerification: "",
  });

  // ---- Identitas (read-only)
  const [identityView, setIdentityView] = useState({
    nik: "",
    npwp: "",
    ktpNotaris: "",
    fileKtp: "",
    fileKk: "",
    fileNpwp: "",
    fileKtpNotaris: "",
    fileSign: "",
    filePhoto: "",
  });

  const deedName = activity?.deed?.name || "-";
  const title = activity?.name || "Isian Dokumen";

  // ===== FETCHERS =====
  const fetchActivity = useCallback(async () => {
    if (!activityId) return;
    try {
      setLoadingActivity(true);
      const res = await activityService.detail(activityId);
      const a = res?.data || null;
      setActivity(a);

      const cl = (Array.isArray(a?.clients) ? a.clients : []).map((c) => ({
        value: c.id,
        label: c.name ? `${c.name} (${c.email})` : c.email || `#${c.id}`,
        id: c.id,
        name: c.name,
        email: c.email,
      }));
      setClients(cl);
      if (cl.length && !selectedUserId) setSelectedUserId(cl[0].value);
    } catch (e) {
      showError(e.message || "Gagal memuat aktivitas.");
    } finally {
      setLoadingActivity(false);
    }
  }, [activityId, selectedUserId]);

  const fetchDocs = useCallback(
    async (uid) => {
      if (!activityId || !uid) return;
      try {
        setLoadingDocs(true);
        const res = await documentRequirementNotarisService.getForNotaryUser(
          activityId,
          uid
        );
        const items = Array.isArray(res?.data) ? res.data : [];
        setDocs(items);
      } catch (e) {
        showError(e.message || "Gagal memuat dokumen persyaratan.");
        setDocs([]);
      } finally {
        setLoadingDocs(false);
      }
    },
    [activityId]
  );

  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid) return;
    try {
      setLoadingProfile(true);
      // EXPECTED: { data: { user, identity } }
      const resp = await userService.getProfileById(uid);
      const u = resp?.data?.user || {};
      const idn = resp?.data?.identity || {};
      const roleLabel = u.role_id === 3 ? "Notaris" : "Penghadap";

      setProfileForm({
        namaLengkap: u.name || "",
        email: u.email || "",
        telepon: u.telepon || "",
        alamat: u.address || "",
        jenisKelamin: u.gender || "",
        roleLabel,
        statusVerification: u.status_verification || "",
        notesVerification: u.notes_verification || "",
      });

      setIdentityView({
        nik: idn.ktp || "",
        npwp: idn.npwp || "",
        ktpNotaris: idn.ktp_notaris || "",
        fileKtp: idn.file_ktp || "",
        fileKk: idn.file_kk || "",
        fileNpwp: idn.file_npwp || "",
        fileKtpNotaris: idn.file_ktp_notaris || "",
        fileSign: idn.file_sign || "",
        filePhoto: idn.file_photo || "",
      });
    } catch (e) {
      showError(e.message || "Gagal memuat profil pengguna.");
      setProfileForm({
        namaLengkap: "",
        email: "",
        telepon: "",
        alamat: "",
        jenisKelamin: "",
        roleLabel: "",
        statusVerification: "",
        notesVerification: "",
      });
      setIdentityView({
        nik: "",
        npwp: "",
        ktpNotaris: "",
        fileKtp: "",
        fileKk: "",
        fileNpwp: "",
        fileKtpNotaris: "",
        fileSign: "",
        filePhoto: "",
      });
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // initial
  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // when client changes
  useEffect(() => {
    if (!selectedUserId) return;
    fetchDocs(selectedUserId);
    fetchUserProfile(selectedUserId);
  }, [selectedUserId, fetchDocs, fetchUserProfile]);

  // ===== HANDLERS =====
  const onUpload = useCallback(
    (reqId) => async (file) => {
      try {
        await documentRequirementNotarisService.update(reqId, {
          file,
          user_id: selectedUserId,
          activity_notaris_id: activityId,
        });
        if (selectedUserId) await fetchDocs(selectedUserId);
      } catch (e) {
        showError(e.message || "Gagal mengunggah file.");
      }
    },
    [selectedUserId, activityId, fetchDocs]
  );

  const onTextSave = useCallback(
    (reqId) => async (text) => {
      try {
        await documentRequirementNotarisService.update(reqId, {
          value: text,
          user_id: selectedUserId,
          activity_notaris_id: activityId,
        });
        if (selectedUserId) await fetchDocs(selectedUserId);
      } catch (e) {
        showError(e.message || "Gagal menyimpan teks.");
      }
    },
    [selectedUserId, activityId, fetchDocs]
  );

  const userOptions = useMemo(() => clients, [clients]);
  const showLoading = loadingActivity || loadingDocs || loadingProfile;

  const verifBadge = (() => {
    const s = (profileForm.statusVerification || "").toLowerCase();
    if (["approved", "verified", "success"].includes(s))
      return { text: "Terverifikasi", cls: "bg-green-100 text-green-800" };
    if (s === "rejected")
      return { text: "Ditolak", cls: "bg-red-100 text-red-800" };
    if (s === "pending")
      return { text: "Menunggu", cls: "bg-yellow-100 text-yellow-800" };
    return { text: "Belum diverifikasi", cls: "bg-gray-100 text-gray-700" };
  })();

  return (
    <div className="p-4 sm:p-6 relative">
      <LoadingOverlay show={showLoading} />

      <div className="bg-white dark:bg-[#002d6a] rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-1">
            {title}
          </h1>
          <div className="text-sm text-gray-600">Akta: {deedName}</div>
        </div>

        {/* Picker Penghadap */}
        <div className="w-full mb-6">
          <SearchSelect
            label="Pilih Penghadap"
            placeholder="Pilih klien…"
            options={userOptions}
            value={selectedUserId}
            onChange={setSelectedUserId}
            required
          />
        </div>

        {/* Tabs */}
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
            onClick={() => setActiveTab("dokumen")}
            className={`px-4 py-2 text-sm font-medium transition-colors w-1/2 ${
              activeTab === "dokumen"
                ? "bg-[#0256c4] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Dokumen Persyaratan
          </button>
        </div>

        {/* ===== PROFIL (READ-ONLY) ===== */}
        {activeTab === "profil" && (
          <div className="space-y-6">
            {/* Status Verifikasi */}
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-[#f5fefd]">
                Status Verifikasi :
              </span>
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${verifBadge.cls}`}
              >
                {verifBadge.text}
              </span>
              {profileForm.notesVerification ? (
                <span className="text-sm text-gray-500">
                  ({profileForm.notesVerification})
                </span>
              ) : null}
            </div>
            {/* data user */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={
                  <span className="dark:text-[#f5fefd]">Nama Lengkap</span>
                }
                name="namaLengkap"
                value={profileForm.namaLengkap}
                onChange={() => {}}
                disabled
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Email</span>}
                type="email"
                name="email"
                value={profileForm.email}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={<span className="dark:text-[#f5fefd]">Telepon</span>}
                type="tel"
                name="telepon"
                value={profileForm.telepon}
                onChange={() => {}}
                disabled
              />
              <SelectInput
                labelTitle={
                  <span className="dark:text-[#f5fefd]">Jenis Kelamin</span>
                }
                placeholder="Pilih jenis kelamin"
                options={jenisKelaminOptions}
                defaultValue={profileForm.jenisKelamin}
                updateFormValue={() => {}}
                updateType="jenisKelamin"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
              <InputField
                label={<span className="dark:text-[#f5fefd]">Alamat</span>}
                name="alamat"
                value={profileForm.alamat}
                onChange={() => {}}
                disabled
              />
              <InputField
                label={<span className="dark:text-[#f5fefd]">Role</span>}
                name="role"
                value={profileForm.roleLabel}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-center mb-6">
                <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
                <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
                  Dokumen Identitas
                </h3>
                <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
              </div>

              {/* Baris 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReadOnlyFileBox
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">File KTP</span>
                  }
                  previewUrl={identityView.fileKtp}
                  required
                />
                <ReadOnlyFileBox
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      File Kartu Keluarga
                    </span>
                  }
                  previewUrl={identityView.fileKk}
                  required
                />
              </div>

              {/* Baris 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <ReadOnlyFileBox
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      Tanda Tangan (PNG)
                    </span>
                  }
                  previewUrl={identityView.fileSign}
                  hint="PNG, maks 1MB"
                  required
                />
                <ReadOnlyFileBox
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      Foto Formal (opsional)
                    </span>
                  }
                  previewUrl={identityView.filePhoto}
                  hint="JPG/PNG, maks 2MB"
                />
              </div>

              {/* Baris 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <ReadOnlyFileBox
                  labelTitle={
                    <span className="dark:text-[#f5fefd]">
                      File NPWP (opsional)
                    </span>
                  }
                  previewUrl={identityView.fileNpwp}
                />
                {profileForm.roleLabel === "Notaris" && (
                  <ReadOnlyFileBox
                    labelTitle={
                      <span className="dark:text-[#f5fefd]">
                        File KTP Notaris
                      </span>
                    }
                    previewUrl={identityView.fileKtpNotaris}
                    required
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== DOKUMEN (upload) ===== */}
        {activeTab === "dokumen" && (
          <>
            <div className="text-sm text-gray-700 dark:text-[#f5fefd] mb-6">
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
              {docs.map((d) => (
                <div key={d.id} className="relative">
                  <ExtraFieldCard
                    reqId={d.id}
                    title={d.requirement_name}
                    status={
                      d.status_approval === "approved"
                        ? "Disetujui"
                        : d.status_approval === "rejected"
                        ? "Ditolak"
                        : "Menunggu"
                    }
                    type={d.is_file_snapshot ? "file" : "text"}
                    textValue={d.value || ""}
                    onTextChange={() => {}}
                    onTextSave={onTextSave(d.id)}
                    fileValue={{ file: null, previewUrl: d.file || "" }}
                    onFileChange={() => {}}
                    onFileSave={onUpload(d.id)}
                  />
                </div>
              ))}

              {!docs.length && !loadingDocs && (
                <div className="text-sm text-gray-500">
                  Tidak ada persyaratan untuk pengguna ini.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Komponen kecil untuk preview dokumen (read-only) ---- */
function DocThumb({ label, url }) {
  const isEmpty = !url;
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      {isEmpty ? (
        <div className="w-full h-28 bg-gray-50 border rounded flex items-center justify-center text-gray-400">
          Tidak ada file
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block w-full h-28 bg-gray-50 border rounded overflow-hidden"
          title="Lihat dokumen"
        >
          <img src={url} alt={label} className="w-full h-full object-contain" />
        </a>
      )}
    </div>
  );
}
