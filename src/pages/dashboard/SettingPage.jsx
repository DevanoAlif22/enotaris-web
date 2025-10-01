// pages/settings/SettingsPage.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import FileInput from "../../components/input/FileInput";
import InputField from "../../components/input/InputField";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { settingsService } from "../../services/settingService";
import { showError, showSuccess } from "../../utils/toastConfig";

// ===== Helper =====
const isUrl = (s) => !s || /^https?:\/\//i.test(String(s));
const trimOrEmpty = (s) =>
  s === undefined || s === null ? "" : String(s).trim();
const hasProvided = (fo) => !!(fo?.file || fo?.previewUrl);

const SettingPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // simpan URL server awal → untuk nentuin clear_logo/clear_favicon
  const [initialMedia, setInitialMedia] = useState({
    logo: "",
    favicon: "",
  });

  const [form, setForm] = useState({
    // media
    fileLogo: { file: null, previewUrl: "" },
    fileFavicon: { file: null, previewUrl: "" },

    // kontak & sosial
    telepon: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",

    // konten
    title_hero: "",
    desc_hero: "",
    desc_footer: "",
  });

  // load existing settings (admin)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await settingsService.get(); // { success, data }
        const s = res?.data || {};
        setForm((p) => ({
          ...p,
          fileLogo: { file: null, previewUrl: s.logo || "" },
          fileFavicon: { file: null, previewUrl: s.favicon || "" },

          telepon: s.telepon || "",
          facebook: s.facebook || "",
          instagram: s.instagram || "",
          twitter: s.twitter || "",
          linkedin: s.linkedin || "",

          title_hero: s.title_hero || "",
          desc_hero: s.desc_hero || "",
          desc_footer: s.desc_footer || "",
        }));
        setInitialMedia({
          logo: s.logo || "",
          favicon: s.favicon || "",
        });
      } catch (err) {
        showError(err.message || "Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // handlers
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = ({ updateType, value }) => {
    // updateType: "fileLogo" | "fileFavicon"
    setForm((p) => ({ ...p, [updateType]: value })); // value: { file, previewUrl }
  };

  // validasi ringan
  const validate = () => {
    // panjang title
    if (trimOrEmpty(form.title_hero).length > 200)
      return "Judul hero maksimal 200 karakter.";

    // URL sosial (opsional), tapi kalau diisi harus http/https
    const urls = [
      ["facebook", form.facebook],
      ["instagram", form.instagram],
      ["twitter", form.twitter],
      ["linkedin", form.linkedin],
    ];
    for (const [label, val] of urls) {
      if (!isUrl(trimOrEmpty(val))) {
        return `URL ${label} harus diawali http:// atau https://`;
      }
    }
    return null;
  };

  // hitung flag clear media (hapus di server) saat submit
  const flags = useMemo(() => {
    const clearLogo = !hasProvided(form.fileLogo) && Boolean(initialMedia.logo); // user hapus preview + sebelumnya ada di server
    const clearFavicon =
      !hasProvided(form.fileFavicon) && Boolean(initialMedia.favicon);
    return { clearLogo, clearFavicon };
  }, [form.fileLogo, form.fileFavicon, initialMedia]);

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) return showError(msg);

    try {
      setSaving(true);
      await settingsService.upsert({
        // text fields (kirim undefined kalau tidak mau ubah; di sini kita kirim semua)
        telepon: trimOrEmpty(form.telepon),
        facebook: trimOrEmpty(form.facebook),
        instagram: trimOrEmpty(form.instagram),
        twitter: trimOrEmpty(form.twitter),
        linkedin: trimOrEmpty(form.linkedin),

        title_hero: trimOrEmpty(form.title_hero),
        desc_hero: trimOrEmpty(form.desc_hero),
        desc_footer: trimOrEmpty(form.desc_footer),

        // files
        logoFile: form.fileLogo?.file || undefined,
        faviconFile: form.fileFavicon?.file || undefined,

        // clear
        clear_logo: flags.clearLogo,
        clear_favicon: flags.clearFavicon,
      });

      // sinkronkan state awal media setelah sukses
      setInitialMedia({
        logo: form.fileLogo?.file
          ? form.fileLogo.previewUrl || "uploaded" // label sementara; real URL akan re-fetch kalau perlu
          : flags.clearLogo
          ? ""
          : initialMedia.logo,
        favicon: form.fileFavicon?.file
          ? form.fileFavicon.previewUrl || "uploaded"
          : flags.clearFavicon
          ? ""
          : initialMedia.favicon,
      });

      showSuccess("Pengaturan berhasil disimpan.");
    } catch (err) {
      if (err?.errors) {
        const first = Object.values(err.errors)[0];
        showError(Array.isArray(first) ? first[0] : String(first));
      } else showError(err.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 relative">
      <LoadingOverlay show={loading || saving} />

      <div className="bg-white dark:bg-[#002d6a] rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-3">
            Pengaturan Situs
          </h1>
          <div className="w-full h-px bg-gray-200 dark:bg-white/10" />
        </div>

        {/* Media */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
          <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
            Media
          </h3>
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileInput
            labelTitle={
              <span className="dark:text-[#f5fefd]">Logo (opsional)</span>
            }
            accept=".jpg,.jpeg,.png,.webp"
            maxSizeMB={5}
            defaultFile={form.fileLogo.file}
            defaultPreviewUrl={form.fileLogo.previewUrl}
            updateFormValue={handleFileChange}
            updateType="fileLogo"
          />
          <FileInput
            labelTitle={
              <span className="dark:text-[#f5fefd]">Favicon (opsional)</span>
            }
            accept=".jpg,.jpeg,.png,.webp,.ico"
            maxSizeMB={2}
            defaultFile={form.fileFavicon.file}
            defaultPreviewUrl={form.fileFavicon.previewUrl}
            updateFormValue={handleFileChange}
            updateType="fileFavicon"
          />
        </div>

        {/* Kontak & Sosial */}
        <div className="flex items-center justify-center my-6">
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
          <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
            Kontak & Sosial
          </h3>
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-[#f5fefd]">
          <InputField
            label={<span className="dark:text-[#f5fefd]">Telepon</span>}
            name="telepon"
            value={form.telepon}
            onChange={handleInput}
            placeholder="Contoh: 081234567890"
          />
          <InputField
            label={<span className="dark:text-[#f5fefd]">Facebook</span>}
            name="facebook"
            value={form.facebook}
            onChange={handleInput}
            placeholder="https://facebook.com/yourpage"
          />
          <InputField
            label={<span className="dark:text-[#f5fefd]">Instagram</span>}
            name="instagram"
            value={form.instagram}
            onChange={handleInput}
            placeholder="https://instagram.com/yourprofile"
          />
          <InputField
            label={<span className="dark:text-[#f5fefd]">Twitter / X</span>}
            name="twitter"
            value={form.twitter}
            onChange={handleInput}
            placeholder="https://twitter.com/yourhandle"
          />
          <InputField
            label={<span className="dark:text-[#f5fefd]">LinkedIn</span>}
            name="linkedin"
            value={form.linkedin}
            onChange={handleInput}
            placeholder="https://www.linkedin.com/company/yourcompany"
          />
        </div>

        {/* Konten Landing */}
        <div className="flex items-center justify-center my-6">
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
          <h3 className="px-4 text-lg font-medium text-gray-800 dark:text-[#f5fefd]">
            Konten Landing
          </h3>
          <div className="flex-grow h-px border-t border-dashed border-gray-400"></div>
        </div>

        <div className="space-y-6 dark:text-[#f5fefd]">
          <InputField
            label={<span className="dark:text-[#f5fefd]">Judul Hero</span>}
            name="title_hero"
            value={form.title_hero}
            onChange={handleInput}
            placeholder="Judul besar di halaman depan"
          />

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Deskripsi Hero
            </label>
            <textarea
              name="desc_hero"
              value={form.desc_hero}
              onChange={handleInput}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none dark:bg-transparent dark:text-[#f5fefd]"
              placeholder="Deskripsi singkat pada bagian hero…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-[#f5fefd]">
              Deskripsi Footer
            </label>
            <textarea
              name="desc_footer"
              value={form.desc_footer}
              onChange={handleInput}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#0256c4]/40 outline-none dark:bg-transparent dark:text-[#f5fefd]"
              placeholder="Deskripsi di bagian footer…"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-8">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#0256c4] text-white px-6 py-2 rounded-lg hover:bg-[#0145a3] transition-colors font-medium disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
