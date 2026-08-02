import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function FabricSelector({ selected, setSelected, disabled }) {
  const { data: fabrics = [] } = useQuery({
    queryKey: ["fabrics"],
    queryFn: () => base44.entities.Fabric.list("-created_date"),
  });

  const toggle = (f) =>
    setSelected(selected.some((s) => s.id === f.id) ? selected.filter((s) => s.id !== f.id) : [...selected, f]);

  if (fabrics.length === 0) {
    return (
      <p className="text-[11px] text-stone-400 text-center mb-2">
        <Link to="/fabrics" className="underline hover:text-stone-900">Build your fabric library</Link> to choose exactly what your renders use.
      </p>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1.5 px-2">
        <Layers className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[11px] uppercase tracking-widest text-stone-400">
          Fabrics {selected.length > 0 ? `· ${selected.length} selected` : "· auto"}
        </span>
        <Link to="/fabrics" className="ml-auto text-[11px] text-amber-800 hover:text-stone-900">Manage</Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 px-2">
        {fabrics.map((f) => {
          const isOn = selected.some((s) => s.id === f.id);
          return (
            <button
              key={f.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(f)}
              className={`flex items-center gap-2 shrink-0 rounded-full border pl-1.5 pr-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                isOn ? "border-stone-900 bg-stone-900 text-stone-50" : "border-stone-300 bg-white text-stone-600 hover:border-stone-900"
              }`}
            >
              {f.swatch_url ? (
                <Image src={f.swatch_url} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-stone-200" />
              )}
              {f.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}