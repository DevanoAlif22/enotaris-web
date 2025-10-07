export default function useFlowPermissions(
  me,
  activity,
  { isNotary, isClient }
) {
  const isAdmin = Number(me?.role_id) === 1;
  const ownerNotarisId =
    activity?.user_notaris_id ?? activity?.notaris?.id ?? null;
  const isAdminOwner =
    isAdmin &&
    me?.id &&
    ownerNotarisId &&
    Number(me.id) === Number(ownerNotarisId);

  // izin final:
  const canManage = isNotary || isAdminOwner;
  const canEditSchedule = isNotary || isAdminOwner;
  const canUploadDraft = isNotary || isClient || isAdminOwner;
  const canDownloadDraft = true;
  const canDownloadFinal = true;
  const canViewSchedule = true;
  const canViewESignFile = true;

  // admin biasa read-only
  const readOnlyForAdmin = isAdmin && !isAdminOwner;

  return {
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
  };
}
