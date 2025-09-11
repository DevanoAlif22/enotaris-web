// pages/notary/RequirementNotarisPage.jsx
"use client";
import { useParams } from "react-router-dom";

import LoadingOverlay from "../../components/common/LoadingOverlay";
import SearchSelect from "../../components/input/SearchSelect";
import TabBtn from "../../components/requirement/TabBtn";
import ProfileReadOnly from "../../components/requirement/ProfileReadOnly";
import DocsList from "../../components/requirement/DocsList";

import { useNotaryRequirements } from "../../hooks/useNotaryRequirements";

export default function RequirementNotarisPage() {
  const { activityId } = useParams();
  const {
    activeTab,
    setActiveTab,
    selectedUserId,
    setSelectedUserId,
    docs,
    profile,
    identity,
    loading,
    title,
    deedName,
    userOptions,
    onUpload,
    onTextSave,
  } = useNotaryRequirements(activityId);

  return (
    <div className="p-4 sm:p-6 relative">
      <LoadingOverlay show={loading} />

      <div className="bg-white dark:bg-[#002d6a] rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-[#f5fefd] mb-1">
            {title}
          </h1>
          <div className="text-sm text-gray-600 dark:text-[#f5fefd]">
            Akta: {deedName}
          </div>
        </div>

        {/* Picker Penghadap */}
        <div className="w-full mb-6 dark:text-[#f5fefd]">
          <SearchSelect
            label={<span className="dark:text-gray-300">Pilih Penghadap</span>}
            placeholder="Pilih klien…"
            options={userOptions}
            value={selectedUserId}
            onChange={setSelectedUserId}
            required
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <TabBtn
            active={activeTab === "profil"}
            onClick={() => setActiveTab("profil")}
          >
            Profil Pengguna
          </TabBtn>
          <TabBtn
            active={activeTab === "dokumen"}
            onClick={() => setActiveTab("dokumen")}
          >
            Dokumen Persyaratan
          </TabBtn>
        </div>

        {activeTab === "profil" ? (
          <ProfileReadOnly profile={profile} identity={identity} />
        ) : (
          <DocsList docs={docs} onUpload={onUpload} onTextSave={onTextSave} />
        )}
      </div>
    </div>
  );
}
