import React from "react";
import { Image } from "@/components/ui/image";
import { Check, Trash2 } from "lucide-react";

export default function FabricCard({ fabric, selected, onToggle, onDelete }) {
  return (
    <div
      onClick={onToggle}
      className={`group relative bg-white rounded-xl border overflow-hidden transition-all ${
        onToggle ? "cursor-pointer" : ""
      } ${selected ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 hover:border-stone-400"}`}
    >
      {fabric.swatch_url ? (
        <Image src={fabric.swatch_url} alt={fabric.name} className="w-full aspect-square" />
      ) : (
        <div className="w-full aspect-square bg-stone-100 flex items-center justify-center">
          <span className="font-display text-2xl text-stone-300">{fabric.name.charAt(0)}</span>
        </div>
      )}
      <div className="p-3">
        <p className="text-sm text-stone-900 truncate">{fabric.name}</p>
        {fabric.description && <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{fabric.description}</p>}
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 text-stone-500 hover:text-red-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          aria-label={`Delete ${fabric.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}