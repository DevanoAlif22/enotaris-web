"use client";
import { useState } from "react";
import {
  CheckCircleIcon as CheckCircleSolid,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import renderStepContent from "../../components/projectflow/RenderStepContent";
import getStatusIcon from "../../components/projectflow/GetStatusIcon";
import ScheduleModal from "../../components/activitynotaris/ScheduleModal";
import ScheduleViewModal from "../../components/activitynotarisclient/ScheduleViewModal";

const STEPS = [
  { id: "invite", title: "Undang Penghadap", icon: UserGroupIcon },
  { id: "respond", title: "Persetujuan Penghadap", icon: CheckCircleSolid },
  { id: "docs", title: "Pengisian Data & Dokumen", icon: DocumentTextIcon },
  { id: "draft", title: "Draft Akta", icon: DocumentTextIcon },
  { id: "schedule", title: "Penjadwalan Pembacaan", icon: CalendarDaysIcon },
  { id: "sign", title: "Tanda Tangan", icon: CheckCircleSolid },
  { id: "print", title: "Cetak Akta", icon: DocumentTextIcon },
];

export default function ActivityFlowPage() {
  const activity = {
    code: "ACT-D0QVPNNI",
    notaris: "Pak Wahyu Prasetyo",
    deed_type: "Pendirian PT",
    name: "Pendirian PT Otak Kanan",
    party1: "devano",
    party2: "yasmin",
    overallStatus: "Menunggu",
    schedule: "2025-08-29T11:44:00.000Z",
  };

  const [stepStatus, setStepStatus] = useState({
    invite: "done",
    respond: "done",
    docs: "done",
    draft: "done",
    schedule: "done",
    sign: "done",
    print: "done",
  });
  const [expandedStep, setExpandedStep] = useState("respond");

  const progress = Math.round(
    (Object.values(stepStatus).filter((s) => s === "done").length /
      STEPS.length) *
      100
  );

  const toggleStep = (stepId) => {
    const status = stepStatus[stepId];
    if (status === "todo") return;
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const markDone = (id) => setStepStatus((st) => ({ ...st, [id]: "done" }));

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "text-green-700 bg-green-50 border-green-200";
      case "progress":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "blocked":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-gray-500 bg-gray-100 border-gray-300";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "done":
        return "Selesai";
      case "progress":
        return "Berlangsung";
      case "blocked":
        return "Tertahan";
      default:
        return "Belum";
    }
  };

  const getStepBackgroundClass = (status, isExpanded) => {
    if (status === "todo") return "bg-gray-50 border-gray-200";
    if (status === "done")
      return isExpanded
        ? "bg-green-50 border-green-200"
        : "bg-white border-green-200";
    if (status === "progress")
      return isExpanded
        ? "bg-blue-50 border-blue-200"
        : "bg-white border-blue-200";
    return "bg-white border-gray-200";
  };

  const getStepHeaderClass = (status, isExpanded) => {
    const baseClass =
      "w-full px-6 py-4 flex items-center justify-between transition-colors";
    if (status === "todo") return `${baseClass} cursor-not-allowed opacity-60`;

    const hoverClass =
      status === "done"
        ? "hover:bg-green-50"
        : status === "progress"
        ? "hover:bg-blue-50"
        : "hover:bg-gray-50";

    const expandedClass = isExpanded
      ? status === "done"
        ? "bg-green-50"
        : status === "progress"
        ? "bg-blue-50"
        : "bg-gray-50"
      : "";

    return `${baseClass} cursor-pointer ${hoverClass} ${expandedClass}`;
  };

  // ====== MODAL SCHEDULE STATE & HANDLER ======
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const openScheduleModal = (row = activity) => {
    setSchedule({ open: true, row });
  };

  const [scheduleView, setScheduleView] = useState({ open: false, row: null });
  const openScheduleViewModal = (row = activity) =>
    setScheduleView({ open: true, row });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activity.name}
              </h1>
              <p className="text-sm text-gray-900 mt-1">
                Notaris : {activity.notaris}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Jenis Akta : {activity.deed_type}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Kode : {activity.code}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-800 mt-1 mb-3">Penghadap :</p>
          <div className="flex gap-4">
            <div className="w-full flex items-center gap-3 p-3 bg-[#edf4ff] text-[#0256c4] rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium">{activity.party1}</div>
                <div className="text-xs text-gray-500">Penghadap 1</div>
              </div>
            </div>
            <div className="w-full flex items-center gap-3 p-3 bg-[#edf4ff] text-[#0256c4] rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium">
                  {activity.party2 || "-"}
                </div>
                <div className="text-xs text-gray-500">Penghadap 2</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Steps */}
        <div className="space-y-2">
          {STEPS.map((step, index) => {
            const status = stepStatus[step.id];
            const isExpanded = expandedStep === step.id;
            const Icon = step.icon;
            const isDisabled = status === "todo";

            return (
              <div
                key={step.id}
                className={`rounded-lg border overflow-hidden ${getStepBackgroundClass(
                  status,
                  isExpanded
                )}`}
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  disabled={isDisabled}
                  className={getStepHeaderClass(status, isExpanded)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div
                        className={`text-sm font-mono w-4 ${
                          isDisabled ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {index + 1}.
                      </div>
                    </div>
                    <Icon
                      className={`w-5 h-5 ${
                        isDisabled ? "text-gray-300" : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-medium ${
                          isDisabled ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div
                        className={`text-sm ${
                          isDisabled ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {getStepDescription(step.id)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>
                    {!isDisabled &&
                      (isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      ))}
                  </div>
                </button>

                {/* Step Content */}
                {isExpanded && !isDisabled && (
                  <div
                    className={`px-6 pb-6 border-t ${
                      status === "done"
                        ? "border-green-100"
                        : status === "progress"
                        ? "border-blue-100"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="pt-4">
                      {renderStepContent(step.id, status, {
                        markDone,
                        onSchedule: () => openScheduleModal(activity),
                        onViewSchedule: () => openScheduleViewModal(activity),
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== Schedule Modal ====== */}
      <ScheduleModal
        open={schedule.open}
        onClose={() => setSchedule({ open: false, row: null })}
        activity={{
          code: schedule.row?.code ?? activity.code,
          deed_type: schedule.row?.deed_type ?? activity.deed_type,
          party1: schedule.row?.party1 ?? activity.party1,
          party2: schedule.row?.party2 ?? activity.party2,
        }}
        initial={{
          datetime: schedule.row?.schedule ?? activity.schedule,
          place: schedule.row?.place ?? "",
          note: schedule.row?.note ?? "",
        }}
      />

      <ScheduleViewModal
        open={scheduleView.open}
        onClose={() => setScheduleView({ open: false, row: null })}
        row={scheduleView.row ?? activity}
      />
    </div>
  );
}

function getStepDescription(id) {
  const descriptions = {
    invite:
      "Kirim undangan kepada para pihak untuk bergabung pada aktivitas akta.",
    respond:
      "Pantau dan kelola persetujuan undangan dari masing-masing penghadap.",
    docs: "Unggah dokumen dan isi data yang diperlukan sesuai jenis akta.",
    draft: "Susun/unggah draft akta untuk direview.",
    schedule: "Atur jadwal pembacaan akta bersama para pihak.",
    sign: "Proses tanda tangan para pihak saat jadwal pembacaan.",
    print: "Finalisasi dan cetak akta untuk arsip.",
  };
  return descriptions[id];
}
