// hooks/useNotaryRequirements.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { activityService } from "../services/activityService";
import { userService } from "../services/userService";
import { documentRequirementNotarisService } from "../services/documentRequirementNotarisService";
import { showError } from "../utils/toastConfig";

export function useNotaryRequirements(activityId) {
  // UI/tab & selection
  const [activeTab, setActiveTab] = useState("profil");
  const [selectedUserId, setSelectedUserId] = useState(null);

  // data utama
  const [activity, setActivity] = useState(null);
  const [clients, setClients] = useState([]);
  const [docs, setDocs] = useState([]);

  // profil & identitas (read-only)
  const [profile, setProfile] = useState({
    namaLengkap: "",
    email: "",
    telepon: "",
    alamat: "",
    jenisKelamin: "",
    roleLabel: "",
    statusVerification: "",
    notesVerification: "",
  });
  const [identity, setIdentity] = useState({
    fileKtp: "",
    fileKk: "",
    fileNpwp: "",
    fileKtpNotaris: "",
    fileSign: "",
    filePhoto: "",
  });

  // loading gabungan
  const [loading, setLoading] = useState(false);

  const deedName = activity?.deed?.name || "-";
  const title = activity?.name || "Isian Dokumen";

  const userOptions = useMemo(() => clients, [clients]);

  // ========== FETCHERS ==========
  const loadActivity = useCallback(async () => {
    if (!activityId) return;
    try {
      setLoading(true);
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
      if (cl.length) setSelectedUserId((prev) => prev ?? cl[0].value);
    } catch (e) {
      showError(e.message || "Gagal memuat aktivitas.");
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  const loadForUser = useCallback(
    async (uid) => {
      if (!activityId || !uid) return;
      try {
        setLoading(true);
        const [docRes, profRes] = await Promise.all([
          documentRequirementNotarisService.getForNotaryUser(activityId, uid),
          userService.getProfileById(uid),
        ]);

        setDocs(Array.isArray(docRes?.data) ? docRes.data : []);

        const u = profRes?.data?.user || {};
        const idn = profRes?.data?.identity || {};
        setProfile({
          namaLengkap: u.name || "",
          email: u.email || "",
          telepon: u.telepon || "",
          alamat: u.address || "",
          jenisKelamin: u.gender || "",
          roleLabel: u.role_id === 3 ? "Notaris" : "Penghadap",
          statusVerification: u.status_verification || "",
          notesVerification: u.notes_verification || "",
        });
        setIdentity({
          fileKtp: idn.file_ktp || "",
          fileKk: idn.file_kk || "",
          fileNpwp: idn.file_npwp || "",
          fileKtpNotaris: idn.file_ktp_notaris || "",
          fileSign: idn.file_sign || "",
          filePhoto: idn.file_photo || "",
        });
      } catch (e) {
        showError(e.message || "Gagal memuat data pengguna.");
        setDocs([]);
        setProfile({
          namaLengkap: "",
          email: "",
          telepon: "",
          alamat: "",
          jenisKelamin: "",
          roleLabel: "",
          statusVerification: "",
          notesVerification: "",
        });
        setIdentity({
          fileKtp: "",
          fileKk: "",
          fileNpwp: "",
          fileKtpNotaris: "",
          fileSign: "",
          filePhoto: "",
        });
      } finally {
        setLoading(false);
      }
    },
    [activityId]
  );

  // init & perubahan user
  useEffect(() => {
    loadActivity();
  }, [loadActivity]);
  useEffect(() => {
    if (selectedUserId) loadForUser(selectedUserId);
  }, [selectedUserId, loadForUser]);

  // ========== HANDLERS ==========
  const onUpload = useCallback(
    (reqId) => async (file) => {
      try {
        await documentRequirementNotarisService.update(reqId, {
          file,
          user_id: selectedUserId,
          activity_notaris_id: activityId,
        });
        await loadForUser(selectedUserId);
      } catch (e) {
        showError(e.message || "Gagal mengunggah file.");
      }
    },
    [selectedUserId, activityId, loadForUser]
  );

  const onTextSave = useCallback(
    (reqId) => async (text) => {
      try {
        await documentRequirementNotarisService.update(reqId, {
          value: text,
          user_id: selectedUserId,
          activity_notaris_id: activityId,
        });
        await loadForUser(selectedUserId);
      } catch (e) {
        showError(e.message || "Gagal menyimpan teks.");
      }
    },
    [selectedUserId, activityId, loadForUser]
  );

  return {
    // state
    activeTab,
    setActiveTab,
    selectedUserId,
    setSelectedUserId,
    activity,
    clients,
    docs,
    profile,
    identity,
    loading,
    title,
    deedName,
    userOptions,
    // actions
    onUpload,
    onTextSave,
  };
}
