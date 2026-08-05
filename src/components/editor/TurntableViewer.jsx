import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Rotate3D } from "lucide-react";
import Turntable360 from "@/components/editor/Turntable360";
import { TURNTABLE_PREFIX } from "@/lib/designEngine";

const angleOf = (r) => parseInt(r.view_type.replace(TURNTABLE_PREFIX, ""), 10);

export default function TurntableViewer({ open, onOpenChange, renders, working, onGenerate }) {
  const fabrics = [...new Set(renders.map((r) => r.fabric))];
  const [fabric, setFabric] = useState(fabrics[0]);
  const active = fabrics.includes(fabric) ? fabric : fabrics[0];

  const frames = renders
    .filter((r) => r.fabric === active && r.view_type?.startsWith(TURNTABLE_PREFIX))
    .sort((a, b) => angleOf(a) - angleOf(b))
    .map((r) => r.url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-[#faf8f4]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-stone-900 font-normal">360° Turntable</DialogTitle>
        </DialogHeader>

        {fabrics.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {fabrics.map((f) => (
              <button
                key={f}
                onClick={() => setFabric(f)}
                className={`text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                  f === active
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "border-stone-300 text-stone-500 hover:border-stone-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {working ? (
          <div className="flex flex-col items-center gap-3 py-16 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">{working}</p>
          </div>
        ) : frames.length > 1 ? (
          <Turntable360 key={active} frames={frames} />
        ) : (
          <div className="text-center py-14 border border-dashed border-stone-300 rounded-xl">
            <p className="text-sm text-stone-500 mb-4">
              Shoot a full rotation of this piece in {active} — twelve frames you can spin.
            </p>
            <button
              onClick={() => onGenerate(active)}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 text-stone-50 px-6 py-3 text-sm hover:bg-amber-800 transition-colors"
            >
              <Rotate3D className="w-4 h-4" /> Create turntable
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}