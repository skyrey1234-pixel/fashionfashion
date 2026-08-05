import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCw } from "lucide-react";

/** Drag-to-spin 360° frame player. `frames` is an ordered list of image urls. */
export default function Turntable360({ frames }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const dragX = useRef(null);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % frames.length), 110);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  const startDrag = (e) => {
    setPlaying(false);
    dragX.current = (e.touches ? e.touches[0] : e).clientX;
  };
  const onDrag = (e) => {
    if (dragX.current === null) return;
    const x = (e.touches ? e.touches[0] : e).clientX;
    const delta = x - dragX.current;
    if (Math.abs(delta) < 18) return;
    dragX.current = x;
    setIndex((i) => (i + (delta > 0 ? 1 : -1) + frames.length) % frames.length);
  };
  const endDrag = () => {
    dragX.current = null;
  };

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-xl border border-stone-200 bg-white overflow-hidden cursor-ew-resize select-none"
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={startDrag}
        onTouchMove={onDrag}
        onTouchEnd={endDrag}
      >
        {frames.map((url, i) => (
          <img
            key={url}
            src={url}
            alt={`Frame ${i + 1}`}
            draggable={false}
            className={`w-full object-contain max-h-[60vh] ${i === index ? "block" : "hidden"}`}
          />
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 border border-stone-200 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-widest text-stone-600">
          <RotateCw className="w-3.5 h-3.5" /> Drag to spin
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          className="flex-1 accent-stone-900"
        />
        <span className="text-[11px] uppercase tracking-widest text-stone-400">
          {index + 1}/{frames.length}
        </span>
      </div>
    </div>
  );
}