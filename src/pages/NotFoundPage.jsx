import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-gray-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* <div className="bg-white rounded-full p-6 shadow-lg animate-bounce">
              <ExclamationTriangleIcon className="w-16 h-16 text-amber-500" />
            </div> */}
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
          <p className="text-sm text-gray-500">
            Mungkin halaman telah dipindahkan, dihapus, atau URL yang Anda
            masukkan salah.
          </p>
        </div>
      </div>
    </div>
  );
}
