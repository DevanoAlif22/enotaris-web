// sections/track/TrackSection.jsx
"use client";
import { useMemo, useState } from "react";
import { trackService } from "../../services/trackService";
import { showError } from "../../utils/toastConfig";
import TrackForm from "../../components/landing/track/TrackFrom";
import TrackResult from "../../components/landing/track/TrackResult";

export default function TrackSection() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null); // response.data

  const progress = useMemo(() => {
    if (!res?.data) return { percent: 0, is_done: false };
    return {
      percent: res.data.progress_percent ?? 0,
      is_done: !!res.data.is_done,
    };
  }, [res]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setLoading(true);
      const out = await trackService.lookup(code.trim());
      setRes(out);
    } catch (err) {
      setRes(null);
      showError(err?.message || "Gagal memuat data tracking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-[#edf4ff] relative px-6 md:px-20 py-12 pb-[100px]">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6 max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#002d6a]">
          Lacak Progres Aktivitas
        </h1>
        <p className="text-sm text-gray-600">
          Masukkan <span className="font-mono font-medium">tracking_code</span>{" "}
          untuk melihat status tiap langkah.
        </p>

        <TrackForm
          code={code}
          setCode={setCode}
          loading={loading}
          onSubmit={onSubmit}
        />
      </div>

      {/* Result */}
      {res && (
        <div className="bg-white rounded-2xl border border-[#e9eefb] shadow-xl p-6 max-w-5xl mx-auto">
          <TrackResult res={res} progress={progress} />
        </div>
      )}
    </section>
  );
}
