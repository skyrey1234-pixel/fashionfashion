import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";

export default function FabricComparison({ design, open, onOpenChange }) {
  const renders = design.renders || [];
  const views = [...new Set(renders.map((r) => r.view_type).filter(Boolean))];
  const [view, setView] = useState(views[0]);
  const shown = views.length > 0 ? renders.filter((r) => r.view_type === (view || views[0])) : renders;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[#faf8f4]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-stone-900 font-normal">
            {design.name} — Fabric Comparison
          </DialogTitle>
        </DialogHeader>
        {views.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                  (view || views[0]) === v
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "border-stone-300 text-stone-500 hover:border-stone-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {shown.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <Image src={r.url} alt={`${design.name} in ${r.fabric}`} className="w-full aspect-[3/4]" />
              <p className="text-xs text-stone-600 italic text-center py-2.5 border-t border-stone-100">
                {r.fabric}
                {r.colorway ? ` — ${r.colorway}` : ""}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}