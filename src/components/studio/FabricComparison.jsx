import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";

export default function FabricComparison({ design, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[#faf8f4]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-stone-900 font-normal">
            {design.name} — Fabric Comparison
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {design.renders?.map((r) => (
            <div key={r.fabric} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <Image src={r.url} alt={`${design.name} in ${r.fabric}`} className="w-full aspect-[3/4]" />
              <p className="text-xs text-stone-600 italic text-center py-2.5 border-t border-stone-100">
                {r.fabric}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}