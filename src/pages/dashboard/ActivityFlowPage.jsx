"use client";
import { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  { id: "invite", title: "Undang Penghadap", icon: UserGroupIcon },
  { id: "respond", title: "Persetujuan Penghadap", icon: CheckCircleIcon },
  { id: "docs", title: "Pengisian Data & Dokumen", icon: DocumentTextIcon },
  { id: "draft", title: "Draft Akta", icon: DocumentTextIcon },
  { id: "schedule", title: "Penjadwalan Pembacaan", icon: CalendarDaysIcon },
  { id: "sign", title: "Tanda Tangan", icon: CheckCircleIcon },
  { id: "print", title: "Cetak Akta", icon: DocumentTextIcon },
];

export default function ActivityFlowPage() {
  const activity = {
    code: "ACT-D0QVPNNI",
    deed_type: "Pendirian PT",
    party1: "devano",
    party2: "yasmin",
    overallStatus: "Menunggu",
    schedule: "2025-08-29T11:44:00.000Z",
  };

  const [stepStatus, setStepStatus] = useState({
    invite: "done",
    respond: "progress",
    docs: "todo",
    draft: "todo",
    schedule: "todo",
    sign: "todo",
    print: "todo",
  });

  const [expandedStep, setExpandedStep] = useState("respond");

  const progress = Math.round(
    (Object.values(stepStatus).filter((s) => s === "done").length /
      STEPS.length) *
      100
  );

  const toggleStep = (stepId) => {
    const status = stepStatus[stepId];
    // Only allow toggle if status is not "todo"
    if (status === "todo") return;

    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const markDone = (id) => setStepStatus((st) => ({ ...st, [id]: "done" }));

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "progress":
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case "blocked":
        return <XCircleIcon className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
        );
    }
  };

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
    if (status === "todo") {
      return "bg-gray-50 border-gray-200";
    } else if (status === "done") {
      return isExpanded
        ? "bg-green-25 border-green-200"
        : "bg-white border-green-200";
    } else if (status === "progress") {
      return isExpanded
        ? "bg-blue-25 border-blue-200"
        : "bg-white border-blue-200";
    }
    return "bg-white border-gray-200";
  };

  const getStepHeaderClass = (status, isExpanded) => {
    const baseClass =
      "w-full px-6 py-4 flex items-center justify-between transition-colors";

    if (status === "todo") {
      return `${baseClass} cursor-not-allowed opacity-60`;
    } else {
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activity.deed_type}
              </h1>
              <p className="text-sm text-gray-500 mt-1">{activity.code}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium">{activity.party1}</div>
                <div className="text-xs text-gray-500">Penghadap 1</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium">
                  {activity.party2 || "-"}
                </div>
                <div className="text-xs text-gray-500">Penghadap 2</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <ArrowRightIcon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-blue-700">
                  Persetujuan Penghadap
                </div>
                <div className="text-xs text-blue-600">Next Action</div>
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
                    {!isDisabled && (
                      <>
                        {isExpanded ? (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </>
                    )}
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
                      {renderStepContent(step.id, status, markDone)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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

function renderStepContent(stepId, status, markDone) {
  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const primaryButton = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`;
  const secondaryButton = `${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  const successButton = `${buttonClass} bg-green-100 text-green-700 hover:bg-green-200`;

  switch (stepId) {
    case "invite":
      return (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Pengiriman undangan kepada penghadap telah selesai.
            </p>
          </div>
        </div>
      );

    case "respond":
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">devano</span>
              </div>
              <span className="text-sm text-green-700">Disetujui</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">yasmin</span>
              </div>
              <span className="text-sm text-amber-700">Menunggu</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Kirim Pengingat</button>
            <button
              className={primaryButton}
              onClick={() => markDone("respond")}
            >
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    case "docs":
      return (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Data & Dokumen Penghadap 1</h4>
              <button className={secondaryButton}>Buka Form Upload</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Data & Dokumen Penghadap 2</h4>
              <button className={secondaryButton}>Buka Form Upload</button>
            </div>
          </div>
          <div className="flex gap-3">
            <button className={primaryButton} onClick={() => markDone("docs")}>
              Tandai Selesai
            </button>
          </div>
        </div>
      );
    case "draft":
      return (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Unggah atau buat draft akta untuk direview oleh para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Lihat Draft</button>
            <button className={secondaryButton}>Unggah Draft</button>
            <button className={primaryButton} onClick={() => markDone("draft")}>
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    case "schedule":
      return (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Jadwalkan sesi pembacaan akta dengan para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Lihat Jadwal</button>
            <button className={secondaryButton}>Jadwalkan</button>
            <button
              className={primaryButton}
              onClick={() => markDone("schedule")}
            >
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    case "sign":
      return (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Kelola proses tanda tangan para pihak.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Rekam Tanda Tangan</button>
            <button className={primaryButton} onClick={() => markDone("sign")}>
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    case "print":
      return (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Cetak dan arsipkan akta yang telah final.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton}>Unduh PDF Final</button>
            <button className={primaryButton} onClick={() => markDone("print")}>
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
