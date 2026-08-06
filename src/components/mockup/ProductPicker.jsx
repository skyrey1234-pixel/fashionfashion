import React from "react";
import { Image } from "@/components/ui/image";
import { MOCKUP_PRODUCTS } from "@/lib/mockupProducts";

export default function ProductPicker({ value, onPick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {MOCKUP_PRODUCTS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPick(p.id)}
          className={`bg-white rounded-xl border overflow-hidden transition-all ${
            value === p.id ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200/80 hover:shadow-md"
          }`}
        >
          <Image src={p.image} alt={p.name} className="w-full aspect-square" fittingType="fit" />
          <p className="text-[10px] uppercase tracking-widest text-stone-500 py-2 border-t border-stone-100">{p.name}</p>
        </button>
      ))}
    </div>
  );
}