import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  badgeClass,
  containerClass,
  headerClass,
} from "../../utils/project/flowUiClasses";
import { statusLabel } from "../../utils/project/flowStatus";
import getStatusIcon from "./GetStatusIcon";

export default function StepItem({
  step,
  index,
  status,
  isExpanded,
  onToggle,
  icon: Icon,
  children,
}) {
  return (
    <div
      className={`rounded-lg border dark:bg-[#002d6a] overflow-hidden ${containerClass(
        status,
        isExpanded
      )}`}
    >
      <button
        onClick={onToggle}
        className={headerClass(status, isExpanded)}
        disabled={status === "pending"}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(status)}
            <div className="text-sm font-mono w-4 text-gray-500 dark:text-[#f5fefd]">
              {index + 1}.
            </div>
          </div>
          <Icon className="w-5 h-5 text-gray-400 dark:text-[#f5fefd]" />
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-[#f5fefd]">
              {step.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {step.description}
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
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
