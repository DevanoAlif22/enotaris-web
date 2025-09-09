export const badgeClass = (status) => {
  switch (status) {
    case "done":
      return "text-green-700 bg-green-50 border-green-200";
    case "todo":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "reject":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-300";
  }
};

export const containerClass = (status, isExpanded) => {
  if (status === "done")
    return isExpanded
      ? "bg-green-50 border-green-200"
      : "bg-white border-green-200";
  if (status === "todo")
    return isExpanded
      ? "bg-blue-50 border-blue-200"
      : "bg-white border-blue-200";
  if (status === "reject")
    return isExpanded ? "bg-red-50 border-red-200" : "bg-white border-red-200";
  return "bg-gray-50 border-gray-200";
};

export const headerClass = (status, isExpanded) => {
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
