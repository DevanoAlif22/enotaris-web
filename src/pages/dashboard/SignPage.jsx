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

  const signSources = useMemo(() => {
    const list = [];
    if (activity?.notaris?.identity?.file_sign) {
      list.push({
        user_id: activity.notaris.id,
        role: "notary",
        name: activity.notaris.name,
        url: activity.notaris.identity.file_sign,
      });
    }
    for (const c of activity?.clients || []) {
      if (c?.identity?.file_sign) {
        list.push({
          user_id: c.id,
          role: "client",
          name: c.name || c.email,
          url: c.identity.file_sign,
        });
      }
    }
    return list.sort((a, b) =>
      a.user_id === me?.id ? -1 : b.user_id === me?.id ? 1 : 0
    );
  }, [activity, me?.id]);

  const pdfUrl = useMemo(() => activity?.draft?.file || null, [activity]);

  useEffect(() => {
    if (!pdfUrl) return;
    let canceled = false;
    (async () => {
      setBusy(true);
      try {
        const task = pdfjs.getDocument({ url: pdfUrl });
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
  }, [pdfUrl]);

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

          // ===== PDF canvas =====
          const pdfCanvas = document.createElement("canvas");
          pdfCanvas.width = Math.round(viewport.width);
          pdfCanvas.height = Math.round(viewport.height);

          // PENTING: PDF canvas sebagai background layer (z-index rendah)
          pdfCanvas.style.display = "block";
          pdfCanvas.style.width = `${pdfCanvas.width}px`;
          pdfCanvas.style.height = `${pdfCanvas.height}px`;
          pdfCanvas.style.position = "absolute";
          pdfCanvas.style.left = "0";
          pdfCanvas.style.top = "0";
          pdfCanvas.style.zIndex = "1"; // Background layer
          pdfCanvas.style.backgroundColor = "#ffffff";
          pdfCanvas.style.borderRadius = "8px";
          pdfCanvas.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
          pdfCanvas.style.pointerEvents = "none"; // PDF tidak perlu interaksi

          const ctx = pdfCanvas.getContext("2d", { alpha: false });
          await page.render({ canvasContext: ctx, viewport }).promise;

          // ===== Fabric overlay (di atas) =====
          const fabricEl = document.createElement("canvas");
          fabricEl.width = pdfCanvas.width;
          fabricEl.height = pdfCanvas.height;

          // PENTING: Fabric canvas di layer atas dengan z-index lebih tinggi
          fabricEl.style.position = "absolute";
          fabricEl.style.left = "0";
          fabricEl.style.top = "0";
          fabricEl.style.width = `${fabricEl.width}px`;
          fabricEl.style.height = `${fabricEl.height}px`;
          fabricEl.style.pointerEvents = "auto"; // Fabric perlu interaksi
          fabricEl.style.zIndex = "10"; // Foreground layer - LEBIH TINGGI
          fabricEl.style.background = "transparent"; // Transparan agar PDF terlihat

          // ===== Wrapper halaman =====
          const wrapper = document.createElement("div");
          // PENTING: wrapper dengan posisi relative untuk anchor absolute elements
          wrapper.style.position = "relative";
          wrapper.style.width = `${pdfCanvas.width}px`;
          wrapper.style.height = `${pdfCanvas.height}px`;
          wrapper.style.margin = "0 auto 24px";
          wrapper.style.background = "transparent";
          wrapper.style.isolation = "isolate"; // Membuat stacking context baru

          // Tambahkan PDF canvas terlebih dahulu (background)
          wrapper.appendChild(pdfCanvas);
          // Kemudian fabric canvas (foreground)
          wrapper.appendChild(fabricEl);
          columnRef.current?.appendChild(wrapper);

          const f = new fabric.Canvas(fabricEl, {
            selection: true,
            preserveObjectStacking: true,
            renderOnAddRemove: true,
            skipTargetFind: false,
            backgroundColor: "transparent", // Pastikan background transparan
          });

          // Set fabric canvas agar tidak mengblok PDF
          f.wrapperEl.style.zIndex = "10";
          f.upperCanvasEl.style.zIndex = "12"; // Upper canvas lebih tinggi lagi

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
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc]);

  const addSignatureToPage = (sigUrl, targetPageNum = null) => {
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

        p.fabricCanvas.add(img);
        p.fabricCanvas.setActiveObject(img);
        p.fabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const toggleFreeDraw = () => {
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

  const collectSignaturePlacements = () => {
    const result = [];
    for (const p of pages) {
      const f = p.fabricCanvas;
      f.discardActiveObject().renderAll();

      const objs = f
        .getObjects()
        .filter((o) => o.get("data-type") === "signature" || o.type === "path");

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

  const handleSaveApply = async () => {
    try {
      setBusy(true);
      if (!pdfUrl) return showError("PDF draft belum tersedia.");
      const placements = collectSignaturePlacements();
      if (!placements.length) return showError("Belum ada tanda tangan.");

      const res = await signService.apply(Number(activityId), {
        source_pdf: pdfUrl,
        placements,
      });

      const url = res?.data?.file || res?.file;
      if (url) {
        showSuccess("TTD berhasil diterapkan.");
        window.open(url, "_blank", "noopener,noreferrer");
        await refetch?.();
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
            <button
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveApply}
              disabled={busy || !pdfUrl}
            >
              Simpan & Terapkan TTD
            </button>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium">Sumber TTD:</div>
            {signSources.length === 0 && (
              <div className="text-xs text-gray-500">
                Tidak ada file tanda tangan di identity para pihak.
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
            💡 Tips: klik gambar TTD untuk menempel, gunakan Free Draw untuk
            menggambar, double-click objek untuk menghapus.
          </div>
        </div>

        {!pdfUrl ? (
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
