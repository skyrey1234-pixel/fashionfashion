import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import ImageLightbox from "@/components/studio/ImageLightbox";

export default function RenderGallery({ renders }) {
  const fabrics = [...new Set(renders.map((r) => r.fabric))];
  const [openIndex, setOpenIndex] = useState(null);

  const items = renders.map((r) => ({ url: r.url, label: `${r.fabric} — ${r.view_type}` }));

  return (
    <div className="space-y-6">
      {fabrics.map((fabric) => {
        const group = renders.filter((r) => r.fabric === fabric);
        return (
          <div key={fabric}>
            <p className="text-xs italic text-stone-600 mb-2">
              {fabric}
              {group[0]?.colorway ? ` — ${group[0].colorway}` : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {group.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOpenIndex(renders.indexOf(r))}
                  className="text-left group focus:outline-none"
                >
                  <Image
                    src={r.url}
                    alt={`${fabric} — ${r.view_type}`}
                    className="w-full aspect-[3/4] rounded-lg border border-stone-200 group-hover:border-stone-900 transition-colors cursor-zoom-in"
                  />
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1.5 text-center">{r.view_type}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <ImageLightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </div>
  );
}