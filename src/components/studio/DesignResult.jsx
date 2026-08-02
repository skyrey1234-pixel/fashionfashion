import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { PenTool, Shirt, Columns3 } from "lucide-react";
import FabricComparison from "@/components/studio/FabricComparison";

export default function DesignResult({ design }) {
  const [compareOpen, setCompareOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-lg text-stone-900 mb-1">{design.name}</p>
        <p className="text-stone-500 text-xs">{design.description}</p>
      </div>
      {design.sketch_url && (
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-stone-400 mb-2">
            <PenTool className="w-3.5 h-3.5" /> Sketch
          </div>
          <Image src={design.sketch_url} alt={`Sketch of ${design.name}`} className="w-full max-w-sm rounded-xl border border-stone-200" fittingType="fit" />
        </div>
      )}
      {design.renders?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-stone-400">
              <Shirt className="w-3.5 h-3.5" /> Fabric Renders
            </div>
            <button
              onClick={() => setCompareOpen(true)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-amber-800 hover:text-stone-900 transition-colors"
            >
              <Columns3 className="w-3.5 h-3.5" /> Compare
            </button>
          </div>
          <FabricComparison design={design} open={compareOpen} onOpenChange={setCompareOpen} />
          <div className="grid grid-cols-2 gap-3">
            {design.renders.map((r) => (
              <div key={r.fabric}>
                <Image src={r.url} alt={`${design.name} in ${r.fabric}`} className="w-full aspect-[3/4] rounded-xl border border-stone-200" />
                <p className="text-xs text-stone-500 mt-1.5 text-center italic">{r.fabric}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}