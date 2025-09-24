// pages/dashboard/SignPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// PDF.js v5: worker via workerPort (Vite)
import * as pdfjs from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

// Fabric import
import FabricNS from "fabric";
const fabric = FabricNS?.fabric || FabricNS;

import { useActivityData } from "../../hooks/useActivityData";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import { showError, showSuccess } from "../../utils/toastConfig";
import { signService } from "../../services/signService";

export default function SignPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const { activity, isSubmitting, isMutating, me, refetch } =
    useActivityData(activityId);

  const [busy, setBusy] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const columnRef = useRef(null);

  // ===== Role: notaris?
  const isNotary = useMemo(
    () => !!(activity?.notaris?.id && me?.id && activity.notaris.id === me.id),
    [activity?.notaris?.id, me?.id]
  );

  // ===== Sumber TTD: hanya milik user login
  const signSources = useMemo(() => {
    const list = [];
    if (
      me?.id &&
      activity?.notaris?.id === me.id &&
      activity?.notaris?.identity?.file_sign
    ) {
      list.push({
        user_id: activity.notaris.id,
        role: "notary",
        name: activity.notaris.name,
        url: activity.notaris.identity.file_sign,
      });
    }
    if (me?.id) {
      for (const c of activity?.clients || []) {
        if (c?.id === me.id && c?.identity?.file_sign) {
          list.push({
            user_id: c.id,
            role: "client",
            name: c.name || c.email,
            url: c.identity.file_sign,
          });
        }
      }
    }
    return list.slice(0, 1);
  }, [activity, me?.id]);

  // ====== Status & URL TTD tersimpan (sinkron lokal + server) ======
  const [hasSigned, setHasSigned] = useState(false);
  const [signedUrlLocal, setSignedUrlLocal] = useState(null);

  // Sinkronkan saat data activity baru masuk / setelah refresh
  useEffect(() => {
    const serverSigned = activity?.draft?.file_ttd || null;
    setHasSigned(!!serverSigned);
    setSignedUrlLocal(serverSigned); // kalau null, berarti belum ada
  }, [activity?.draft?.file_ttd]);

  // ====== Viewer URL (prioritas signedUrlLocal → file_ttd → file) + bust cache
  const baseViewer = useMemo(() => {
    return (
      signedUrlLocal ||
      activity?.draft?.file_ttd ||
      activity?.draft?.file ||
      null
    );
  }, [signedUrlLocal, activity?.draft?.file_ttd, activity?.draft?.file]);

  const initialUrl = useMemo(() => {
    return baseViewer ? `${baseViewer}?v=${Date.now()}` : null;
  }, [baseViewer]);

  const [viewerUrl, setViewerUrl] = useState(initialUrl);

  // Update viewer saat base berubah (mis. habis refetch atau refresh)
  useEffect(() => {
    setViewerUrl(initialUrl);
  }, [initialUrl]);

  // ===== Muat dokumen PDF tiap viewerUrl berubah =====
  useEffect(() => {
    if (!viewerUrl) return;
    let canceled = false;
    (async () => {
      setBusy(true);
      try {
        const task = pdfjs.getDocument({ url: viewerUrl });
        const doc = await task.promise;
        if (!canceled) setPdfDoc(doc);
      } catch (e) {
        console.error(e);
        showError("Gagal memuat PDF untuk ditandatangani.");
      } finally {
        setBusy(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [viewerUrl]);

  // ===== Render halaman PDF ke canvas + overlay Fabric
  useEffect(() => {
    if (!pdfDoc) return;
    let unmounted = false;

    (async () => {
      setBusy(true);
      try {
        const count = pdfDoc.numPages;
        const newPages = [];

        if (columnRef.current) columnRef.current.innerHTML = "";

        const maxColumnWidth = Math.min(
          columnRef.current?.clientWidth || 840,
          840
        );

        for (let i = 1; i <= count; i++) {
          if (unmounted) break;

          const page = await pdfDoc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = maxColumnWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });

          // ===== PDF canvas (background) =====
          const pdfCanvas = document.createElement("canvas");
          pdfCanvas.width = Math.round(viewport.width);
          pdfCanvas.height = Math.round(viewport.height);
          pdfCanvas.style.display = "block";
          pdfCanvas.style.width = `${pdfCanvas.width}px`;
          pdfCanvas.style.height = `${pdfCanvas.height}px`;
          pdfCanvas.style.position = "absolute";
          pdfCanvas.style.left = "0";
          pdfCanvas.style.top = "0";
          pdfCanvas.style.zIndex = "1";
          pdfCanvas.style.backgroundColor = "#ffffff";
          pdfCanvas.style.borderRadius = "8px";
          pdfCanvas.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
          pdfCanvas.style.pointerEvents = "none";

          const ctx = pdfCanvas.getContext("2d", { alpha: false });
          await page.render({ canvasContext: ctx, viewport }).promise;

          // ===== Fabric overlay (foreground) =====
          const fabricEl = document.createElement("canvas");
          fabricEl.width = pdfCanvas.width;
          fabricEl.height = pdfCanvas.height;
          fabricEl.style.position = "absolute";
          fabricEl.style.left = "0";
          fabricEl.style.top = "0";
          fabricEl.style.width = `${fabricEl.width}px`;
          fabricEl.style.height = `${fabricEl.height}px`;
          fabricEl.style.pointerEvents = "auto";
          fabricEl.style.zIndex = "10";
          fabricEl.style.background = "transparent";

          // ===== Wrapper =====
          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";
          wrapper.style.width = `${pdfCanvas.width}px`;
          wrapper.style.height = `${pdfCanvas.height}px`;
          wrapper.style.margin = "0 auto 24px";
          wrapper.style.background = "transparent";
          wrapper.style.isolation = "isolate";

          wrapper.appendChild(pdfCanvas);
          wrapper.appendChild(fabricEl);
          columnRef.current?.appendChild(wrapper);

          const f = new fabric.Canvas(fabricEl, {
            selection: true,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
            skipTargetFind: false,
            backgroundColor: "transparent",
          });

          f.wrapperEl.style.zIndex = "10";
          f.upperCanvasEl.style.zIndex = "12";

          f.on("object:added", (e) => {
            if (e?.target) {
              e.target.lockUniScaling = true;
              e.target.set({
                transparentCorners: false,
                borderColor: "#2563eb",
                cornerColor: "#2563eb",
                cornerSize: 8,
              });
            }
          });

          // double click hapus
          f.on("mouse:dblclick", (e) => {
            if (e.target) f.remove(e.target);
          });

          newPages.push({ num: i, pdfViewport: viewport, fabricCanvas: f });
        }

        if (!unmounted) setPages(newPages);
      } catch (err) {
        console.error("Render pages error:", err);
        showError("Gagal merender halaman PDF.");
      } finally {
        if (!unmounted) setBusy(false);
      }
    })();

    return () => {
      unmounted = true;
      pages.forEach((p) => {
        try {
          p.fabricCanvas.dispose();
        } catch {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc]);

  // ===== Tempel TTD (milik sendiri saja)
  const addSignatureToPage = (sigUrl, targetPageNum = null) => {
    if (!me?.id) return showError("Session tidak valid.");
    if (!signSources.length)
      return showError("Tidak ada file tanda tangan Anda.");

    const p = targetPageNum
      ? pages.find((x) => x.num === targetPageNum)
      : pages[pages.length - 1];
    if (!p) return showError("Halaman tidak tersedia.");

    fabric.Image.fromURL(
      sigUrl,
      (img) => {
        if (!img) return showError("Gagal memuat gambar TTD.");

        const cw = p.fabricCanvas.getWidth();
        const ch = p.fabricCanvas.getHeight();

        const maxW = Math.min(280, cw * 0.5);
        const scale = maxW / img.width;
        img.scale(scale);

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const startLeft = 80;
        const startTop = ch - img.getScaledHeight() - 60;

        img.set({
          left: clamp(startLeft, 0, cw - img.getScaledWidth()),
          top: clamp(startTop, 0, ch - img.getScaledHeight()),
          selectable: true,
          hasBorders: true,
          hasControls: true,
          lockUniScaling: true,
          transparentCorners: false,
          borderColor: "#2563eb",
          cornerColor: "#2563eb",
          cornerSize: 8,
        });

        img.set("objectCaching", false);
        img.set("data-type", "signature");
        img.set("data-source-user-id", me.id); // milik saya

        p.fabricCanvas.add(img);
        p.fabricCanvas.setActiveObject(img);
        p.fabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const toggleFreeDraw = () => {
    if (!me?.id) return;
    pages.forEach((p) => {
      p.fabricCanvas.isDrawingMode = !p.fabricCanvas.isDrawingMode;
      if (p.fabricCanvas.isDrawingMode) {
        p.fabricCanvas.freeDrawingBrush.width = 2.5;
        p.fabricCanvas.freeDrawingBrush.color = "#000000";
        p.fabricCanvas.selection = false;
      } else {
        p.fabricCanvas.selection = true;
      }
      p.fabricCanvas.renderAll();
    });
  };

  const clearAllLayers = () => {
    if (window.confirm("Hapus semua tanda tangan & gambar?")) {
      pages.forEach((p) => {
        p.fabricCanvas.clear();
        p.fabricCanvas.renderAll();
      });
    }
  };

  // ===== Kumpulkan objek milik sendiri
  const collectSignaturePlacements = () => {
    const result = [];
    for (const p of pages) {
      const f = p.fabricCanvas;
      f.discardActiveObject().renderAll();

      const objs = f.getObjects().filter((o) => {
        const isMine =
          (o.get("data-type") === "signature" &&
            o.get("data-source-user-id") === me?.id) ||
          o.type === "path"; // free draw dianggap milik sendiri
        return isMine;
      });

      for (const o of objs) {
        if (o.type === "path") {
          const bound = o.getBoundingRect();
          if (bound.width <= 0 || bound.height <= 0) continue;

          const safeLeft = Math.max(0, bound.left);
          const safeTop = Math.max(0, bound.top);
          const safeWidth = Math.min(bound.width, f.getWidth() - safeLeft);
          const safeHeight = Math.min(bound.height, f.getHeight() - safeTop);

          const dataUrl = f.toDataURL({
            left: safeLeft,
            top: safeTop,
            width: safeWidth,
            height: safeHeight,
            format: "png",
            multiplier: 2,
          });

          result.push({
            page: p.num,
            kind: "draw",
            source_user_id: me?.id || null,
            image_data_url: dataUrl,
            x_ratio: safeLeft / p.pdfViewport.width,
            y_ratio: safeTop / p.pdfViewport.height,
            w_ratio: safeWidth / p.pdfViewport.width,
            h_ratio: safeHeight / p.pdfViewport.height,
          });
        } else {
          const bound = o.getBoundingRect(true, true);
          if (bound.width <= 0 || bound.height <= 0) continue;

          const safeLeft = Math.max(0, bound.left);
          const safeTop = Math.max(0, bound.top);
          const safeWidth = Math.min(
            bound.width,
            p.pdfViewport.width - safeLeft
          );
          const safeHeight = Math.min(
            bound.height,
            p.pdfViewport.height - safeTop
          );

          result.push({
            page: p.num,
            kind: "image",
            source_user_id: me?.id || null,
            x_ratio: safeLeft / p.pdfViewport.width,
            y_ratio: safeTop / p.pdfViewport.height,
            w_ratio: safeWidth / p.pdfViewport.width,
            h_ratio: safeHeight / p.pdfViewport.height,
          });
        }
      }
    }
    return result;
  };

  // ===== Apply TTD
  const handleSaveApply = async () => {
    try {
      setBusy(true);
      if (!viewerUrl) return showError("PDF draft belum tersedia.");
      const placements = collectSignaturePlacements();
      if (!placements.length) return showError("Belum ada tanda tangan Anda.");

      const res = await signService.apply(Number(activityId), {
        source_pdf: viewerUrl, // kirim URL yang sedang dilihat
        placements,
      });

      const url = res?.data?.file || res?.file || res?.data?.file_ttd;
      if (url) {
        const nextSigned = `${url}?v=${Date.now()}`;
        setSignedUrlLocal(url); // sinkron lokal
        setHasSigned(true); // tombol langsung aktif
        setViewerUrl(nextSigned);
        window.open(nextSigned, "_blank", "noopener,noreferrer");

        showSuccess("TTD berhasil diterapkan.");
        await refetch?.(); // sync state activity dari server
      } else {
        showError("Server tidak mengembalikan file hasil.");
      }
    } catch (e) {
      console.error("Apply TTD error:", e);
      showError(
        e?.response?.data?.message || e?.message || "Gagal menerapkan TTD."
      );
    } finally {
      setBusy(false);
    }
  };

  // ===== Reset TTD → kembali ke file awal (khusus Notaris)
  const handleResetToOriginal = async () => {
    if (!activityId) return;
    if (!hasSigned) return showError("Belum ada hasil TTD untuk direset.");
    try {
      setBusy(true);
      const res = await signService.resetTtd(Number(activityId));
      const base = res?.data?.file || activity?.draft?.file || null;
      if (base) {
        setSignedUrlLocal(null); // hapus TTD lokal
        setHasSigned(false); // tombol langsung nonaktif
        const next = `${base}?v=${Date.now()}`;
        setViewerUrl(next);
        showSuccess("File TTD telah direset ke file awal.");
        await refetch?.(); // sync state activity
      } else {
        showError("File awal tidak tersedia di server.");
      }
    } catch (e) {
      console.error("Reset TTD error:", e);
      showError(
        e?.response?.data?.message || e?.message || "Gagal reset file TTD."
      );
    } finally {
      setBusy(false);
    }
  };

  // ===== URL untuk tombol "Lihat File TTD" (pakai lokal dulu, fallback ke server)
  const signedHref =
    signedUrlLocal || activity?.draft?.file_ttd
      ? `${signedUrlLocal || activity?.draft?.file_ttd}?v=${Date.now()}`
      : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <LoadingOverlay show={busy || isSubmitting || isMutating} />

      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">
              Tanda Tangan: {activity?.name}
            </h1>
            <p className="text-xs text-gray-500">
              Kode: {activity?.tracking_code}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={() => navigate(`/app/project-flow/${activity?.id}`)}
            >
              ← Kembali
            </button>
            {/* 🔎 Lihat hasil TTD (ikut update lokal & server) */}
            <button
              className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50"
              onClick={() =>
                hasSigned &&
                signedHref &&
                window.open(signedHref, "_blank", "noopener")
              }
              disabled={!hasSigned}
              title={
                hasSigned ? "Buka hasil TTD terakhir" : "Belum ada hasil TTD"
              }
            >
              Lihat File TTD Tersimpan
            </button>

            {/* 🔁 Reset ke file awal (hanya Notaris) */}
            {isNotary && (
              <button
                className="px-3 py-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm disabled:opacity-50"
                onClick={handleResetToOriginal}
                disabled={!hasSigned || busy}
                title="Kembalikan dokumen ke versi tanpa TTD (hanya Notaris)"
              >
                Reset ke File Awal
              </button>
            )}

            <button
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveApply}
              disabled={busy || !viewerUrl}
            >
              Simpan & Terapkan TTD
            </button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium">Sumber TTD Anda:</div>
            {signSources.length === 0 && (
              <div className="text-xs text-gray-500">
                Tidak ada file tanda tangan pada profil Anda (identity).
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {signSources.map((s) => (
              <button
                key={s.user_id}
                className="flex items-center gap-2 px-2 py-1 rounded bg-white ring-1 ring-black/5 hover:bg-gray-50 transition-colors whitespace-nowrap"
                onClick={() => addSignatureToPage(s.url)}
                title={`Tempel TTD: ${s.name}`}
              >
                <img
                  src={s.url}
                  className="w-10 h-6 object-contain"
                  alt={s.name}
                  crossOrigin="anonymous"
                />
                <span className="text-xs">{s.name}</span>
              </button>
            ))}

            <div className="ml-auto flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={toggleFreeDraw}
              >
                Toggle Free Draw
              </button>
              <button
                className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                onClick={clearAllLayers}
              >
                Bersihkan Semua
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            💡 Tips: klik gambar TTD (milik Anda) untuk menempel, gunakan Free
            Draw untuk menggambar, double-click objek untuk menghapus.
          </div>
        </div>

        {!viewerUrl ? (
          <div className="text-center py-8">
            <div className="text-sm text-red-600 mb-2">
              PDF draft belum tersedia.
            </div>
            <Link
              to={`/app/project-flow/draft/${activityId}`}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Export PDF di halaman Draft →
            </Link>
          </div>
        ) : (
          <div className="relative rounded-lg border bg-gray-50">
            <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden px-4 pt-6 pb-2">
              {/* kolom pusat tempat halaman di-append */}
              <div
                ref={columnRef}
                style={{
                  margin: "0 auto",
                  width: "min(840px, 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
