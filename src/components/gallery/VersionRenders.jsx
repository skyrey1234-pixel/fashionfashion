import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { Check } from "lucide-react";
import ImageLightbox from "@/components/studio/ImageLightbox";

export default function VersionRenders({ version, isCurrent, selectMode, selected, onToggle }) {
  const [openIndex, setOpenIndex] = useState(null);

  const images = [
    ...(version.sketch_url ? [{ url: version.sketch_url, label: "Sketch" }] : []),
    ...(version.renders || []).map((r) => ({
      url: r.url,
      label: [r.fabric, r.view_type].filter(Boolean).join(" — "),
    })),
  ];

  return (
    <div
      className={`rounded-xl border bg-white p-3 transition-all ${
        selectMode && selected ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200/80"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-widest text-amber-800">
          V{version.version_number}
          {isCurrent && <span className="ml-2 text-stone-400">· Current</span>}
          <span className="ml-2 normal-case tracking-normal text-stone-500">
            {version.label || version.edit_prompt || "Original design"}
          </span>
        </p>
        {selectMode && (
          <button
            onClick={() => onToggle(version.id)}
            className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
              selected ? "bg-stone-900 border-stone-900 text-stone-50" : "bg-white border-stone-300"
            }`}
            aria-label="Select version"
          >
            {selected && <Check className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => (selectMode ? onToggle(version.id) : setOpenIndex(i))}
            className="text-left group focus:outline-none"
          >
            <Image
              src={img.url}
              alt={img.label}
              className="w-full aspect-[3/4] rounded-lg border border-stone-200 group-hover:border-stone-900 transition-colors cursor-zoom-in"
            />
            <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 text-center truncate">{img.label}</p>
          </button>
        ))}
      </div>
      <ImageLightbox items={images} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </div>
  );
}