"use client";
import { Link } from "react-router-dom";
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon";
import StatusBadge from "../../utils/StatusBadge";
import ActionButton from "../../components/ActionButton";
import VerificationDecisionModal from "../../components/activitynotarisclient/VerificationDecisionModal";
import ScheduleViewModal from "../../components/activitynotarisclient/ScheduleViewModal";
import useClientActivities from "../../hooks/client/useClientActivities";

export default function NotarisClientActivityPage() {
  const {
    rows,
    meta,
    loading,
    page,
    setPage,
    query,
    onChangeSearch,
    canTakeAction,
    verify,
    askApprove,
    askReject,
    closeVerify,
    doVerify,
    schedView,
    setSchedView,
  } = useClientActivities();

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-[#002d6a] rounded-2xl shadow-sm p-5 md:p-6 relative">
        {loading && (
          <div className="absolute inset-0 dark:text-[#f5fefd] bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-sm">
            Memuat...
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold dark:text-[#f5fefd]">
            Project Penghadap
          </h1>

          <div className="relative w-96">
            <input
              defaultValue={query}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Cari kode, nama, jenis akta…"
              className="w-full h-11 pl-4 pr-10 rounded-lg border outline-none focus:ring-2 focus:ring-[#0256c4]/40 dark:text-[#f5fefd]"
            />
            <MagnifyingGlassIcon className="dark:text-[#f5fefd] w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />

        {/* Table */}
        <div className="text-center mt-3 -mx-5 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="text-center text-gray-500 border-b border-gray-200/80 dark:text-[#f5fefd]">
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Kode
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Nama
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Jenis Akta
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Status Saya
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-t border-gray-200/80 ${
                    idx === 0 ? "border-t-0" : ""
                  }`}
                >
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd]">
                    {r.code}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd] font-semibold">
                    {r.name}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap dark:text-[#f5fefd]">
                    {r.deed_type}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-center">
                      <ActionButton variant="info">
                        <Link to={`/app/project-flow/${r.id}`}>Detail</Link>
                      </ActionButton>

                      {canTakeAction(r) && (
                        <>
                          <ActionButton
                            variant="success"
                            onClick={() => askApprove(r)}
                          >
                            Setujui
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => askReject(r)}
                          >
                            Tolak
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={12}
                    className="py-8 px-5 text-center text-gray-500 whitespace-nowrap"
                  >
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: server-side pagination */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="dark:text-[#f5fefd]">
            <p>
              Menampilkan {meta.from || 0}–{meta.to || 0} dari {meta.total || 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={(meta.current_page || 1) <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              «
            </button>
            <div className="px-4 py-2 rounded-lg bg-gray-100 font-semibold">
              Hal {meta.current_page || page} / {meta.last_page || 1}
            </div>
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 disabled:opacity-50"
              disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
              onClick={() =>
                setPage((p) => Math.min(meta.last_page || 1, p + 1))
              }
            >
              »
            </button>
          </div>
        </div>
      </div>

      <ScheduleViewModal
        open={schedView.open}
        onClose={() => setSchedView({ open: false, row: null })}
        row={schedView.row}
      />

      <VerificationDecisionModal
        open={verify.open}
        onClose={closeVerify}
        action={verify.action}
        itemName={verify.row?.name}
        loading={verify.loading}
        onConfirm={doVerify}
      />
    </div>
  );
}
