// src/pages/projectflow/ActivityFlowPage.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { STEPS } from "../../constants/flowSteps";

import { useActivityData } from "../../hooks/useActivityData";
import { useRequirements } from "../../hooks/useRequirements";
import { useParties } from "../../hooks/useParties";

import StepItem from "../../components/projectflow/StepItem";
import renderStepContent from "../../components/projectflow/RenderStepContent";
import ScheduleModal from "../../components/activitynotaris/ScheduleModal";
import ScheduleViewModal from "../../components/activitynotarisclient/ScheduleViewModal";
import AddPartyModal from "../../components/activitynotaris/AddPartyModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DeedExtraFieldsModal from "../../components/deed/DeedExtraFieldsModal";
import LoadingOverlay from "../../components/common/LoadingOverlay";

import useFlowPermissions from "../../hooks/projectflow/useFlowPermissions";
import useFlowSchedule from "../../hooks/projectflow/useFlowSchedule";
import useFlowDraft from "../../hooks/projectflow/useFlowDraft";
import useFlowUI from "../../hooks/projectflow/useFlowUI";
import { localDateTimeToISO } from "../../utils/dateTime";

export default function ActivityFlowPage() {
  const { activityId } = useParams();

  const {
    isSubmitting,
    isMutating,
    setIsMutating,
    me,
    isNotary,
    isClient,
    activity,
    stepStatus,
    setStepStatus,
    partyList,
    requirementList,
    progress,
    stepPermissions,
    header,
    fetchActivity,
  } = useActivityData(activityId);

  // ===== Permissions (admin/notaris) =====
  const {
    isAdmin,
    isAdminOwner,
    canManage,
    canEditSchedule,
    canUploadDraft,
    canDownloadDraft,
    canDownloadFinal,
    canViewSchedule,
    canViewESignFile,
    readOnlyForAdmin,
  } = useFlowPermissions(me, activity, { isNotary, isClient });

  // Admin monitoring mode: admin yang bukan owner ⇒ hanya lihat/monitor
  const isAdminMonitoring = isAdmin && !isAdminOwner;

  // ===== UI (expand + mark done) =====
  const {
    expandedStep,
    // setExpandedStep,
    toggleStep,
    markDone,
    onMarkDocsDone,
  } = useFlowUI({
    activityId,
    isAdmin,
    isAdminOwner,
    setIsMutating,
    setStepStatus,
    fetchActivity,
  });

  // ===== Requirements =====
  const { handleExtrasCreate, handleDeleteRequirement } = useRequirements({
    activity,
    fetchActivity,
    setStepStatus,
    setIsMutating,
  });

  // ===== Parties =====
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
    user: null,
    loading: false,
  });
  const { handleConfirmAdd, doRemove, addOptions, loadingClients } = useParties(
    {
      activityId,
      fetchActivity,
      setIsMutating,
      setAddModalOpen,
      setRemoveConfirm,
      partyList,
      addModalOpen,
    }
  );

  // ===== Draft logic =====
  const {
    draftApprovals,
    myDraftStatus,
    onApproveDraft,
    onRejectDraft,
    onUploadDraft,
  } = useFlowDraft({
    activity,
    me,
    isNotary,
    isClient,
    isAdmin,
    isAdminOwner,
    fetchActivity,
    setIsMutating,
    setStepStatus,
  });

  // ===== Schedule logic =====
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [scheduleView, setScheduleView] = useState({ open: false, row: null });
  const { handleScheduleSave, handleScheduleDelete } = useFlowSchedule({
    activity,
    fetchActivity,
    setIsMutating,
    canEditSchedule,
  });

  // ===== Deed extras modal =====
  const [addReqOpen, setAddReqOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#002d6a]">
      <LoadingOverlay show={isSubmitting || isMutating} />

      {/* Header */}
      <div className="mx-auto p-6">
        <div className="bg-white dark:bg-[#002d6a] rounded-lg border dark:border-[#f5fefd] border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#f5fefd]">
                {header.name}
              </h1>
              <p className="text-sm text-gray-900 mt-1 dark:text-[#f5fefd]">
                Notaris : {header.notaris}
              </p>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                Jenis Akta : {header.deed_type}
              </p>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                Kode : {header.code}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-[#f5fefd]">
                Progress
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-[#f5fefd]">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Penghadap */}
          <div className="flex items-center justify-between gap-3 mt-1 mb-3">
            <p className="text-sm text-gray-800 dark:text-[#f5fefd]">
              Penghadap :
            </p>
            {!isAdminMonitoring && canManage && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]"
              >
                + Tambah
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partyList.length ? (
              partyList.map((c, i) => (
                <div
                  key={c.id}
                  className="relative w-full flex items-center gap-3 p-3 bg-[#edf4ff] dark:bg-gradient-to-r from-blue-500 to-[#0256c4] text-[#0256c4] rounded-lg"
                >
                  <div>
                    <div className="text-sm font-semibold dark:text-[#f5fefd]">
                      {c.name || c.email || `Penghadap ${i + 1}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      Penghadap {i + 1}
                    </div>
                  </div>
                  {!isAdminMonitoring && canManage && (
                    <button
                      type="button"
                      onClick={() =>
                        setRemoveConfirm({
                          open: true,
                          user: c,
                          loading: false,
                        })
                      }
                      className="ml-auto text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Belum ada penghadap.
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, idx) => {
            const status = stepStatus[step.id];
            const isExpanded = expandedStep === step.id;
            return (
              <StepItem
                key={step.id}
                step={step}
                index={idx}
                status={status}
                isExpanded={isExpanded}
                onToggle={() => toggleStep(step.id, stepStatus)}
                icon={step.icon}
              >
                {renderStepContent(step.id, status, {
                  activity,
                  deed: activity?.deed,
                  draftApprovals,
                  clients: activity?.clients || [],
                  track: activity?.track,

                  // Flag untuk kontrol UI di RenderStepContent
                  isAdminMonitoring,

                  permissions: {
                    ...stepPermissions,
                    // Matikan semua aksi bila monitoring
                    canManageParties: isAdminMonitoring ? false : canManage,
                    canOpenAddRequirement: isAdminMonitoring
                      ? false
                      : canManage,
                    canDeleteRequirement: isAdminMonitoring ? false : canManage,
                    canEditSchedule: isAdminMonitoring
                      ? false
                      : canEditSchedule,
                    canViewSchedule: isAdminMonitoring
                      ? false
                      : canViewSchedule,
                    canUploadDraft: isAdminMonitoring ? false : canUploadDraft,
                    canDownloadDraft: isAdminMonitoring
                      ? false
                      : canDownloadDraft,
                    canViewESignFile: isAdminMonitoring
                      ? false
                      : canViewESignFile,
                    canDownloadFinal: isAdminMonitoring
                      ? false
                      : canDownloadFinal,
                  },

                  markDone: readOnlyForAdmin ? undefined : markDone,
                  onMarkDocsDone: readOnlyForAdmin ? undefined : onMarkDocsDone,

                  onSchedule:
                    !isAdminMonitoring && canEditSchedule
                      ? () => setSchedule({ open: true, row: activity })
                      : undefined,
                  onViewSchedule:
                    !isAdminMonitoring && canViewSchedule
                      ? () => setScheduleView({ open: true, row: activity })
                      : undefined,

                  currentUserId: me?.id || null,
                  activityId,

                  onOpenAddRequirement:
                    !isAdminMonitoring && canManage
                      ? () => setAddReqOpen(true)
                      : undefined,
                  requirementList,
                  onDeleteRequirement:
                    !isAdminMonitoring && canManage
                      ? handleDeleteRequirement
                      : undefined,

                  isNotary: (isNotary || isAdminOwner) && !isAdminMonitoring,
                  isClient: (!isAdmin || isAdminOwner) && isClient,
                  myDraftStatus,
                  onApproveDraft: isAdminMonitoring
                    ? undefined
                    : readOnlyForAdmin
                    ? undefined
                    : onApproveDraft,
                  onRejectDraft: isAdminMonitoring
                    ? undefined
                    : readOnlyForAdmin
                    ? undefined
                    : onRejectDraft,
                  onUploadDraft:
                    !isAdminMonitoring && canUploadDraft
                      ? onUploadDraft
                      : undefined,

                  onOpenSignPage: () => {
                    if (!isAdminMonitoring) {
                      window.location.href = `/app/project-flow/${activity?.id}/sign`;
                    }
                  },
                })}
              </StepItem>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal
        key={activity?.schedules?.[0]?.id || "new-schedule"}
        open={schedule.open}
        onClose={() => setSchedule({ open: false, row: null })}
        activity={{
          code: schedule.row?.tracking_code ?? header.code,
          deed_type: header.deed_type,
          parties: (activity?.clients || []).map(
            (c, i) => c.name || c.email || `Penghadap ${i + 1}`
          ),
        }}
        initial={{
          id: activity?.schedules?.[0]?.id,
          datetime: localDateTimeToISO(
            activity?.schedules?.[0]?.date?.slice(0, 10),
            activity?.schedules?.[0]?.time
          ),
          place: activity?.schedules?.[0]?.location ?? "",
          note: activity?.schedules?.[0]?.notes ?? "",
        }}
        onSave={
          !isAdminMonitoring && canEditSchedule ? handleScheduleSave : undefined
        }
        onDelete={
          !isAdminMonitoring && canEditSchedule
            ? handleScheduleDelete
            : undefined
        }
      />

      <ScheduleViewModal
        open={scheduleView.open}
        onClose={() => setScheduleView({ open: false, row: null })}
        row={scheduleView.row ?? activity}
      />

      {!isAdminMonitoring && canManage && (
        <AddPartyModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          options={addOptions}
          loading={loadingClients}
          onConfirm={handleConfirmAdd}
        />
      )}

      <ConfirmDeleteModal
        open={removeConfirm.open}
        onClose={() =>
          setRemoveConfirm({ open: false, user: null, loading: false })
        }
        onConfirm={() => doRemove(removeConfirm.user)}
        itemName={
          removeConfirm.user
            ? removeConfirm.user.name || removeConfirm.user.email
            : ""
        }
        loading={removeConfirm.loading}
      />

      {!isAdminMonitoring && canManage && (
        <DeedExtraFieldsModal
          open={addReqOpen}
          onClose={() => setAddReqOpen(false)}
          activity={{ id: activity?.id, name: activity?.name }}
          onSubmit={({ name, input_type }) =>
            handleExtrasCreate({
              activity_id: activity?.id,
              name,
              is_file: input_type === "file",
            })
          }
        />
      )}
    </div>
  );
}
