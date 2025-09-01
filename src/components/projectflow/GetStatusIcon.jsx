import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

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

export default getStatusIcon;
