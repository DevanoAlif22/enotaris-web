// pages/projectflow/ActivityFlowPage.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  PlusIcon,
} from "@heroicons/react/24/solid";

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
import { showSuccess } from "../../utils/toastConfig";

const STEPS = [
  {
    id: "invite",
    title: "Undang Penghadap",
    icon: UserGroupIcon,
    description: "Kirim undangan kepada para pihak.",
  },
  {
    id: "respond",
    title: "Persetujuan Penghadap",
    icon: CheckCircleSolid,
    description: "Pantau persetujuan undangan.",
  },
  {
    id: "docs",
    title: "Pengisian Data & Dokumen",
    icon: DocumentTextIcon,
    description: "Unggah/isi data & persyaratan.",
  },
  {
    id: "draft",
    title: "Draft Akta",
    icon: DocumentTextIcon,
    description: "Susun/unggah draft akta.",
  },
  {
    id: "schedule",
    title: "Penjadwalan Pembacaan",
    icon: CalendarDaysIcon,
    description: "Atur jadwal pembacaan akta.",
  },
  {
    id: "sign",
    title: "Tanda Tangan",
    icon: CheckCircleSolid,
    description: "Proses tanda tangan.",
  },
  {
    id: "print",
    title: "Cetak Akta",
    icon: DocumentTextIcon,
    description: "Finalisasi & cetak akta.",
  },
];

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

  const [expandedStep, setExpandedStep] = useState("respond");
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [scheduleView, setScheduleView] = useState({ open: false, row: null });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addReqOpen, setAddReqOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
    user: null,
    loading: false,
  });

  const { handleExtrasCreate, handleDeleteRequirement } = useRequirements({
    activity,
    fetchActivity,
    setStepStatus,
    setIsMutating,
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

  const toggleStep = (id) =>
    stepStatus[id] !== "pending" &&
    setExpandedStep(expandedStep === id ? null : id);
  const markDone = (id) =>
    !isClient && setStepStatus((st) => ({ ...st, [id]: "done" }));

  const onMarkDocsDone = async () => {
    try {
      setIsMutating(true);
      const { activityService } = await import(
        "../../services/activityService"
      );
      await activityService.markDocsDone(activityId);
      showSuccess("Step dokumen ditandai selesai.");
      setStepStatus((st) => ({ ...st, docs: "done" }));
      fetchActivity();
    } finally {
      setIsMutating(false);
    }
  };

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
            {isNotary && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:text-[#f5fefd] hover:bg-gray-50 dark:hover:bg-[#01043c]"
              >
                <PlusIcon className="w-4 h-4 dark:text-[#f5fefd]" /> Tambah
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
                  <UserGroupIcon className="w-5 h-5 text-gray-400 dark:text-[#f5fefd]" />
                  <div>
                    <div className="text-sm font-semibold dark:text-[#f5fefd]">
                      {c.name || c.email || `Penghadap ${i + 1}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      Penghadap {i + 1}
                    </div>
                  </div>
                  {isNotary && (
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
                onToggle={() => toggleStep(step.id)}
                icon={step.icon}
              >
                {renderStepContent(step.id, status, {
                  activity,
                  deed: activity?.deed,
                  clients: activity?.clients || [],
                  track: activity?.track,
                  permissions: stepPermissions,
                  markDone,
                  onMarkDocsDone,
                  onSchedule: () => setSchedule({ open: true, row: activity }),
                  onViewSchedule: () =>
                    setScheduleView({ open: true, row: activity }),
                  currentUserId: me?.id || null,
                  activityId,
                  onOpenAddRequirement: isNotary
                    ? () => setAddReqOpen(true)
                    : undefined,
                  requirementList,
                  onDeleteRequirement: isNotary
                    ? handleDeleteRequirement
                    : undefined,
                })}
              </StepItem>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal
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
          datetime:
            schedule.row?.schedules?.[0]?.datetime ??
            activity?.schedules?.[0]?.datetime ??
            header.schedule,
          place: schedule.row?.place ?? "",
          note: schedule.row?.note ?? "",
        }}
      />

      <ScheduleViewModal
        open={scheduleView.open}
        onClose={() => setScheduleView({ open: false, row: null })}
        row={scheduleView.row ?? activity}
      />

      {isNotary && (
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

      {isNotary && (
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
