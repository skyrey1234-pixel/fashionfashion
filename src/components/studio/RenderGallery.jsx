import React from "react";
import { Image } from "@/components/ui/image";

export default function RenderGallery({ renders }) {
  const fabrics = [...new Set(renders.map((r) => r.fabric))];
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
                <div key={i}>
                  <Image src={r.url} alt={`${fabric} — ${r.view_type}`} className="w-full aspect-[3/4] rounded-lg border border-stone-200" />
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1.5 text-center">{r.view_type}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}