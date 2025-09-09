import { useCallback, useEffect, useMemo, useState } from "react";
import { userService } from "../services/userService";
import { activityService } from "../services/activityService";
import { mapTrackToStepStatus } from "../utils/flowStatus";
import { showError } from "../utils/toastConfig";

export function useActivityData(activityId) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [me, setMe] = useState(null);
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

  const isNotary = (me?.role_id || 0) === 3;
  const isClient = (me?.role_id || 0) === 2;

  const fetchMe = useCallback(async () => {
    try {
      setMe((await userService.getProfile())?.user ?? {});
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
    fetchMe();
  }, [fetchMe]);
  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const partyList = useMemo(
    () => (Array.isArray(activity?.clients) ? activity.clients : []),
    [activity?.clients]
  );

  const requirementList = useMemo(
    () =>
      Array.isArray(activity?.deed?.requirements)
        ? activity.deed.requirements
        : [],
    [activity?.deed?.requirements]
  );

  const progress = useMemo(() => {
    const total = 7;
    const done = Object.values(stepStatus).filter((s) => s === "done").length;
    return Math.round((done / total) * 100);
  }, [stepStatus]);

  const stepPermissions = useMemo(
    () => ({
      isNotary,
      isClient,
      docs: { canSelectAnyParty: isNotary, currentUserId: me?.id || null },
      draft: { readOnly: isClient },
      schedule: { canEdit: isNotary },
      canMarkDone: isNotary,
    }),
    [isNotary, isClient, me?.id]
  );

  const header = useMemo(
    () => ({
      code: activity?.tracking_code || "-",
      notaris: activity?.notaris?.name || "-",
      deed_type: activity?.deed?.name || "-",
      name: activity?.name || "-",
      schedule: activity?.schedules?.[0]?.datetime || null,
    }),
    [activity]
  );

  return {
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
  };
}
