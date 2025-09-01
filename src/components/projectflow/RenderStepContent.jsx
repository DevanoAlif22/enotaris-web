import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function renderStepContent(stepId, status, actions = {}) {
  const { markDone, onSchedule, onViewSchedule } = actions; // ⬅️ tambahkan onViewSchedule

  const buttonClass = "px-4 py-2 rounded-lg font-medium transition-colors";
  const primaryButton = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`;
  const secondaryButton = `${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;

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
              onClick={() => markDone?.("respond")}
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
              <Link to="/requirement-notaris" className={secondaryButton}>
                Buka Form
              </Link>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Data & Dokumen Penghadap 2</h4>
              <Link to="/requirement-notaris" className={secondaryButton}>
                Buka Form
              </Link>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className={primaryButton}
              onClick={() => markDone?.("docs")}
            >
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
            <button
              className={primaryButton}
              onClick={() => markDone?.("draft")}
            >
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
            <button className={secondaryButton} onClick={onViewSchedule}>
              Lihat Jadwal
            </button>
            <button className={secondaryButton} onClick={onSchedule}>
              Jadwalkan
            </button>
            <button
              className={primaryButton}
              onClick={() => markDone?.("schedule")}
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
            <button
              className={primaryButton}
              onClick={() => markDone?.("sign")}
            >
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
            <button
              className={primaryButton}
              onClick={() => markDone?.("print")}
            >
              Tandai Selesai
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
