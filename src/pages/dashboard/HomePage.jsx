import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import CircleStackIcon from "@heroicons/react/24/outline/CircleStackIcon";
import {
  ArrowPathIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const metrics = [
    {
      title: "Total Notaris",
      value: "34.7k",
      change: "↗ 2300 (22%)",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Penghadap",
      value: "34,545",
      subtitle: "Current month",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Akta",
      value: "450",
      subtitle: "50 in hot leads",
      icon: <CircleStackIcon className="w-8 h-8 text-white" />,
    },
    {
      title: "Total Aktivitas Notaris",
      value: "5.6k",
      change: "↗ 300 (18%)",
      icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    },
  ];

  const verificationStats = [
    { label: "Disetujui", value: "25,600", color: "text-green-600" },
    { label: "Menunggu", value: "5,600", color: "text-yellow-600" },
    { label: "Ditolak", value: "5,600", color: "text-red-600" },
  ];

  const activities = [
    {
      nomor: 1,
      kode: "FB-001",
      jenisAkta: "Akta Jual Beli",
      penghadap1: "John Doe",
      penghadap2: "Jane Doe",
      status: "Disetujui",
    },
    {
      nomor: 2,
      kode: "FB-002",
      jenisAkta: "Akta Perjanjian",
      penghadap1: "Ahmad Ali",
      penghadap2: "Siti Nurhaliza",
      status: "Menunggu",
    },
    {
      nomor: 3,
      kode: "FB-003",
      jenisAkta: "Akta Hibah",
      penghadap1: "Budi Santoso",
      penghadap2: "Maya Sari",
      status: "Ditolak",
    },
  ];

  const handleRefresh = () => {
    // Logic untuk refresh data
    console.log("Refreshing data...");
    // Anda bisa menambahkan logic untuk reload data di sini
  };

  const handleShare = () => {
    // Logic untuk share
    console.log("Sharing data...");
    // Anda bisa menambahkan logic untuk share di sini
  };

  const handleMore = () => {
    // Logic untuk menu more
    console.log("More options...");
  };

  // Format tanggal hari ini
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header dengan Tanggal dan Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-600">
          {getCurrentDate()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleMore}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gradient text-white p-4 sm:p-4 sm:py-3 rounded-[15px]"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-2">
              <h3 className="text-xs sm:text-[16px] font-medium ">
                {metric.title}
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-1">
              <div className="flex justify-between">
                <p className="text-2xl sm:text-[35px] font-bold">
                  {metric.value}
                </p>
                {metric.icon}
              </div>
              {metric.change && (
                <p className="text-xs sm:text-sm ">{metric.change}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Section */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Verifikasi Pengguna
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-[#0256c4] mt-1 sm:mt-2">
              25.6K
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {verificationStats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-lg border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <button className="text-red-500 text-sm mt-2 hover:underline">
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Aktivitas Terkini
        </h2>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  #{activity.nomor}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === "Disetujui"
                      ? "bg-green-100 text-green-800"
                      : activity.status === "Menunggu"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Kode:</span> {activity.kode}
                </p>
                <p>
                  <span className="font-medium">Jenis:</span>{" "}
                  {activity.jenisAkta}
                </p>
                <p>
                  <span className="font-medium">Penghadap 1:</span>{" "}
                  {activity.penghadap1}
                </p>
                <p>
                  <span className="font-medium">Penghadap 2:</span>{" "}
                  {activity.penghadap2}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Nomor
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Kode
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Jenis Akta
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Penghadap 1
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Penghadap 2
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm">{activity.nomor}</td>
                  <td className="py-3 px-4 text-sm">{activity.kode}</td>
                  <td className="py-3 px-4 text-sm">{activity.jenisAkta}</td>
                  <td className="py-3 px-4 text-sm">{activity.penghadap1}</td>
                  <td className="py-3 px-4 text-sm">{activity.penghadap2}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === "Disetujui"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "Menunggu"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
