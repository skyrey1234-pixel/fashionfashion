import React from "react";
import { Image } from "@/components/ui/image";
import { Check } from "lucide-react";

export default function PiecePicker({ pieces, selected, onToggle }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {pieces.map((p) => {
        const isSelected = selected.some((s) => s.url === p.url);
        return (
          <button
            key={p.url}
            type="button"
            onClick={() => onToggle(p)}
            className={`relative text-left bg-white rounded-xl border overflow-hidden transition-all ${
              isSelected ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200/80 hover:shadow-md"
            }`}
          >
            <Image src={p.url} alt={p.label} className="w-full aspect-[3/4]" />
            <span
              className={`absolute top-2 right-2 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                isSelected ? "bg-stone-900 border-stone-900 text-stone-50" : "bg-white/90 border-stone-300"
              }`}
            >
              {isSelected && <Check className="w-4 h-4" />}
            </span>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 px-2 py-2 truncate border-t border-stone-100">
              {p.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}