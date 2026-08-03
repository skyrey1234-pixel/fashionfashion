import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { Eraser, Loader2 } from "lucide-react";

export default function RegionEditor({ open, onOpenChange, targets, onSubmit }) {
  const overlayRef = useRef(null);
  const imgElRef = useRef(null);
  const drawing = useRef(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [uploading, setUploading] = useState(false);

  const target = targets[targetIndex];

  const syncOverlaySize = () => {
    const img = imgElRef.current;
    const canvas = overlayRef.current;
    if (!img || !canvas) return;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
  };

  const clearStrokes = () => {
    const canvas = overlayRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const switchTarget = (i) => {
    setTargetIndex(i);
    clearStrokes();
  };

  const pos = (e) => {
    const canvas = overlayRef.current;
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return {
      x: ((p.clientX - rect.left) / rect.width) * canvas.width,
      y: ((p.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e) => {
    syncOverlaySize();
    drawing.current = true;
    const canvas = overlayRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = pos(e);
    ctx.strokeStyle = "rgba(255, 30, 30, 0.85)";
    ctx.lineWidth = Math.max(6, canvas.width / 90);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = overlayRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasStrokes(true);
  };

  const end = () => {
    drawing.current = false;
  };

  const handleSubmit = async () => {
    if (!instruction.trim() || !hasStrokes || uploading) return;
    setUploading(true);
    // Composite the photo + strokes offscreen with a CORS-enabled copy of the image
    const corsImg = await new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = target.url + (target.url.includes("?") ? "&" : "?") + "cors=1";
    });
    const out = document.createElement("canvas");
    out.width = corsImg.naturalWidth;
    out.height = corsImg.naturalHeight;
    const ctx = out.getContext("2d");
    ctx.drawImage(corsImg, 0, 0);
    ctx.drawImage(overlayRef.current, 0, 0, out.width, out.height);
    const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
    const file = new File([blob], "region-edit.png", { type: "image/png" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    const text = instruction.trim();
    setInstruction("");
    onOpenChange(false);
    onSubmit({ instruction: text, annotatedUrl: file_url, fabric: target.fabric });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-[#faf8f4]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-stone-900 font-normal">Edit an Area</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-stone-500 -mt-2">
          Circle or brush over the part you want changed, then describe the change. Everything outside your marking stays the same.
        </p>
        {targets.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {targets.map((t, i) => (
              <button
                key={t.fabric}
                onClick={() => switchTarget(i)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                  i === targetIndex
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "border-stone-300 text-stone-500 hover:border-stone-900"
                }`}
              >
                {t.fabric}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-center rounded-xl border border-stone-200 bg-white overflow-hidden">
          <div className="relative inline-block">
            <img
              ref={imgElRef}
              src={target?.url}
              alt={target?.fabric}
              onLoad={syncOverlaySize}
              className="block max-w-full max-h-[50vh] w-auto h-auto select-none"
              draggable={false}
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
              onMouseDown={start}
              onMouseMove={move}
              onMouseUp={end}
              onMouseLeave={end}
              onTouchStart={start}
              onTouchMove={move}
              onTouchEnd={end}
            />
            {hasStrokes && (
              <button
                onClick={clearStrokes}
                className="absolute top-2 right-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest bg-white/90 border border-stone-200 rounded-full px-3 py-1.5 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder='e.g. "Change only this sleeve to cream silk"'
            className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!instruction.trim() || !hasStrokes || uploading}
            className="rounded-full bg-stone-900 text-stone-50 px-6 py-3 text-sm hover:bg-amber-800 transition-colors disabled:opacity-30 flex items-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />} Apply
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}