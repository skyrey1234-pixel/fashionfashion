import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { TEXT_FONTS } from "@/lib/mockupProducts";

const COLORS = ["#1c1917", "#ffffff", "#92400e", "#b91c1c", "#1d4ed8", "#15803d", "#c026d3"];

export default function LayerControls({ layer, onChange, onDelete }) {
  if (!layer) {
    return <p className="text-xs text-stone-500">Add an image or text, then tap it on the garment to adjust it.</p>;
  }

  return (
    <div className="space-y-4">
      {layer.type === "text" && (
        <>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Text</p>
            <Input value={layer.text} onChange={(e) => onChange({ text: e.target.value })} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Font</p>
            <div className="flex gap-2">
              {TEXT_FONTS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onChange({ font: f.value })}
                  style={{ fontFamily: f.value }}
                  className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${
                    layer.font === f.value ? "border-stone-900 text-stone-900" : "border-stone-300 text-stone-500"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1.5">Colour</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    layer.color === c ? "ring-2 ring-offset-2 ring-stone-900 border-transparent" : "border-stone-300"
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">
          {layer.type === "text" ? "Size" : "Scale"}
        </p>
        <Slider
          value={[layer.width]}
          min={layer.type === "text" ? 8 : 5}
          max={layer.type === "text" ? 96 : 90}
          step={1}
          onValueChange={([v]) => onChange({ width: v })}
        />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Rotation</p>
        <Slider
          value={[layer.rotation || 0]}
          min={-180}
          max={180}
          step={1}
          onValueChange={([v]) => onChange({ rotation: v })}
        />
      </div>

      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-red-800 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Remove this element
      </button>
    </div>
  );
}