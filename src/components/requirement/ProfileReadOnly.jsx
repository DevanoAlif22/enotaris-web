// components/notary/ProfileReadOnly.jsx
import InputField from "../../components/input/InputField";
import SelectInput from "../../components/input/SelectInput";
import ReadOnlyFileBox from "../../components/input/ReadOnlyFileBox";
import { getVerifBadge } from "../../utils/verifBadge";

const JK_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function ProfileReadOnly({ profile, identity }) {
  const verifBadge = getVerifBadge(profile.statusVerification);

  return (
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
        {profile.notesVerification && (
          <span className="text-sm text-gray-500">
            ({profile.notesVerification})
          </span>
        )}
      </div>

      {/* Data user */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
        <InputField
          label={<Label>Nama Lengkap</Label>}
          name="namaLengkap"
          value={profile.namaLengkap}
          disabled
        />
        <InputField
          label={<Label>Email</Label>}
          type="email"
          name="email"
          value={profile.email}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
        <InputField
          label={<Label>Telepon</Label>}
          type="tel"
          name="telepon"
          value={profile.telepon}
          disabled
        />
        <SelectInput
          labelTitle={<Label>Jenis Kelamin</Label>}
          placeholder="Pilih jenis kelamin"
          options={JK_OPTIONS}
          defaultValue={profile.jenisKelamin}
          updateFormValue={() => {}}
          updateType="jenisKelamin"
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
        <InputField
          label={<Label>Alamat</Label>}
          name="alamat"
          value={profile.alamat}
          disabled
        />
        <InputField
          label={<Label>Kota</Label>}
          name="kota"
          value={profile.kota}
          disabled
        />
        <InputField
          label={<Label>Provinsi</Label>}
          name="provinsi"
          value={profile.provinsi}
          disabled
        />
        <InputField
          label={<Label>Kode Pos</Label>}
          name="kodepos"
          value={profile.kodepos}
          disabled
        />
        <InputField
          label={<Label>Role</Label>}
          name="role"
          value={profile.roleLabel}
          disabled
        />
      </div>

      {/* Dokumen Identitas */}
      <SectionTitle>Dokumen Identitas</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-400">
        <ReadOnlyFileBox
          labelTitle={<Label>File KTP</Label>}
          previewUrl={identity.fileKtp}
          required
        />
        <ReadOnlyFileBox
          labelTitle={<Label>File Kartu Keluarga</Label>}
          previewUrl={identity.fileKk}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 dark:text-gray-400">
        <ReadOnlyFileBox
          labelTitle={<Label>Tanda Tangan (PNG)</Label>}
          previewUrl={identity.fileSign}
          hint="PNG, maks 1MB"
          required
        />
        <ReadOnlyFileBox
          labelTitle={<Label>Foto Formal (opsional)</Label>}
          previewUrl={identity.filePhoto}
          hint="JPG/PNG, maks 2MB"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 dark:text-gray-400">
        <ReadOnlyFileBox
          labelTitle={<Label>File NPWP (opsional)</Label>}
          previewUrl={identity.fileNpwp}
        />
        {profile.roleLabel === "Notaris" && (
          <ReadOnlyFileBox
            labelTitle={<Label>File KTP Notaris</Label>}
            previewUrl={identity.fileKtpNotaris}
            required
          />
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <span className="dark:text-[#f5fefd]">{children}</span>;
}

function SectionTitle({ children }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center mb-6">
        <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
        <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
          {children}
        </h3>
        <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
      </div>
    </div>
  );
}
