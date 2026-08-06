import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Full-size image viewer. `items` = [{url, label}], `index` = open item, or null. */
export default function ImageLightbox({ items, index, onClose, onNavigate }) {
  const item = index !== null ? items[index] : null;

  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl bg-[#faf8f4] p-4">
        {item && (
          <>
            <DialogTitle className="font-display text-xl text-stone-900 font-normal">{item.label}</DialogTitle>
            <div className="relative flex justify-center">
              <img
                src={item.url}
                alt={item.label}
                className="max-h-[75vh] w-auto max-w-full rounded-lg border border-stone-200 bg-white"
              />
              {items.length > 1 && (
                <>
                  <button
                    onClick={() => onNavigate((index - 1 + items.length) % items.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-stone-900 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate((index + 1) % items.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center text-stone-700 hover:text-stone-900 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {items.length > 1 && (
              <p className="text-[11px] uppercase tracking-widest text-stone-400 text-center">
                {index + 1} / {items.length}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}