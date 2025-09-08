// app/project-flow/ActivityFlowPage.jsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import { activityService } from "../../services/activityService";
import { userService } from "../../services/userService";
import { showError, showSuccess } from "../../utils/toastConfig";
import LoadingOverlay from "../../components/common/LoadingOverlay";

const STEPS = [
  { id: "invite", title: "Undang Penghadap", icon: UserGroupIcon },
  { id: "respond", title: "Persetujuan Penghadap", icon: CheckCircleSolid },
  { id: "docs", title: "Pengisian Data & Dokumen", icon: DocumentTextIcon },
  { id: "draft", title: "Draft Akta", icon: DocumentTextIcon },
  { id: "schedule", title: "Penjadwalan Pembacaan", icon: CalendarDaysIcon },
  { id: "sign", title: "Tanda Tangan", icon: CheckCircleSolid },
  { id: "print", title: "Cetak Akta", icon: DocumentTextIcon },
];

// Normalisasi status BE -> FE {pending|todo|done|reject}
const normalize = (v) => {
  const s = String(v || "").toLowerCase();
  if (s === "done") return "done";
  if (s === "todo" || s === "progress") return "todo";
  if (s === "reject" || s === "rejected") return "reject";
  return "pending";
};

const mapTrackToStepStatus = (track) => ({
  invite: normalize(track?.status_invite),
  respond: normalize(track?.status_respond),
  docs: normalize(track?.status_docs),
  draft: normalize(track?.status_draft),
  schedule: normalize(track?.status_schedule),
  sign: normalize(track?.status_sign),
  print: normalize(track?.status_print),
});

export default function ActivityFlowPage() {
  const { activityId } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  // server data
  const [me, setMe] = useState(null);
  const isNotary = (me?.role_id || 0) === 3;
  const isClient = (me?.role_id || 0) === 2;

  const [activity, setActivity] = useState(null);
  const [stepStatus, setStepStatus] = useState({
    invite: "pending",
    respond: "pending",
    docs: "pending",
    draft: "pending",
    schedule: "pending",
    sign: "pending",
    print: "pending",
  });

  // expanded default
  const [expandedStep, setExpandedStep] = useState("respond");

  // modal
  const [schedule, setSchedule] = useState({ open: false, row: null });
  const [scheduleView, setScheduleView] = useState({ open: false, row: null });

  // ===== fetchers =====
  const fetchMe = useCallback(async () => {
    try {
      const res = await userService.getProfile();
      const u = res?.user || res?.data?.user || res?.data || {};
      setMe(u);
    } catch (e) {
      showError(e.message || "Gagal memuat data pengguna.");
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    if (!activityId) return;
    try {
      setIsSubmitting(true);
      const res = await activityService.detail(activityId);
      const a = res?.data || null;
      setActivity(a);
      setStepStatus(mapTrackToStepStatus(a?.track || {}));
    } catch (e) {
      showError(e.message || "Gagal memuat detail aktivitas.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activityId]);

  useEffect(() => {
    (async () => {
      await fetchMe();
    })();
  }, [fetchMe]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // ===== computed =====
  const progress = useMemo(() => {
    const total = STEPS.length;
    const done = Object.values(stepStatus).filter((s) => s === "done").length;
    return Math.round((done / total) * 100);
  }, [stepStatus]);

  const toggleStep = (stepId) => {
    if (stepStatus[stepId] === "pending") return; // pending = terkunci
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  // guard: penghadap tidak boleh mark done
  const markDone = (id) => {
    if (isClient) return;
    setStepStatus((st) => ({ ...st, [id]: "done" }));
  };

  const onMarkDocsDone = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await activityService.markDocsDone(activityId);
      showSuccess("Step dokumen berhasil ditandai selesai.");
      // perbarui UI lokal dan/atau refetch detail
      setStepStatus((st) => ({ ...st, docs: "done" }));
      fetchActivity(); // opsional kalau mau sinkron lagi ke BE
    } catch (e) {
      showError(e.message || "Gagal menandai selesai dokumen.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activityId, fetchActivity]);

  const badgeClass = (status) => {
    switch (status) {
      case "done":
        return "text-green-700 bg-green-50 border-green-200";
      case "todo":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "reject":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300"; // pending
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "done":
        return "Selesai";
      case "todo":
        return "Sedang Dikerjakan";
      case "reject":
        return "Ditolak";
      default:
        return "Terkunci";
    }
  };

  const containerClass = (status, isExpanded) => {
    if (status === "done")
      return isExpanded
        ? "bg-green-50 border-green-200"
        : "bg-white border-green-200";
    if (status === "todo")
      return isExpanded
        ? "bg-blue-50 border-blue-200"
        : "bg-white border-blue-200";
    if (status === "reject")
      return isExpanded
        ? "bg-red-50 border-red-200"
        : "bg-white border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const headerClass = (status, isExpanded) => {
    const base =
      "w-full px-6 py-4 flex items-center justify-between transition-colors";
    if (status === "pending") return `${base} cursor-not-allowed opacity-60`;

    const hover =
      status === "done"
        ? "hover:bg-green-50"
        : status === "todo"
        ? "hover:bg-blue-50"
        : "hover:bg-red-50";
    const expanded =
      isExpanded &&
      (status === "done"
        ? "bg-green-50"
        : status === "todo"
        ? "bg-blue-50"
        : "bg-red-50");

    return `${base} cursor-pointer ${hover} ${expanded || ""}`;
  };

  // ===== header parties (DINAMIS) =====
  const partyList = useMemo(
    () => (Array.isArray(activity?.clients) ? activity.clients : []),
    [activity?.clients]
  );

  // schedule modal controls (role-aware)
  const openScheduleModal = (row = activity) => {
    if (!isNotary) return;
    setSchedule({ open: true, row });
  };
  const openScheduleViewModal = (row = activity) =>
    setScheduleView({ open: true, row });

  // izin/flags untuk konten step
  const stepPermissions = useMemo(() => {
    return {
      isNotary,
      isClient,
      docs: {
        canSelectAnyParty: isNotary,
        currentUserId: me?.id || null,
      },
      draft: {
        readOnly: isClient,
      },
      schedule: {
        canEdit: isNotary,
      },
      canMarkDone: isNotary,
    };
  }, [isNotary, isClient, me?.id]);

  const header = {
    code: activity?.tracking_code || "-",
    notaris: activity?.notaris?.name || "-",
    deed_type: activity?.deed?.name || "-",
    name: activity?.name || "-",
    schedule: activity?.schedules?.[0]?.datetime || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingOverlay show={isSubmitting} />
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {header.name}
              </h1>
              <p className="text-sm text-gray-900 mt-1">
                Notaris : {header.notaris}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Jenis Akta : {header.deed_type}
              </p>
              <p className="text-sm text-gray-500 mt-1">Kode : {header.code}</p>
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

          {/* DINAMIS: grid responsif 1/2/3 kolom tergantung lebar layar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partyList.length > 0 ? (
              partyList.map((c, idx) => (
                <div
                  key={c.id}
                  className="w-full flex items-center gap-3 p-3 bg-[#edf4ff] text-[#0256c4] rounded-lg"
                >
                  <UserGroupIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">
                      {c.name || c.email || `Penghadap ${idx + 1}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Penghadap {idx + 1}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Belum ada penghadap.</div>
            )}
          </div>
        </div>

        {/* Flow Steps */}
        <div className="space-y-2">
          {STEPS.map((step, index) => {
            const status = stepStatus[step.id];
            const isExpanded = expandedStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`rounded-lg border overflow-hidden ${containerClass(
                  status,
                  isExpanded
                )}`}
              >
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className={headerClass(status, isExpanded)}
                  disabled={status === "pending"}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div className="text-sm font-mono w-4 text-gray-500">
                        {index + 1}.
                      </div>
                    </div>
                    <Icon className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {step.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getStepDescription(step.id)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeClass(
                        status
                      )}`}
                    >
                      {statusLabel(status)}
                    </span>
                    {status !== "pending" &&
                      (isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                      ))}
                  </div>
                </button>

                {/* Step Content */}
                {isExpanded && status !== "pending" && (
                  <div
                    className={`px-6 pb-6 border-t ${
                      status === "done"
                        ? "border-green-100"
                        : status === "todo"
                        ? "border-blue-100"
                        : "border-red-100"
                    }`}
                  >
                    <div className="pt-4">
                      {renderStepContent(step.id, status, {
                        // data umum
                        activity,
                        deed: activity?.deed,
                        clients: activity?.clients || [],
                        track: activity?.track,
                        // izin global
                        permissions: stepPermissions,
                        // actions
                        markDone, // no-op kalau penghadap
                        onMarkDocsDone,
                        onSchedule: () => openScheduleModal(activity), // notaris only
                        onViewSchedule: () => openScheduleViewModal(activity), // client can view
                        // context tambahan
                        currentUserId: me?.id || null,
                        activityId,
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modals */}
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
